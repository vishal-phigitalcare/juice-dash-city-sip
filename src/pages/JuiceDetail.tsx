
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { JuiceItem, CupSize } from '@/types/models';
import { getJuiceById } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { Label } from '@/components/ui/label';
import JuiceCard from '@/components/JuiceCard';

const sizeLabels = {
  [CupSize.SMALL]: 'Small (250ml)',
  [CupSize.MEDIUM]: 'Medium (400ml)',
  [CupSize.LARGE]: 'Large (550ml)'
};

const JuiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [juice, setJuice] = useState<JuiceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<CupSize | null>(null);
  const [relatedJuices, setRelatedJuices] = useState<JuiceItem[]>([]);
  
  useEffect(() => {
    const fetchJuice = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const juiceData = await getJuiceById(id);
        
        if (juiceData) {
          setJuice(juiceData);
          
          // Set default selected size to the first available size
          const firstAvailableSize = juiceData.variants
            .find(variant => variant.isAvailable)?.size;
          
          if (firstAvailableSize) {
            setSelectedSize(firstAvailableSize);
          }
          
          // Fetch related juices (mock implementation)
          // In a real app, you would fetch related juices based on category
          setRelatedJuices([
            {
              id: 'juice2',
              name: 'Watermelon Cooler',
              description: 'Refreshing watermelon juice perfect for hot summer days.',
              image: 'https://images.unsplash.com/photo-1527102298867-a405a0ecc112?q=80&w=1000',
              categoryId: 'cat1',
              variants: [
                { size: CupSize.SMALL, price: 70, isAvailable: true },
                { size: CupSize.MEDIUM, price: 110, isAvailable: true },
                { size: CupSize.LARGE, price: 140, isAvailable: true }
              ],
              isAvailable: true,
              isFeatured: false
            },
            {
              id: 'juice5',
              name: 'Berry Blast',
              description: 'A mix of strawberries, blueberries, and raspberries rich in antioxidants.',
              image: 'https://images.unsplash.com/photo-1546173159-315724a31696?q=80&w=1000',
              categoryId: 'cat3',
              variants: [
                { size: CupSize.SMALL, price: 95, isAvailable: true },
                { size: CupSize.MEDIUM, price: 135, isAvailable: true },
                { size: CupSize.LARGE, price: 175, isAvailable: true }
              ],
              isAvailable: true,
              isFeatured: true
            },
            {
              id: 'juice7',
              name: 'Banana Berry Smoothie',
              description: 'Creamy smoothie with banana, mixed berries, and yogurt.',
              image: 'https://images.unsplash.com/photo-1553787499-6f9133242796?q=80&w=1000',
              categoryId: 'cat4',
              variants: [
                { size: CupSize.SMALL, price: 110, isAvailable: true },
                { size: CupSize.MEDIUM, price: 150, isAvailable: true },
                { size: CupSize.LARGE, price: 190, isAvailable: true }
              ],
              isAvailable: true,
              isFeatured: true
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching juice:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJuice();
  }, [id]);
  
  const handleAddToCart = () => {
    if (!juice || !selectedSize) return;
    
    const selectedVariant = juice.variants.find(v => v.size === selectedSize);
    if (!selectedVariant) return;
    
    addToCart({
      juiceId: juice.id,
      juiceName: juice.name,
      image: juice.image,
      size: selectedSize,
      price: selectedVariant.price
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading juice details...</p>
        </div>
      </div>
    );
  }
  
  if (!juice) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Juice Not Found</h2>
        <p className="text-gray-600 mb-8">The juice you're looking for doesn't exist or has been removed.</p>
        <Button 
          onClick={() => navigate('/menu')}
          className="bg-primary-500 hover:bg-primary-600"
        >
          Back to Menu
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="text-gray-600"
        >
          Back
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-lg overflow-hidden shadow-md">
          <img 
            src={juice.image} 
            alt={juice.name} 
            className="w-full h-64 md:h-96 object-cover"
          />
        </div>
        
        <div>
          {juice.isFeatured && (
            <span className="inline-block bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
              Featured
            </span>
          )}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{juice.name}</h1>
          <p className="text-gray-600 mb-6">{juice.description}</p>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Select Size</h3>
            <RadioGroup value={selectedSize || ''} onValueChange={(value) => setSelectedSize(value as CupSize)}>
              <div className="grid grid-cols-1 gap-3">
                {juice.variants.map((variant) => (
                  <Label
                    key={variant.size}
                    htmlFor={variant.size}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors 
                      ${variant.isAvailable 
                        ? (variant.size === selectedSize 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'hover:border-primary-200 hover:bg-primary-50/50') 
                        : 'opacity-50 cursor-not-allowed bg-gray-100'}`}
                  >
                    <div className="flex items-center">
                      <RadioGroupItem 
                        value={variant.size} 
                        id={variant.size} 
                        disabled={!variant.isAvailable}
                      />
                      <span className="ml-3">{sizeLabels[variant.size]}</span>
                    </div>
                    <span className="font-medium">₹{variant.price}</span>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </div>
          
          <Button 
            onClick={handleAddToCart}
            className="w-full bg-primary-500 hover:bg-primary-600 py-6 text-lg"
            disabled={!selectedSize}
          >
            Add to Cart
          </Button>
        </div>
      </div>
      
      {/* Related Juices */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">You May Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {relatedJuices.map(relatedJuice => (
            <JuiceCard key={relatedJuice.id} juice={relatedJuice} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default JuiceDetail;
