
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Category, JuiceItem, CupSize, JuiceVariant } from '@/types/models';
import { 
  getCategories, 
  getJuices, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  createJuice,
  updateJuice,
  deleteJuice 
} from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Search, MoreVertical, Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

const MenuManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check for admin access first - moved before any other hooks
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);
  
  const [juices, setJuices] = useState<JuiceItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('juices');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Form states for edit/create dialogs
  const [isEditJuiceOpen, setIsEditJuiceOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [selectedJuice, setSelectedJuice] = useState<JuiceItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // New juice form state
  const [newJuice, setNewJuice] = useState<{
    name: string;
    description: string;
    image: string;
    categoryId: string;
    isAvailable: boolean;
    isFeatured: boolean;
    variants: JuiceVariant[];
  }>({
    name: '',
    description: '',
    image: '',
    categoryId: '',
    isAvailable: true,
    isFeatured: false,
    variants: [
      { size: CupSize.SMALL, price: 0, isAvailable: true },
      { size: CupSize.MEDIUM, price: 0, isAvailable: true },
      { size: CupSize.LARGE, price: 0, isAvailable: true }
    ]
  });
  
  // New category form state
  const [newCategory, setNewCategory] = useState<{
    name: string;
    image: string;
    isActive: boolean;
  }>({
    name: '',
    image: '',
    isActive: true
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [juicesData, categoriesData] = await Promise.all([
          getJuices(),
          getCategories()
        ]);
        
        setJuices(juicesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching menu data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch data if user is admin
    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [user]);
  
  // Filter juices based on search and category filter
  const filteredJuices = juices.filter(juice => {
    const searchMatch = 
      juice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      juice.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const categoryMatch = 
      categoryFilter === 'all' || 
      juice.categoryId === categoryFilter;
    
    return searchMatch && categoryMatch;
  });
  
  // Filter categories based on search
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };
  
  // Handle juice operations
  const handleEditJuice = (juice: JuiceItem) => {
    setSelectedJuice(juice);
    setNewJuice({
      name: juice.name,
      description: juice.description,
      image: juice.image,
      categoryId: juice.categoryId,
      isAvailable: juice.isAvailable,
      isFeatured: juice.isFeatured,
      variants: [...juice.variants]
    });
    setIsEditJuiceOpen(true);
  };
  
  const handleCreateJuice = () => {
    setSelectedJuice(null);
    setNewJuice({
      name: '',
      description: '',
      image: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      isAvailable: true,
      isFeatured: false,
      variants: [
        { size: CupSize.SMALL, price: 0, isAvailable: true },
        { size: CupSize.MEDIUM, price: 0, isAvailable: true },
        { size: CupSize.LARGE, price: 0, isAvailable: true }
      ]
    });
    setIsEditJuiceOpen(true);
  };
  
  const handleDeleteJuice = async (juiceId: string) => {
    try {
      await deleteJuice(juiceId);
      setJuices(prevJuices => prevJuices.filter(juice => juice.id !== juiceId));
      toast.success('Juice deleted successfully');
    } catch (error) {
      toast.error('Failed to delete juice');
      console.error('Error deleting juice:', error);
    }
  };
  
  const handleSaveJuice = async () => {
    try {
      if (!newJuice.name || !newJuice.description || !newJuice.image || !newJuice.categoryId) {
        toast.error('Please fill all required fields');
        return;
      }
      
      if (newJuice.variants.some(v => v.price <= 0 && v.isAvailable)) {
        toast.error('Price must be greater than 0 for available variants');
        return;
      }
      
      if (selectedJuice) {
        // Update existing juice
        const updatedJuice = await updateJuice({
          ...selectedJuice,
          name: newJuice.name,
          description: newJuice.description,
          image: newJuice.image,
          categoryId: newJuice.categoryId,
          isAvailable: newJuice.isAvailable,
          isFeatured: newJuice.isFeatured,
          variants: newJuice.variants
        });
        
        setJuices(prevJuices => 
          prevJuices.map(juice => 
            juice.id === updatedJuice.id ? updatedJuice : juice
          )
        );
        
        toast.success('Juice updated successfully');
      } else {
        // Create new juice
        const createdJuice = await createJuice(newJuice);
        setJuices(prevJuices => [...prevJuices, createdJuice]);
        toast.success('Juice created successfully');
      }
      
      setIsEditJuiceOpen(false);
    } catch (error) {
      toast.error('Failed to save juice');
      console.error('Error saving juice:', error);
    }
  };
  
  const handleVariantPriceChange = (size: CupSize, price: number) => {
    setNewJuice(prev => ({
      ...prev,
      variants: prev.variants.map(variant => 
        variant.size === size ? { ...variant, price } : variant
      )
    }));
  };
  
  const handleVariantAvailabilityChange = (size: CupSize, isAvailable: boolean) => {
    setNewJuice(prev => ({
      ...prev,
      variants: prev.variants.map(variant => 
        variant.size === size ? { ...variant, isAvailable } : variant
      )
    }));
  };
  
  // Handle category operations
  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setNewCategory({
      name: category.name,
      image: category.image,
      isActive: category.isActive
    });
    setIsEditCategoryOpen(true);
  };
  
  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setNewCategory({
      name: '',
      image: '',
      isActive: true
    });
    setIsEditCategoryOpen(true);
  };
  
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      // Check if category is used by any juice
      const juicesInCategory = juices.filter(juice => juice.categoryId === categoryId);
      
      if (juicesInCategory.length > 0) {
        toast.error(`Cannot delete category. It is used by ${juicesInCategory.length} juices.`);
        return;
      }
      
      await deleteCategory(categoryId);
      setCategories(prevCategories => 
        prevCategories.filter(category => category.id !== categoryId)
      );
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error('Failed to delete category');
      console.error('Error deleting category:', error);
    }
  };
  
  const handleSaveCategory = async () => {
    try {
      if (!newCategory.name || !newCategory.image) {
        toast.error('Please fill all required fields');
        return;
      }
      
      if (selectedCategory) {
        // Update existing category
        const updatedCategory = await updateCategory({
          ...selectedCategory,
          name: newCategory.name,
          image: newCategory.image,
          isActive: newCategory.isActive
        });
        
        setCategories(prevCategories => 
          prevCategories.map(category => 
            category.id === updatedCategory.id ? updatedCategory : category
          )
        );
        
        toast.success('Category updated successfully');
      } else {
        // Create new category
        const createdCategory = await createCategory(newCategory);
        setCategories(prevCategories => [...prevCategories, createdCategory]);
        toast.success('Category created successfully');
      }
      
      setIsEditCategoryOpen(false);
    } catch (error) {
      toast.error('Failed to save category');
      console.error('Error saving category:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu data...</p>
        </div>
      </div>
    );
  }
  
  // Guard against rendering if user is not admin
  if (!user || user.role !== 'admin') {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Menu Management</h1>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={`Search ${activeTab === 'juices' ? 'juices' : 'categories'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {activeTab === 'juices' && (
              <div>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="juices">Juices</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          
          <Button 
            onClick={activeTab === 'juices' ? handleCreateJuice : handleCreateCategory}
            className="bg-primary-500 hover:bg-primary-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add {activeTab === 'juices' ? 'Juice' : 'Category'}
          </Button>
        </div>
        
        <TabsContent value="juices" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJuices.length > 0 ? (
              filteredJuices.map(juice => (
                <Card key={juice.id} className="overflow-hidden">
                  <div className="h-40 bg-gray-200 relative">
                    <img 
                      src={juice.image} 
                      alt={juice.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="bg-white/80 h-8 w-8 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditJuice(juice)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteJuice(juice.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {juice.isFeatured && (
                        <Badge className="bg-secondary-500">Featured</Badge>
                      )}
                      {!juice.isAvailable && (
                        <Badge variant="destructive">Unavailable</Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <Badge variant="outline">{getCategoryName(juice.categoryId)}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{juice.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{juice.description}</p>
                    
                    <div className="space-y-1 text-sm">
                      {juice.variants.map(variant => (
                        <div key={variant.size} className="flex justify-between">
                          <span>{variant.size} {!variant.isAvailable && <span className="text-red-500">(Unavailable)</span>}</span>
                          <span className="font-medium">₹{variant.price}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">No juices found</h2>
                <p className="text-gray-600 mb-6">
                  {searchTerm || categoryFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Add your first juice to get started'}
                </p>
                <Button 
                  onClick={handleCreateJuice}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Juice
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="categories" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.length > 0 ? (
              filteredCategories.map(category => (
                <Card key={category.id} className="overflow-hidden">
                  <div className="h-40 bg-gray-200 relative">
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="bg-white/80 h-8 w-8 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="absolute top-2 left-2">
                      {!category.isActive && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                    
                    <div className="mt-2 flex items-center text-sm text-gray-600">
                      <span>
                        {juices.filter(juice => juice.categoryId === category.id).length} juices in this category
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">No categories found</h2>
                <p className="text-gray-600 mb-6">
                  {searchTerm
                    ? 'Try adjusting your search'
                    : 'Add your first category to get started'}
                </p>
                <Button 
                  onClick={handleCreateCategory}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Edit Juice Dialog */}
      <Dialog open={isEditJuiceOpen} onOpenChange={setIsEditJuiceOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJuice ? 'Edit Juice' : 'Add New Juice'}</DialogTitle>
            <DialogDescription>
              {selectedJuice 
                ? 'Update the juice details below' 
                : 'Fill in the details for the new juice'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Juice Name *</Label>
                <Input 
                  id="name" 
                  value={newJuice.name} 
                  onChange={(e) => setNewJuice({...newJuice, name: e.target.value})}
                  placeholder="e.g. Fresh Orange Juice"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea 
                  id="description" 
                  value={newJuice.description} 
                  onChange={(e) => setNewJuice({...newJuice, description: e.target.value})}
                  placeholder="Describe the juice..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Image URL *</Label>
                <Input 
                  id="image" 
                  value={newJuice.image} 
                  onChange={(e) => setNewJuice({...newJuice, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
                {newJuice.image && (
                  <div className="mt-2 h-40 bg-gray-100 rounded overflow-hidden">
                    <img 
                      src={newJuice.image} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Error'}
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={newJuice.categoryId}
                  onValueChange={(value) => setNewJuice({...newJuice, categoryId: value})}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Variants and Pricing *</Label>
                <div className="space-y-4">
                  {newJuice.variants.map((variant, index) => (
                    <div key={variant.size} className="flex items-center space-x-4 p-3 border rounded-md">
                      <div className="flex-grow">
                        <Label htmlFor={`price-${variant.size}`}>{variant.size} Price (₹)</Label>
                        <Input
                          id={`price-${variant.size}`}
                          type="number"
                          value={variant.price}
                          onChange={(e) => handleVariantPriceChange(variant.size, parseInt(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`available-${variant.size}`}
                          checked={variant.isAvailable}
                          onCheckedChange={(checked) => 
                            handleVariantAvailabilityChange(variant.size, checked === true)
                          }
                        />
                        <Label htmlFor={`available-${variant.size}`}>Available</Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isAvailable"
                    checked={newJuice.isAvailable}
                    onCheckedChange={(checked) => 
                      setNewJuice({...newJuice, isAvailable: checked === true})
                    }
                  />
                  <Label htmlFor="isAvailable">Available on Menu</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFeatured"
                    checked={newJuice.isFeatured}
                    onCheckedChange={(checked) => 
                      setNewJuice({...newJuice, isFeatured: checked === true})
                    }
                  />
                  <Label htmlFor="isFeatured">Featured Item</Label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditJuiceOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveJuice}
              className="bg-primary-500 hover:bg-primary-600"
            >
              {selectedJuice ? 'Update Juice' : 'Add Juice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {selectedCategory 
                ? 'Update the category details below' 
                : 'Fill in the details for the new category'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name *</Label>
                <Input 
                  id="categoryName" 
                  value={newCategory.name} 
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  placeholder="e.g. Fruit Juices"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categoryImage">Image URL *</Label>
                <Input 
                  id="categoryImage" 
                  value={newCategory.image} 
                  onChange={(e) => setNewCategory({...newCategory, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
                {newCategory.image && (
                  <div className="mt-2 h-40 bg-gray-100 rounded overflow-hidden">
                    <img 
                      src={newCategory.image} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Error'}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="categoryIsActive"
                  checked={newCategory.isActive}
                  onCheckedChange={(checked) => 
                    setNewCategory({...newCategory, isActive: checked === true})
                  }
                />
                <Label htmlFor="categoryIsActive">Active Category</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditCategoryOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCategory}
              className="bg-primary-500 hover:bg-primary-600"
            >
              {selectedCategory ? 'Update Category' : 'Add Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManagement;
