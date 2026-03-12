import { RestockHistory } from '@/types/pharmacy';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';

interface RestockHistoryModalProps {
  open: boolean;
  onClose: () => void;
  history: RestockHistory[];
  loading: boolean;
  shopNames?: Record<string, string>;
  showShop?: boolean;
}

export default function RestockHistoryModal({ 
  open, 
  onClose, 
  history, 
  loading,
  shopNames = {},
  showShop = false
}: RestockHistoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Restock History
          </DialogTitle>
        </DialogHeader>

        <div className="pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No restock history found</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    {showShop && <TableHead>Shop</TableHead>}
                    <TableHead>Medicine</TableHead>
                    <TableHead className="text-right">Added</TableHead>
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
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="bg-pharmacy-green-light text-pharmacy-green border-0">
                          +{item.quantity_added}
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
