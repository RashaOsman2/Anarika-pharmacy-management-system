import { StockRemovalHistory } from '@/types/pharmacy';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';

interface StockRemovalHistoryModalProps {
  open: boolean;
  onClose: () => void;
  history: StockRemovalHistory[];
  loading: boolean;
  shopNames?: Record<string, string>;
  showShop?: boolean;
}

const getRemovalTypeBadge = (type: string) => {
  switch (type) {
    case 'empty':
      return <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-0">Emptied</Badge>;
    case 'reduce':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-0">Reduced</Badge>;
    case 'remove':
      return <Badge variant="secondary" className="bg-red-100 text-red-700 border-0">Removed</Badge>;
    case 'sale':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0">Sold</Badge>;
    default:
      return <Badge variant="secondary">{type}</Badge>;
  }
};

export default function StockRemovalHistoryModal({ 
  open, 
  onClose, 
  history, 
  loading,
  shopNames = {},
  showShop = false
}: StockRemovalHistoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Stock Removal History
          </DialogTitle>
        </DialogHeader>

        <div className="pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No stock removal history found</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    {showShop && <TableHead>Shop</TableHead>}
                    <TableHead>Medicine</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Removed</TableHead>
                    <TableHead className="text-right">Before</TableHead>
                    <TableHead className="text-right">After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(item.created_at).toLocaleDateString()}{' '}
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      {showShop && (
                        <TableCell>{shopNames[item.shop_id] || 'Unknown'}</TableCell>
                      )}
                      <TableCell className="font-medium">{item.medicine_name}</TableCell>
                      <TableCell>{getRemovalTypeBadge(item.removal_type)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="bg-red-50 text-red-600 border-0">
                          -{item.quantity_removed}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {item.previous_quantity}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.new_quantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
