-- Create reviews table for ratings and reviews
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  service_type service_type NOT NULL,
  service_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  response TEXT,
  response_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to ensure one review per booking
CREATE UNIQUE INDEX idx_reviews_booking_unique ON public.reviews(booking_id);

-- Create index for service lookups
CREATE INDEX idx_reviews_service ON public.reviews(service_type, service_id);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Users can create reviews for their completed bookings"
ON public.reviews FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.id = reviews.booking_id 
    AND bookings.user_id = auth.uid()
    AND bookings.status = 'completed'
  )
);

CREATE POLICY "Users can update their own reviews"
ON public.reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Providers can respond to reviews"
ON public.reviews FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.providers p ON b.provider_id = p.id
    WHERE b.id = reviews.booking_id
    AND p.user_id = auth.uid()
  )
);

-- Trigger to update updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update service ratings when a review is added
CREATE OR REPLACE FUNCTION public.update_service_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update accommodation rating
  IF NEW.service_type = 'accommodation' THEN
    UPDATE public.accommodations
    SET 
      rating = (SELECT AVG(rating)::NUMERIC(3,2) FROM public.reviews WHERE service_type = 'accommodation' AND service_id = NEW.service_id),
      reviews_count = (SELECT COUNT(*) FROM public.reviews WHERE service_type = 'accommodation' AND service_id = NEW.service_id)
    WHERE id = NEW.service_id;
  -- Update ride rating  
  ELSIF NEW.service_type = 'ride' THEN
    UPDATE public.rides
    SET 
      rating = (SELECT AVG(rating)::NUMERIC(3,2) FROM public.reviews WHERE service_type = 'ride' AND service_id = NEW.service_id),
      reviews_count = (SELECT COUNT(*) FROM public.reviews WHERE service_type = 'ride' AND service_id = NEW.service_id)
    WHERE id = NEW.service_id;
  -- Update event hall rating
  ELSIF NEW.service_type = 'event_hall' THEN
    UPDATE public.event_halls
    SET 
      rating = (SELECT AVG(rating)::NUMERIC(3,2) FROM public.reviews WHERE service_type = 'event_hall' AND service_id = NEW.service_id),
      reviews_count = (SELECT COUNT(*) FROM public.reviews WHERE service_type = 'event_hall' AND service_id = NEW.service_id)
    WHERE id = NEW.service_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update ratings on review changes
CREATE TRIGGER update_rating_on_review
  AFTER INSERT OR UPDATE OF rating ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_service_rating();