import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { StockItem, Sale, Shop, RestockHistory, Receipt, StockRemovalHistory } from '@/types/pharmacy';
import Header from '@/components/Header';
import StockTable from '@/components/StockTable';
import SalesReport from '@/components/SalesReport';
import RestockModal from '@/components/RestockModal';
import RestockHistoryModal from '@/components/RestockHistoryModal';
import StockRemovalHistoryModal from '@/components/StockRemovalHistoryModal';
import LowStockModal from '@/components/LowStockModal';
import StockEditModal from '@/components/StockEditModal';
import ReceiptHistoryModal from '@/components/ReceiptHistoryModal';
import ReceiptModal from '@/components/ReceiptModal';
import StatCard from '@/components/StatCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Package, ShoppingCart, TrendingUp, Building2, FileSpreadsheet, Plus, History, AlertTriangle, Receipt as ReceiptIcon, Trash2, Loader2 } from 'lucide-react';

export default function OwnerDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // State
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<string>('all');
  const [allStock, setAllStock] = useState<Record<string, StockItem[]>>({});
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [allRestockHistory, setAllRestockHistory] = useState<RestockHistory[]>([]);
  const [allStockRemovalHistory, setAllStockRemovalHistory] = useState<StockRemovalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showRestock, setShowRestock] = useState(false);
  const [showRestockHistory, setShowRestockHistory] = useState(false);
  const [showStockRemovalHistory, setShowStockRemovalHistory] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);
  const [showStockEdit, setShowStockEdit] = useState(false);
  const [showReceiptHistory, setShowReceiptHistory] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);

  // Mappers - Cleaned of all ID-to-Number conversions
  const mapStock = (s: any): StockItem => ({
    ...s,
    id: String(s.id),
    shop_id: String(s.shopId),
    medicine_name: s.medicineName,
    unit_type: s.unitType,
    pieces_per_unit: s.piecesPerUnit,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  });

  const mapSale = (s: any): Sale => ({
    ...s,
    id: String(s.id),
    shop_id: String(s.shopId),
    user_id: s.userId ? String(s.userId) : null,
    medicine_name: s.medicineName,
    unit_price: Number(s.unitPrice) || 0,
    total_price: Number(s.totalPrice) || 0,
    receipt_number: s.receiptNumber,
    discount_percent: s.discountPercent ? Number(s.discountPercent) : 0,
    discount_amount: s.discountAmount ? Number(s.discountAmount) : 0,
    original_price: s.originalPrice ? Number(s.originalPrice) : null,
    created_at: s.createdAt,
  });

  const mapRestockHistory = (h: any): RestockHistory => ({
    ...h,
    id: String(h.id),
    shop_id: String(h.shopId),
    stock_id: String(h.stockId),
    medicine_name: h.medicineName,
    quantity_added: h.quantityAdded,
    previous_quantity: h.previousQuantity,
    new_quantity: h.newQuantity,
    user_id: h.userId ? String(h.userId) : null,
    created_at: h.createdAt,
  });

  const mapStockRemovalHistory = (h: any): StockRemovalHistory => ({
    ...h,
    id: String(h.id),
    shop_id: String(h.shopId),
    stock_id: h.stockId ? String(h.stockId) : null,
    medicine_name: h.medicineName,
    quantity_removed: h.quantityRemoved,
    previous_quantity: h.previousQuantity,
    new_quantity: h.newQuantity,
    removal_type: h.removalType,
    user_id: h.userId ? String(h.userId) : null,
    created_at: h.createdAt,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const shopsData = await api.shops.list();
      
      const mappedShops = shopsData.map((s: any) => ({
        ...s,
        id: String(s.id),
        created_at: s.createdAt,
      }));
      setShops(mappedShops);

      const stockByShop: Record<string, StockItem[]> = {};
      let allSalesData: Sale[] = [];
      let allHistoryData: RestockHistory[] = [];
      let allRemovalData: StockRemovalHistory[] = [];

      for (const shop of mappedShops) {
        const [stockData, salesData, historyData, removalData] = await Promise.all([
          api.stock.byShop(shop.id),
          api.sales.byShop(shop.id),
          api.restockHistory.byShop(shop.id),
          api.stockRemovalHistory.byShop(shop.id),
        ]);

        stockByShop[shop.id] = stockData.map(mapStock);
        allSalesData = [...allSalesData, ...salesData.map(mapSale)];
        allHistoryData = [...allHistoryData, ...historyData.map(mapRestockHistory)];
        allRemovalData = [...allRemovalData, ...removalData.map(mapStockRemovalHistory)];
      }

      setAllStock(stockByShop);
      setAllSales(allSalesData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      setAllRestockHistory(allHistoryData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      setAllStockRemovalHistory(allRemovalData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load dashboard data. Please check your shop configuration.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers - All Number() wrappers removed from IDs
  const handleRestock = async (medicineId: string, quantity: number) => {
    if (!user) return;
    const allStockItems = Object.values(allStock).flat();
    const stockItem = allStockItems.find(s => s.id === medicineId);
    if (!stockItem) return;

    const previousQuantity = stockItem.quantity;
    const newQuantity = stockItem.quantity + quantity;
    
    await api.stock.update(medicineId, { quantity: newQuantity });
    await api.restockHistory.create(stockItem.shop_id, {
      stockId: medicineId,
      medicineName: stockItem.medicine_name,
      quantityAdded: quantity,
      previousQuantity: previousQuantity,
      newQuantity: newQuantity,
    });
    
    toast({ title: 'Success', description: 'Stock updated successfully.' });
    await fetchData();
  };

  const handleAddNewMedicine = async (name: string, quantity: number, price: number, unitType: import('@/types/pharmacy').UnitType = 'strip', piecesPerUnit: number = 10) => {
    if (!user) return;
    
    let targetShopId = selectedShop;
    if (targetShopId === 'all') {
      if (shops.length > 0) {
        targetShopId = shops[0].id;
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'No shops available.' });
        return;
      }
    }

    const newStock = await api.stock.create(targetShopId, {
      medicineName: name,
      quantity,
      price: String(price),
      unitType: unitType,
      piecesPerUnit: piecesPerUnit,
    });

    if (newStock) {
      await api.restockHistory.create(targetShopId, {
        stockId: String(newStock.id),
        medicineName: name,
        quantityAdded: quantity,
        previousQuantity: 0,
        newQuantity: quantity,
      });
    }
    await fetchData();
  };

  const handleEditStock = async (id: string, medicineName: string, quantity: number, price: number, unitType?: import('@/types/pharmacy').UnitType, piecesPerUnit?: number) => {
    const allStockItems = Object.values(allStock).flat();
    const stockItem = allStockItems.find(s => s.id === id);
    if (!stockItem) return;
    
    const previousQuantity = stockItem.quantity;
    const updateData: any = { medicineName, quantity, price: String(price) };
    if (unitType) updateData.unitType = unitType;
    if (piecesPerUnit !== undefined) updateData.piecesPerUnit = piecesPerUnit;
    
    await api.stock.update(id, updateData);

    if (quantity < previousQuantity) {
      await api.stockRemovalHistory.create(stockItem.shop_id, {
        stockId: id,
        medicineName,
        quantityRemoved: previousQuantity - quantity,
        previousQuantity,
        newQuantity: quantity,
        removalType: 'reduce',
      });
    }
    await fetchData();
  };

  const handleEmptyStock = async (id: string) => {
    const allStockItems = Object.values(allStock).flat();
    const stockItem = allStockItems.find(s => s.id === id);
    if (!stockItem) return;
    
    const prev = stockItem.quantity;
    await api.stock.update(id, { quantity: 0 });
    await api.stockRemovalHistory.create(stockItem.shop_id, {
      stockId: id,
      medicineName: stockItem.medicine_name,
      quantityRemoved: prev,
      previousQuantity: prev,
      newQuantity: 0,
      removalType: 'empty',
    });
    await fetchData();
  };

  const handleRemoveStock = async (id: string) => {
    const allStockItems = Object.values(allStock).flat();
    const stockItem = allStockItems.find(s => s.id === id);
    if (!stockItem) return;
    
    await api.stockRemovalHistory.create(stockItem.shop_id, {
      stockId: id,
      medicineName: stockItem.medicine_name,
      quantityRemoved: stockItem.quantity,
      previousQuantity: stockItem.quantity,
      newQuantity: 0,
      removalType: 'remove',
    });
    await api.stock.delete(id);
    await fetchData();
  };

  const handleViewReceipt = (receipt: Receipt) => {
    setViewingReceipt(receipt);
    setShowReceipt(true);
  };

  // Derived State
  const shopNames = shops.reduce((acc, shop) => {
    acc[shop.id] = shop.name;
    return acc;
  }, {} as Record<string, string>);

  const filteredStock = selectedShop === 'all' ? Object.values(allStock).flat() : (allStock[selectedShop] || []);
  const filteredSales = selectedShop === 'all' ? allSales : allSales.filter(s => s.shop_id === selectedShop);
  const filteredRestockHistory = selectedShop === 'all' ? allRestockHistory : allRestockHistory.filter(h => h.shop_id === selectedShop);
  const filteredStockRemovalHistory = selectedShop === 'all' ? allStockRemovalHistory : allStockRemovalHistory.filter(h => h.shop_id === selectedShop);

  const totalStock = filteredStock.reduce((sum, item) => sum + item.quantity, 0);
  const todaySales = filteredSales.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString());
  const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.total_price), 0);
  const lowStockCount = filteredStock.filter(s => s.quantity < 20 && s.quantity > 0).length;
  const outOfStockCount = filteredStock.filter(s => s.quantity === 0).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold mb-2">Owner Dashboard</h2>
            <p className="text-muted-foreground">Monitor all shops' performance</p>
          </div>
          
          <Select value={selectedShop} onValueChange={setSelectedShop}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select shop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2"><Building2 className="h-4 w-4" />All Shops</div>
              </SelectItem>
              {shops.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>
                  <div className="flex items-center gap-2"><Building2 className="h-4 w-4" />{shop.name}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <StatCard title="Total Stock" value={totalStock} icon={<Package className="h-6 w-6" />} variant="blue" />
          <StatCard title="Total Sales" value={filteredSales.length} icon={<ShoppingCart className="h-6 w-6" />} variant="teal" />
          <StatCard title="Today's Revenue" value={`৳${todayRevenue.toFixed(2)}`} icon={<TrendingUp className="h-6 w-6" />} variant="green" />
          <div className="cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => setShowLowStock(true)}>
            <StatCard title="Low Stock Items" value={`${lowStockCount}${outOfStockCount > 0 ? ` (+${outOfStockCount} out)` : ''}`} icon={<AlertTriangle className="h-6 w-6" />} variant="orange" />
          </div>
        </div>

        <Tabs defaultValue="sales-report" className="space-y-6">
          <TabsList className="grid w-full max-w-xl grid-cols-3">
            <TabsTrigger value="sales-report"><FileSpreadsheet className="h-4 w-4 mr-2" />Sales & Report</TabsTrigger>
            <TabsTrigger value="stock"><Package className="h-4 w-4 mr-2" />Stock</TabsTrigger>
            <TabsTrigger value="history"><History className="h-4 w-4 mr-2" />History</TabsTrigger>
          </TabsList>

          <TabsContent value="sales-report" className="animate-fade-in">
            <SalesReport sales={filteredSales} loading={loading} showShop={selectedShop === 'all'} shopNames={shopNames} />
          </TabsContent>

          <TabsContent value="stock" className="animate-fade-in">
            <Card className="pharmacy-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-display flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {selectedShop === 'all' ? 'All Shops Stock' : `Stock for ${shopNames[selectedShop]}`}
                </CardTitle>
                <Button onClick={() => setShowRestock(true)}><Plus className="h-4 w-4 mr-2" />Restock</Button>
              </CardHeader>
              <CardContent>
                {loading ? <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
                  <StockTable stock={filteredStock} loading={loading} onEdit={(item) => { setEditingStock(item); setShowStockEdit(true); }} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="pharmacy-card cursor-pointer hover:border-primary transition-colors" onClick={() => setShowRestockHistory(true)}>
                <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Restock History</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{filteredRestockHistory.length} records</p></CardContent>
              </Card>
              <Card className="pharmacy-card cursor-pointer hover:border-destructive transition-colors" onClick={() => setShowStockRemovalHistory(true)}>
                <CardHeader><CardTitle className="flex items-center gap-2"><Trash2 className="h-5 w-5" />Removal History</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{filteredStockRemovalHistory.length} records</p></CardContent>
              </Card>
              <Card className="pharmacy-card cursor-pointer hover:border-primary transition-colors" onClick={() => setShowReceiptHistory(true)}>
                <CardHeader><CardTitle className="flex items-center gap-2"><ReceiptIcon className="h-5 w-5" />Receipt History</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{new Set(filteredSales.map(s => s.receipt_number)).size} receipts</p></CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <RestockModal open={showRestock} onClose={() => setShowRestock(false)} stock={filteredStock} onRestock={handleRestock} onAddNew={handleAddNewMedicine} />
      <RestockHistoryModal open={showRestockHistory} onClose={() => setShowRestockHistory(false)} history={filteredRestockHistory} loading={loading} shopNames={shopNames} showShop={selectedShop === 'all'} />
      <StockRemovalHistoryModal open={showStockRemovalHistory} onClose={() => setShowStockRemovalHistory(false)} history={filteredStockRemovalHistory} loading={loading} shopNames={shopNames} showShop={selectedShop === 'all'} />
      <LowStockModal open={showLowStock} onClose={() => setShowLowStock(false)} stock={filteredStock} />
      <StockEditModal open={showStockEdit} onClose={() => { setShowStockEdit(false); setEditingStock(null); }} stockItem={editingStock} onSave={handleEditStock} onEmptyStock={handleEmptyStock} onRemove={handleRemoveStock} />
      <ReceiptHistoryModal open={showReceiptHistory} onClose={() => setShowReceiptHistory(false)} sales={filteredSales} loading={loading} shopName={selectedShop === 'all' ? 'All Shops' : shopNames[selectedShop]} onViewReceipt={handleViewReceipt} />
      <ReceiptModal receipt={viewingReceipt} open={showReceipt} onClose={() => { setShowReceipt(false); setViewingReceipt(null); }} />
    </div>
  );
}
