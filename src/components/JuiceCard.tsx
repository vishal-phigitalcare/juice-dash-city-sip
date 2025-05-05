
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JuiceItem, CupSize } from '@/types/models';
import { useNavigate } from 'react-router-dom';

interface JuiceCardProps {
  juice: JuiceItem;
  compact?: boolean;
}

const JuiceCard: React.FC<JuiceCardProps> = ({ juice, compact = false }) => {
  const navigate = useNavigate();
  
  // Get the cheapest available variant
  const cheapestVariant = juice.variants
    .filter(v => v.isAvailable)
    .sort((a, b) => a.price - b.price)[0];

  const handleClick = () => {
    navigate(`/juice/${juice.id}`);
  };

  if (compact) {
    return (
      <Card 
        className="juice-card cursor-pointer h-full flex flex-col"
        onClick={handleClick}
      >
        <div className="h-32 bg-gray-200 relative overflow-hidden">
          <img 
            src={juice.image} 
            alt={juice.name} 
            className="w-full h-full object-cover"
          />
          {juice.isFeatured && (
            <div className="absolute top-2 left-2 bg-secondary-500 text-white text-xs px-2 py-1 rounded-full">
              Featured
            </div>
          )}
        </div>
        <CardContent className="flex flex-col justify-between flex-grow p-3">
          <div>
            <h3 className="font-semibold text-sm text-gray-800 line-clamp-1">{juice.name}</h3>
            <p className="text-xs text-gray-500 line-clamp-1 mt-1">{juice.description}</p>
          </div>
          {cheapestVariant && (
            <p className="text-sm font-medium text-primary-600 mt-2">
              From ₹{cheapestVariant.price}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="juice-card h-full flex flex-col">
      <div className="h-48 bg-gray-200 relative overflow-hidden">
        <img 
          src={juice.image} 
          alt={juice.name} 
          className="w-full h-full object-cover"
        />
        {juice.isFeatured && (
          <div className="absolute top-2 left-2 bg-secondary-500 text-white text-xs px-2 py-1 rounded-full">
            Featured
          </div>
        )}
      </div>
      <CardContent className="flex flex-col flex-grow p-4">
        <h3 className="font-semibold text-gray-800 mb-1">{juice.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{juice.description}</p>
        {cheapestVariant && (
          <p className="text-sm font-medium text-primary-600 mb-3">
            From ₹{cheapestVariant.price}
          </p>
        )}
        <div className="mt-auto">
          <Button 
            onClick={handleClick}
            className="w-full bg-primary-500 hover:bg-primary-600"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JuiceCard;
