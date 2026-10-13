import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  reviewCount,
  size = 'sm',
  showNumber = true
}) => {
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const safeRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;

  return (
    <div className="flex items-center gap-1.5 text-amber-500">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = safeRating >= star;
          const half = !filled && safeRating >= star - 0.5;

          return (
            <span key={star} className="relative inline-block">
              <Star
                className={`${iconSizes[size]} ${
                  filled
                    ? 'fill-amber-400 text-amber-400'
                    : half
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'text-slate-300'
                }`}
              />
            </span>
          );
        })}
      </div>

      {showNumber && (
        <span className={`font-semibold text-slate-700 ${textSizes[size]}`}>
          {safeRating.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className={`text-slate-400 ${textSizes[size]}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
