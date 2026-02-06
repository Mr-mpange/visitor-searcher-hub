-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'provider', 'user');

-- Create enum for service types
CREATE TYPE public.service_type AS ENUM ('accommodation', 'ride', 'event_hall');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Create enum for listing status
CREATE TYPE public.listing_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create providers table for service provider details
CREATE TABLE public.providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    business_name TEXT NOT NULL,
    business_description TEXT,
    business_phone TEXT,
    business_email TEXT,
    business_address TEXT,
    logo_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create accommodations table
CREATE TABLE public.accommodations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    beds INTEGER DEFAULT 1,
    max_guests INTEGER DEFAULT 2,
    amenities TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    status listing_status DEFAULT 'draft',
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create rides table
CREATE TABLE public.rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    price_per_km DECIMAL(10,2) DEFAULT 0,
    seats INTEGER DEFAULT 4,
    features TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    status listing_status DEFAULT 'draft',
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create event_halls table
CREATE TABLE public.event_halls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    price_per_hour DECIMAL(10,2) NOT NULL,
    price_per_day DECIMAL(10,2),
    capacity INTEGER DEFAULT 100,
    amenities TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    status listing_status DEFAULT 'draft',
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    service_type service_type NOT NULL,
    service_id UUID NOT NULL,
    check_in DATE,
    check_out DATE,
    start_date DATE,
    end_date DATE,
    guests INTEGER DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    status booking_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON public.providers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_accommodations_updated_at BEFORE UPDATE ON public.accommodations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON public.rides
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_event_halls_updated_at BEFORE UPDATE ON public.event_halls
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles (only admins can manage roles)
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for providers
CREATE POLICY "Anyone can view verified providers" ON public.providers
    FOR SELECT USING (verified = true);
CREATE POLICY "Users can view their own provider profile" ON public.providers
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own provider profile" ON public.providers
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own provider profile" ON public.providers
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all providers" ON public.providers
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for accommodations
CREATE POLICY "Anyone can view approved accommodations" ON public.accommodations
    FOR SELECT USING (status = 'approved');
CREATE POLICY "Providers can view own accommodations" ON public.accommodations
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.providers WHERE id = accommodations.provider_id AND user_id = auth.uid())
    );
CREATE POLICY "Providers can create accommodations" ON public.accommodations
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.providers WHERE id = accommodations.provider_id AND user_id = auth.uid())
    );
CREATE POLICY "Providers can update own accommodations" ON public.accommodations
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.providers WHERE id = accommodations.provider_id AND user_id = auth.uid())
    );
CREATE POLICY "Providers can delete own accommodations" ON public.accommodations
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.providers WHERE id = accommodations.provider_id AND user_id = auth.uid())
    );
CREATE POLICY "Admins can manage all accommodations" ON public.accommodations
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for rides (same pattern as accommodations)
CREATE POLICY "Anyone can view approved rides" ON public.rides
    FOR SELECT USING (status = 'approved');
CREATE POLICY "Providers can view own rides" ON public.rides
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.providers WHERE id = rides.provider_id AND user_id = auth.uid())
    );
CREATE POLICY "Providers can create rides" ON public.rides
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.providers WHERE id = rides.provider_id AND user_id = auth.uid())
    );
CREATE POLICY "Providers can update own rides" ON public.rides
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.providers WHERE id = rides.provider_id AND user_id = auth.uid())
    );
CREATE POLICY "Providers can delete own rides" ON public.rides
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.providers WHERE id = rides.provider_id AND user_id = auth.uid())
    );
CREATE POLICY "Admins can manage all rides" ON public.rides
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for event_halls (same pattern as accommodations)
CREATE POLICY "Anyone can view approved event_halls" ON public.event_halls
    FOR SELECT USING (status = 'approved');
CREATE POLICY "Providers can view own event_halls" ON public.event_halls
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.providers WHERE id = event_halls.provider_id AND user_id = auth.uid())
    );
CREATE POLICY "Providers can create event_halls" ON public.event_halls
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.providers WHERE id = event_halls.provider_id AND user_id = auth.uid())
    );
CREATE POLICY "Providers can update own event_halls" ON public.event_halls
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.providers WHERE id = event_halls.provider_id AND user_id = auth.uid())
    );
CREATE POLICY "Providers can delete own event_halls" ON public.event_halls
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.providers WHERE id = event_halls.provider_id AND user_id = auth.uid())
    );
CREATE POLICY "Admins can manage all event_halls" ON public.event_halls
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Providers can view bookings for their services" ON public.bookings
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.providers WHERE id = bookings.provider_id AND user_id = auth.uid())
    );
CREATE POLICY "Users can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pending bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Providers can update booking status" ON public.bookings
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.providers WHERE id = bookings.provider_id AND user_id = auth.uid())
    );
CREATE POLICY "Admins can manage all bookings" ON public.bookings
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_accommodations_provider ON public.accommodations(provider_id);
CREATE INDEX idx_accommodations_status ON public.accommodations(status);
CREATE INDEX idx_accommodations_city ON public.accommodations(city);
CREATE INDEX idx_rides_provider ON public.rides(provider_id);
CREATE INDEX idx_rides_status ON public.rides(status);
CREATE INDEX idx_event_halls_provider ON public.event_halls(provider_id);
CREATE INDEX idx_event_halls_status ON public.event_halls(status);
CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_provider ON public.bookings(provider_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);