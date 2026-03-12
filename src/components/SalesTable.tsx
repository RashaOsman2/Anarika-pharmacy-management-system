import { Sale } from '@/types/pharmacy';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Receipt } from 'lucide-react';

interface SalesTableProps {
  sales: Sale[];
  loading: boolean;
  showShop?: boolean;
  shopNames?: Record<string, string>;
}

export default function SalesTable({ sales, loading, showShop = false, shopNames = {} }: SalesTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Receipt className="h-12 w-12 mb-4 opacity-50" />
        <p>No sales recorded yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-display font-semibold">Receipt #</TableHead>
            {showShop && <TableHead className="font-display font-semibold">Shop</TableHead>}
            <TableHead className="font-display font-semibold">Medicine</TableHead>
            <TableHead className="font-display font-semibold text-right">Qty</TableHead>
            <TableHead className="font-display font-semibold text-right">Total</TableHead>
            <TableHead className="font-display font-semibold">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id} className="medicine-row">
              <TableCell className="font-mono text-sm">{sale.receipt_number}</TableCell>
              {showShop && (
                <TableCell>{shopNames[sale.shop_id] || 'Unknown'}</TableCell>
              )}
              <TableCell className="font-medium">{sale.medicine_name}</TableCell>
              <TableCell className="text-right">{sale.quantity}</TableCell>
              <TableCell className="text-right">${Number(sale.total_price).toFixed(2)}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(sale.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}