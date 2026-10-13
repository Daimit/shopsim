import React from 'react';
import { RatingStars } from './RatingStars';
import { CheckCircle2, ThumbsUp } from 'lucide-react';

interface ProductReviewsProps {
  rating: number;
  reviewCount: number;
}

const SAMPLE_REVIEWS = [
  {
    id: 'rev-1',
    author: 'Sarah Jenkins',
    rating: 5,
    date: '3 days ago',
    title: 'Exceeded my expectations entirely!',
    comment: 'The build quality and responsiveness are top-tier. Extremely smooth daily experience and battery life easily lasts beyond my longest work days.',
    verified: true,
    helpful: 24
  },
  {
    id: 'rev-2',
    author: 'Marcus Rivera',
    rating: 5,
    date: '2 weeks ago',
    title: 'Fantastic design and ergonomics',
    comment: 'Setup took under a minute. Feels premium in every aspect and works flawlessly with all my other devices.',
    verified: true,
    helpful: 12
  },
  {
    id: 'rev-3',
    author: 'Emily Chen',
    rating: 4,
    date: '1 month ago',
    title: 'Great overall value, minor quibbles',
    comment: 'Very solid overall performance. Minor gripe with default packaging, but once unboxed, performance is first rate.',
    verified: true,
    helpful: 8
  },
  {
    id: 'rev-4',
    author: 'David Wright',
    rating: 4.5,
    date: '1 month ago',
    title: 'Highly recommend for professional use',
    comment: 'Bought this after careful comparison with competitor models. Outstanding decision, delivers exactly what was advertised.',
    verified: true,
    helpful: 15
  }
];

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  rating,
  reviewCount
}) => {
  return (
    <div className="space-y-8">
      {/* Overview Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row gap-8 items-center">
        <div className="text-center md:text-left shrink-0">
          <div className="text-5xl font-black text-slate-900 mb-1">{rating.toFixed(1)}</div>
          <RatingStars rating={rating} showNumber={false} size="md" />
          <p className="text-xs text-slate-500 mt-1">Based on {reviewCount} customer reviews</p>
        </div>

        {/* Rating Breakdown bars */}
        <div className="flex-1 w-full space-y-2">
          {[
            { stars: '5 Star', pct: '78%' },
            { stars: '4 Star', pct: '15%' },
            { stars: '3 Star', pct: '4%' },
            { stars: '2 Star', pct: '2%' },
            { stars: '1 Star', pct: '1%' },
          ].map((bar) => (
            <div key={bar.stars} className="flex items-center gap-3 text-xs">
              <span className="w-12 text-slate-600 font-medium">{bar.stars}</span>
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: bar.pct }}
                ></div>
              </div>
              <span className="w-8 text-slate-400 text-right">{bar.pct}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review list */}
      <div className="space-y-4">
        {SAMPLE_REVIEWS.map((review) => (
          <div
            key={review.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 text-sm">{review.author}</span>
                {review.verified && (
                  <span className="flex items-center gap-0.5 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Buyer
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">{review.date}</span>
            </div>

            <div>
              <RatingStars rating={review.rating} showNumber={false} size="sm" />
              <h4 className="font-semibold text-slate-900 text-sm mt-1">{review.title}</h4>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>

            <div className="pt-2 flex items-center text-xs text-slate-400 gap-1">
              <button
                type="button"
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                data-track={`helpful_review_${review.id}`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Helpful ({review.helpful})</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
