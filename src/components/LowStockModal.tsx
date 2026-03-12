import { StockItem } from '@/types/pharmacy';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface LowStockModalProps {
  open: boolean;
  onClose: () => void;
  stock: StockItem[];
}

export default function LowStockModal({ open, onClose, stock }: LowStockModalProps) {
  const lowStockItems = stock.filter(s => s.quantity < 20 && s.quantity > 0);
  const outOfStockItems = stock.filter(s => s.quantity === 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-pharmacy-orange" />
            Low Stock Items
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {outOfStockItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
                <Badge variant="destructive">Out of Stock ({outOfStockItems.length})</Badge>
              </h3>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Medicine</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outOfStockItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.medicine_name}</TableCell>
                        <TableCell className="text-right text-destructive font-semibold">0</TableCell>
                        <TableCell className="text-right">${Number(item.price).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {lowStockItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Badge variant="secondary" className="bg-pharmacy-orange-light text-pharmacy-orange border-0">
                  Low Stock ({lowStockItems.length})
                </Badge>
              </h3>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Medicine</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.medicine_name}</TableCell>
                        <TableCell className="text-right text-pharmacy-orange font-semibold">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">${Number(item.price).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {lowStockItems.length === 0 && outOfStockItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              All stock levels are healthy!
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
