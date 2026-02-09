import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type ServiceType = Database["public"]["Enums"]["service_type"];

interface ReviewFormProps {
  bookingId: string;
  serviceType: ServiceType;
  serviceId: string;
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ReviewForm = ({
  bookingId,
  serviceType,
  serviceId,
  userId,
  onSuccess,
  onCancel,
}: ReviewFormProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        booking_id: bookingId,
        service_type: serviceType,
        service_id: serviceId,
        user_id: userId,
        rating,
        title: title || null,
        content: content || null,
      });

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Thank you for sharing your experience!",
      });
      
      onSuccess();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-border rounded-lg bg-card">
      <h3 className="text-lg font-semibold text-foreground">Write a Review</h3>
      
      {/* Rating Stars */}
      <div>
        <Label className="mb-2 block">Your Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-warning text-warning"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {rating === 0 && "Select a rating"}
          {rating === 1 && "Poor"}
          {rating === 2 && "Fair"}
          {rating === 3 && "Good"}
          {rating === 4 && "Very Good"}
          {rating === 5 && "Excellent"}
        </p>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="review-title">Title (Optional)</Label>
        <Input
          id="review-title"
          placeholder="Summarize your experience"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Content */}
      <div>
        <Label htmlFor="review-content">Your Review (Optional)</Label>
        <Textarea
          id="review-content"
          placeholder="Share details of your experience..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1"
          rows={4}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting || rating === 0}>
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
