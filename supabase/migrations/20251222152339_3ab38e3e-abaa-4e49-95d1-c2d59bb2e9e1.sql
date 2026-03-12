-- Create stock removal history table
CREATE TABLE public.stock_removal_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id),
  stock_id UUID REFERENCES public.stock(id) ON DELETE SET NULL,
  medicine_name TEXT NOT NULL,
  quantity_removed INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  removal_type TEXT NOT NULL CHECK (removal_type IN ('empty', 'reduce', 'remove', 'sale')),
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stock_removal_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view stock removal history"
ON public.stock_removal_history
FOR SELECT
USING (true);

CREATE POLICY "Shop users can insert stock removal history"
ON public.stock_removal_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (
      (profiles.role = 'shop1' AND stock_removal_history.shop_id = (SELECT id FROM shops WHERE name = 'Shop 1'))
      OR (profiles.role = 'shop2' AND stock_removal_history.shop_id = (SELECT id FROM shops WHERE name = 'Shop 2'))
      OR profiles.role = 'owner'
    )
  )
);