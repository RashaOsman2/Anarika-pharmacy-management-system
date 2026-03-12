-- Create restock_history table to track all restock operations
CREATE TABLE public.restock_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id),
  stock_id UUID NOT NULL REFERENCES public.stock(id),
  medicine_name TEXT NOT NULL,
  quantity_added INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.restock_history ENABLE ROW LEVEL SECURITY;

-- Policies for restock_history
CREATE POLICY "Authenticated users can view restock history"
ON public.restock_history
FOR SELECT
USING (true);

CREATE POLICY "Shop users can insert restock history"
ON public.restock_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (
      (profiles.role = 'shop1' AND restock_history.shop_id = (SELECT id FROM shops WHERE name = 'Shop 1'))
      OR (profiles.role = 'shop2' AND restock_history.shop_id = (SELECT id FROM shops WHERE name = 'Shop 2'))
      OR profiles.role = 'owner'
    )
  )
);

-- Add discount columns to sales table
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS discount_percent NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_price NUMERIC;

-- Update original_price with total_price for existing records
UPDATE public.sales SET original_price = total_price WHERE original_price IS NULL;