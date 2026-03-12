import { useState, useMemo } from 'react';
import { Sale, Receipt, CartItem } from '@/types/pharmacy';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Receipt as ReceiptIcon, Eye } from 'lucide-react';

interface ReceiptHistoryModalProps {
  open: boolean;
  onClose: () => void;
  sales: Sale[];
  loading: boolean;
  shopName: string;
  onViewReceipt: (receipt: Receipt) => void;
}

export default function ReceiptHistoryModal({ 
  open, 
  onClose, 
  sales, 
  loading,
  shopName,
  onViewReceipt 
}: ReceiptHistoryModalProps) {
  // Group sales by receipt number
  const receipts = useMemo(() => {
    const grouped: Record<string, Sale[]> = {};
    sales.forEach(sale => {
      if (!grouped[sale.receipt_number]) {
        grouped[sale.receipt_number] = [];
      }
      grouped[sale.receipt_number].push(sale);
    });

    return Object.entries(grouped)
      .map(([receiptNumber, items]) => ({
        receipt_number: receiptNumber,
        items,
        total: items.reduce((sum, item) => sum + Number(item.total_price), 0),
        date: items[0].created_at,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales]);

  const handleViewReceipt = (receiptData: typeof receipts[0]) => {
    const cartItems: CartItem[] = receiptData.items.map(sale => ({
      medicine_name: sale.medicine_name,
      quantity: sale.quantity,
      unit_price: Number(sale.unit_price),
      total_price: Number(sale.total_price),
      discount_percent: sale.discount_percent,
      discount_amount: sale.discount_amount,
      original_price: sale.original_price,
    }));

    const receipt: Receipt = {
      receipt_number: receiptData.receipt_number,
      shop_name: shopName,
      items: cartItems,
      total: receiptData.total,
      date: receiptData.date,
    };

    onViewReceipt(receipt);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <ReceiptIcon className="h-5 w-5 text-primary" />
            Receipt History
          </DialogTitle>
        </DialogHeader>

        <div className="pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ReceiptIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No receipts found</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((receipt) => (
                    <TableRow key={receipt.receipt_number}>
                      <TableCell className="font-mono text-sm">{receipt.receipt_number}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(receipt.date).toLocaleDateString()}{' '}
                        {new Date(receipt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell className="text-right">{receipt.items.length}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ৳{receipt.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReceipt(receipt)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
