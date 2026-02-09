import { Star, User } from "lucide-react";
import { format } from "date-fns";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title?: string;
    content?: string;
    response?: string;
    response_at?: string;
    created_at: string;
    profiles?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            {review.profiles?.avatar_url ? (
              <img 
                src={review.profiles.avatar_url} 
                alt="Reviewer" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {review.profiles?.full_name || "Anonymous Guest"}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(review.created_at), 'MMMM yyyy')}
            </p>
          </div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= review.rating
                  ? "fill-warning text-warning"
                  : "text-muted-foreground"
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Review Content */}
      {review.title && (
        <h4 className="font-semibold text-foreground">{review.title}</h4>
      )}
      
      {review.content && (
        <p className="text-muted-foreground leading-relaxed">{review.content}</p>
      )}
      
      {/* Provider Response */}
      {review.response && (
        <div className="mt-4 ml-4 pl-4 border-l-2 border-primary/30 bg-secondary/30 p-3 rounded-r-lg">
          <p className="text-sm font-medium text-foreground mb-1">Response from host</p>
          <p className="text-sm text-muted-foreground">{review.response}</p>
          {review.response_at && (
            <p className="text-xs text-muted-foreground mt-2">
              {format(new Date(review.response_at), 'MMMM d, yyyy')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
