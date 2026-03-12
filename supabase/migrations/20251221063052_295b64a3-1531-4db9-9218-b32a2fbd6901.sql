-- Add INSERT policy for stock so shops can add new medicines
CREATE POLICY "Shop users can insert stock" ON public.stock
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