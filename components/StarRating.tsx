import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // Expects 0-10
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, className = "" }) => {
  const roundedRating = Math.round(rating / 2); // Map 0-10 to 0-5 stars
  
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star 
          key={i} 
          className={`w-4 h-4 ${i <= roundedRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} 
        />
      ))}
    </div>
  );
};

export default StarRating;
