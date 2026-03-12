-- Add unit type and pieces per strip columns to stock table
ALTER TABLE public.stock 
ADD COLUMN unit_type text NOT NULL DEFAULT 'strip',
ADD COLUMN pieces_per_unit integer NOT NULL DEFAULT 10;

-- Add comment for clarity
COMMENT ON COLUMN public.stock.unit_type IS 'Medicine unit type: strip, bottle, box, injection';
COMMENT ON COLUMN public.stock.pieces_per_unit IS 'Number of pieces per unit (e.g., 10 pieces per strip)';