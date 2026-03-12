-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('shop1', 'shop2', 'owner');

-- Create profiles table for user info including role
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'shop1',
  shop_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shops table
CREATE TABLE public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medicines/stock table
CREATE TABLE public.stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  medicine_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(shop_id, medicine_name)
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  medicine_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  receipt_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Shops policies (everyone can view shops)
CREATE POLICY "Anyone can view shops" ON public.shops
  FOR SELECT TO authenticated USING (true);

-- Stock policies
CREATE POLICY "Authenticated users can view stock" ON public.stock
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Shop users can update their stock" ON public.stock
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (
        (profiles.role = 'shop1' AND shop_id = (SELECT id FROM public.shops WHERE name = 'Shop 1'))
        OR (profiles.role = 'shop2' AND shop_id = (SELECT id FROM public.shops WHERE name = 'Shop 2'))
        OR profiles.role = 'owner'
      )
    )
  );

-- Sales policies
CREATE POLICY "Authenticated users can view sales" ON public.sales
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Shop users can insert sales" ON public.sales
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (
        (profiles.role = 'shop1' AND shop_id = (SELECT id FROM public.shops WHERE name = 'Shop 1'))
        OR (profiles.role = 'shop2' AND shop_id = (SELECT id FROM public.shops WHERE name = 'Shop 2'))
        OR profiles.role = 'owner'
      )
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, shop_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'shop1'),
    NEW.raw_user_meta_data->>'shop_name'
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default shops
INSERT INTO public.shops (name) VALUES ('Shop 1'), ('Shop 2');

-- Insert sample stock for both shops
INSERT INTO public.stock (shop_id, medicine_name, quantity, price) 
SELECT s.id, m.medicine_name, m.quantity, m.price
FROM public.shops s
CROSS JOIN (
  VALUES 
    ('Paracetamol 500mg', 100, 5.99),
    ('Ibuprofen 400mg', 75, 8.49),
    ('Amoxicillin 250mg', 50, 12.99),
    ('Omeprazole 20mg', 60, 15.49),
    ('Metformin 500mg', 80, 9.99),
    ('Aspirin 100mg', 120, 4.49),
    ('Cetirizine 10mg', 90, 6.99),
    ('Vitamin C 1000mg', 150, 7.99)
) AS m(medicine_name, quantity, price);