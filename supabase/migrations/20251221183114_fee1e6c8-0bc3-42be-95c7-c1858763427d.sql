-- Add DELETE policy for stock table
CREATE POLICY "Shop users can delete their stock"
ON public.stock
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND (
    (profiles.role = 'shop1' AND stock.shop_id = (SELECT id FROM shops WHERE name = 'Shop 1'))
    OR (profiles.role = 'shop2' AND stock.shop_id = (SELECT id FROM shops WHERE name = 'Shop 2'))
    OR profiles.role = 'owner'
  )
));