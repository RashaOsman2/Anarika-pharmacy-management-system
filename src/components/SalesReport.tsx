import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Download, FileSpreadsheet, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sale } from '@/types/pharmacy';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import StatCard from '@/components/StatCard';

interface SalesReportProps {
  sales: Sale[];
  shopNames?: Record<string, string>;
  showShop?: boolean;
  loading: boolean;
}

export default function SalesReport({ sales, shopNames = {}, showShop = false, loading }: SalesReportProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.created_at);
    const start = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
    const end = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;

    if (start && saleDate < start) return false;
    if (end && saleDate > end) return false;
    return true;
  });

  // Calculate stats
  const totalRevenue = filteredSales.reduce((sum, s) => sum + Number(s.total_price), 0);
  const totalItems = filteredSales.reduce((sum, s) => sum + s.quantity, 0);
  const uniqueReceipts = new Set(filteredSales.map(s => s.receipt_number)).size;
  const avgOrderValue = uniqueReceipts > 0 ? totalRevenue / uniqueReceipts : 0;

  // Group by medicine for summary
  const medicineSummary = filteredSales.reduce((acc, sale) => {
    if (!acc[sale.medicine_name]) {
      acc[sale.medicine_name] = { quantity: 0, revenue: 0 };
    }
    acc[sale.medicine_name].quantity += sale.quantity;
    acc[sale.medicine_name].revenue += Number(sale.total_price);
    return acc;
  }, {} as Record<string, { quantity: number; revenue: number }>);

  const topMedicines = Object.entries(medicineSummary)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  const exportToCSV = () => {
    if (filteredSales.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No data to export',
        description: 'There are no sales in the selected date range.',
      });
      return;
    }

    const headers = showShop 
      ? ['Receipt #', 'Shop', 'Medicine', 'Quantity', 'Unit Price', 'Total Price', 'Date']
      : ['Receipt #', 'Medicine', 'Quantity', 'Unit Price', 'Total Price', 'Date'];

    const rows = filteredSales.map(sale => {
      const baseRow = [
        sale.receipt_number,
        sale.medicine_name,
        sale.quantity.toString(),
        Number(sale.unit_price).toFixed(2),
        Number(sale.total_price).toFixed(2),
        format(new Date(sale.created_at), 'yyyy-MM-dd HH:mm'),
      ];
      
      if (showShop) {
        baseRow.splice(1, 0, shopNames[sale.shop_id] || 'Unknown');
      }
      
      return baseRow;
    });

    // Add summary rows
    rows.push([]);
    rows.push(['--- SUMMARY ---']);
    rows.push(['Total Revenue:', '', '', '', `৳${totalRevenue.toFixed(2)}`]);
    rows.push(['Total Items Sold:', '', '', '', totalItems.toString()]);
    rows.push(['Total Transactions:', '', '', '', uniqueReceipts.toString()]);
    rows.push(['Average Order Value:', '', '', '', `৳${avgOrderValue.toFixed(2)}`]);
    rows.push([]);
    rows.push(['--- TOP SELLING MEDICINES ---']);
    topMedicines.forEach(([name, data]) => {
      rows.push([name, '', data.quantity.toString(), '', `৳${data.revenue.toFixed(2)}`]);
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export successful!',
      description: `Exported ${filteredSales.length} sales records to CSV.`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filters */}
      <Card className="pharmacy-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Sales Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button onClick={exportToCSV} className="sm:ml-auto">
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`৳${totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="h-6 w-6" />}
          variant="green"
        />
        <StatCard
          title="Items Sold"
          value={totalItems}
          icon={<ShoppingBag className="h-6 w-6" />}
          variant="blue"
        />
        <StatCard
          title="Transactions"
          value={uniqueReceipts}
          icon={<FileSpreadsheet className="h-6 w-6" />}
          variant="teal"
        />
        <StatCard
          title="Avg Order Value"
          value={`৳${avgOrderValue.toFixed(2)}`}
          icon={<TrendingUp className="h-6 w-6" />}
          variant="orange"
        />
      </div>

      {/* Top Selling Medicines */}
      {topMedicines.length > 0 && (
        <Card className="pharmacy-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Top Selling Medicines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-display font-semibold">Medicine</TableHead>
                    <TableHead className="font-display font-semibold text-right">Qty Sold</TableHead>
                    <TableHead className="font-display font-semibold text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topMedicines.map(([name, data], index) => (
                    <TableRow key={name} className="medicine-row">
                      <TableCell className="font-medium">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          {name}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{data.quantity}</TableCell>
                      <TableCell className="text-right font-medium text-pharmacy-green">
                        ৳{data.revenue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Sales Table */}
      <Card className="pharmacy-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Sales Details
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {filteredSales.length} records
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileSpreadsheet className="h-12 w-12 mb-4 opacity-50" />
              <p>No sales found in the selected date range</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
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
                  {filteredSales.slice(0, 100).map((sale) => (
                    <TableRow key={sale.id} className="medicine-row">
                      <TableCell className="font-mono text-sm">{sale.receipt_number}</TableCell>
                      {showShop && (
                        <TableCell>{shopNames[sale.shop_id] || 'Unknown'}</TableCell>
                      )}
                      <TableCell className="font-medium">{sale.medicine_name}</TableCell>
                      <TableCell className="text-right">{sale.quantity}</TableCell>
                      <TableCell className="text-right">৳{Number(sale.total_price).toFixed(2)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(sale.created_at), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}