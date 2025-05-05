
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JuiceCard from '@/components/JuiceCard';
import { JuiceItem, Category } from '@/types/models';
import { getJuices, getCategories, getJuicesByCategory } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const Menu: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [juices, setJuices] = useState<JuiceItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(categoryParam || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData.filter(cat => cat.isActive));

        if (categoryParam) {
          const juicesData = await getJuicesByCategory(categoryParam);
          setJuices(juicesData);
          setActiveTab(categoryParam);
        } else {
          const juicesData = await getJuices();
          setJuices(juicesData.filter(juice => juice.isAvailable));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryParam]);

  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    setLoading(true);
    
    try {
      if (value === 'all') {
        const juicesData = await getJuices();
        setJuices(juicesData.filter(juice => juice.isAvailable));
        setSearchParams({});
      } else {
        const juicesData = await getJuicesByCategory(value);
        setJuices(juicesData);
        setSearchParams({ category: value });
      }
    } catch (error) {
      console.error('Error fetching juices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJuices = juices.filter(juice => 
    juice.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Menu</h1>
        <p className="text-gray-600 max-w-2xl">
          Explore our wide range of freshly made juices, smoothies and health boosters.
        </p>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          type="text"
          placeholder="Search juices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="mb-8">
        <TabsList className="mb-6 flex overflow-x-auto pb-2 space-x-2">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {filteredJuices.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredJuices.map(juice => (
                <JuiceCard key={juice.id} juice={juice} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No juices found. Please try another search or category.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Menu;
