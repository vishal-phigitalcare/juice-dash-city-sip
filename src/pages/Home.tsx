
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import JuiceCard from '@/components/JuiceCard';
import { JuiceItem, Category } from '@/types/models';
import { getFeaturedJuices, getCategories } from '@/services/api';
import { useIsMobile } from '@/hooks/use-mobile';

const Home: React.FC = () => {
  const [featuredJuices, setFeaturedJuices] = useState<JuiceItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [juicesData, categoriesData] = await Promise.all([
          getFeaturedJuices(),
          getCategories()
        ]);
        setFeaturedJuices(juicesData);
        setCategories(categoriesData.filter(cat => cat.isActive));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section */}
      <section className="relative bg-primary-100 rounded-2xl overflow-hidden mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/80 to-primary-700/80 z-10"></div>
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?q=80&w=1000" 
            alt="Fresh Juices" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-20 py-12 px-6 md:py-20 md:px-12 max-w-3xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Fresh Juices Delivered To Your Doorstep
          </h1>
          <p className="text-white/90 text-lg mb-8 max-w-lg">
            Enjoy the goodness of fresh and healthy juices made with premium quality fruits and vegetables.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => navigate('/menu')}
              className="bg-secondary-500 hover:bg-secondary-600 text-white font-medium px-6 py-2 rounded-lg"
              size="lg"
            >
              Order Now
            </Button>
            <Button 
              onClick={() => navigate('/menu')}
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white"
              size="lg"
            >
              Explore Menu
            </Button>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
          <Button
            variant="link"
            onClick={() => navigate('/menu')}
            className="text-primary-600"
          >
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map(category => (
            <div
              key={category.id}
              className="relative group cursor-pointer rounded-lg overflow-hidden"
              onClick={() => navigate(`/menu?category=${category.id}`)}
            >
              <div className="h-36 overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <h3 className="text-white font-medium p-4">{category.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Featured Juices Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Featured Juices</h2>
          <Button
            variant="link"
            onClick={() => navigate('/menu')}
            className="text-primary-600"
          >
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredJuices.map(juice => (
            <JuiceCard key={juice.id} juice={juice} />
          ))}
        </div>
      </section>
      
      {/* Why Choose Us Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Choose Us</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Freshly Made</h3>
            <p className="text-gray-600">Our juices are freshly squeezed after you place your order.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Quick Delivery</h3>
            <p className="text-gray-600">We deliver your order in 30 minutes or less to ensure freshness.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Hygienic Process</h3>
            <p className="text-gray-600">We follow strict hygiene protocols to ensure the safety of our products.</p>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="bg-primary-500 rounded-lg p-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to order your healthy juice?</h2>
        <p className="text-white/90 mb-6 max-w-xl mx-auto">
          Browse our menu and get your favorite juice delivered to your doorstep.
        </p>
        <Button 
          onClick={() => navigate('/menu')}
          className="bg-white text-primary-600 hover:bg-gray-100"
          size="lg"
        >
          Order Now
        </Button>
      </section>
    </div>
  );
};

export default Home;
