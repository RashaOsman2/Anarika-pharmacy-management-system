import { StockItem, UnitType } from '@/types/pharmacy';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, Edit, Pill } from 'lucide-react';

interface StockTableProps {
  stock: StockItem[];
  loading: boolean;
  onEdit?: (item: StockItem) => void;
}

const getUnitTypeLabel = (unitType: UnitType): string => {
  const labels: Record<UnitType, string> = {
    strip: 'Strip',
    bottle: 'Bottle',
    box: 'Box',
    injection: 'Injection'
  };
  return labels[unitType] || unitType;
};

export default function StockTable({ stock, loading, onEdit }: StockTableProps) {
  const getStockStatus = (quantity: number, unitType: UnitType, piecesPerUnit: number) => {
    // For strip medicines, check based on pieces
    const effectiveQty = unitType === 'strip' ? Math.floor(quantity / piecesPerUnit) : quantity;
    const lowThreshold = unitType === 'strip' ? 2 : 20;
    
    if (quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (effectiveQty < lowThreshold) {
      return (
        <Badge variant="secondary" className="bg-pharmacy-orange-light text-pharmacy-orange border-0">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Low Stock
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-pharmacy-green-light text-pharmacy-green border-0">
        In Stock
      </Badge>
    );
  };

  const formatQuantityDisplay = (item: StockItem) => {
    if (item.unit_type === 'strip') {
      const strips = Math.floor(item.quantity / item.pieces_per_unit);
      const pieces = item.quantity % item.pieces_per_unit;
      if (strips > 0 && pieces > 0) {
        return `${strips} strip${strips !== 1 ? 's' : ''} + ${pieces} pcs`;
      } else if (strips > 0) {
        return `${strips} strip${strips !== 1 ? 's' : ''} (${item.quantity} pcs)`;
      }
      return `${item.quantity} pcs`;
    }
    return `${item.quantity} ${getUnitTypeLabel(item.unit_type).toLowerCase()}${item.quantity !== 1 ? 's' : ''}`;
  };

  const formatPriceDisplay = (item: StockItem) => {
    if (item.unit_type === 'strip') {
      const pricePerPiece = Number(item.price) / item.pieces_per_unit;
      return (
        <div>
          <div>৳{Number(item.price).toFixed(2)}/strip</div>
          <div className="text-xs text-muted-foreground">৳{pricePerPiece.toFixed(2)}/pc</div>
        </div>
      );
    }
    return `৳${Number(item.price).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (stock.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mb-4 opacity-50" />
        <p>No stock items found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-display font-semibold">Medicine Name</TableHead>
            <TableHead className="font-display font-semibold">Type</TableHead>
            <TableHead className="font-display font-semibold text-right">Quantity</TableHead>
            <TableHead className="font-display font-semibold text-right">Price</TableHead>
            <TableHead className="font-display font-semibold">Status</TableHead>
            {onEdit && <TableHead className="w-16"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {stock.map((item) => (
            <TableRow key={item.id} className="medicine-row">
              <TableCell className="font-medium">{item.medicine_name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                  <Pill className="h-3 w-3" />
                  {getUnitTypeLabel(item.unit_type)}
                  {item.unit_type === 'strip' && (
                    <span className="text-xs text-muted-foreground">({item.pieces_per_unit}pc)</span>
                  )}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{formatQuantityDisplay(item)}</TableCell>
              <TableCell className="text-right">{formatPriceDisplay(item)}</TableCell>
              <TableCell>{getStockStatus(item.quantity, item.unit_type, item.pieces_per_unit)}</TableCell>
              {onEdit && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}