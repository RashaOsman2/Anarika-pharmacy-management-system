import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { StockItem, CartItem, Sale, Receipt, Shop, RestockHistory, StockRemovalHistory } from '@/types/pharmacy';
import Header from '@/components/Header';
import StockTable from '@/components/StockTable';
import SellForm from '@/components/SellForm';
import SalesReport from '@/components/SalesReport';
import ReceiptModal from '@/components/ReceiptModal';
import RestockModal from '@/components/RestockModal';
import RestockHistoryModal from '@/components/RestockHistoryModal';
import StockRemovalHistoryModal from '@/components/StockRemovalHistoryModal';
import ReceiptHistoryModal from '@/components/ReceiptHistoryModal';
import LowStockModal from '@/components/LowStockModal';
import StockEditModal from '@/components/StockEditModal';
import StatCard from '@/components/StatCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Package, ShoppingCart, Receipt as ReceiptIcon, TrendingUp, Plus, FileSpreadsheet, History, AlertTriangle, Trash2 } from 'lucide-react';

export default function ShopDashboard() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showRestock, setShowRestock] = useState(false);
  const [showRestockHistory, setShowRestockHistory] = useState(false);
  const [showReceiptHistory, setShowReceiptHistory] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);
  const [showStockEdit, setShowStockEdit] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  const [restockHistory, setRestockHistory] = useState<RestockHistory[]>([]);
  const [stockRemovalHistory, setStockRemovalHistory] = useState<StockRemovalHistory[]>([]);
  const [showStockRemovalHistory, setShowStockRemovalHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Matches the 'name' field in your 'shops' collection
  const shopName = profile?.role === 'shop1' ? 'Shop 1' : 'Shop 2';

  const fetchData = useCallback(async () => {
    if (!profile) return;

    try {
      const shopsData = await api.shops.list();
      const shopData = shopsData.find((s: Shop) => s.name === shopName);

      if (shopData) {
        setShop(shopData);

        const [stockData, salesData, historyData, removalHistoryData] = await Promise.all([
          api.stock.byShop(shopData.id),
          api.sales.byShop(shopData.id),
          api.restockHistory.byShop(shopData.id),
          api.stockRemovalHistory.byShop(shopData.id),
        ]);

        setStock(stockData.map((s: any) => ({
          ...s,
          id: String(s.id),
          shop_id: String(s.shopId),
          medicine_name: s.medicineName,
          unit_type: s.unitType,
          pieces_per_unit: s.piecesPerUnit,
          created_at: s.createdAt,
          updated_at: s.updatedAt,
        })));

        setSales(salesData.map((s: any) => ({
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
        })));

        setRestockHistory(historyData.map((h: any) => ({
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
        })));

        setStockRemovalHistory(removalHistoryData.map((h: any) => ({
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
        })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [profile, shopName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddToCart = (item: CartItem) => {
    setCart([...cart, item]);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleCheckout = async (customerName: string, customerPhone: string) => {
    if (!shop || !user || cart.length === 0) return;

    setIsProcessing(true);
    const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    try {
      for (const item of cart) {
        await api.sales.create(shop.id, {
          medicineName: item.medicine_name,
          quantity: item.quantity,
          unitPrice: String(item.unit_price),
          totalPrice: String(item.total_price),
          receiptNumber: receiptNumber,
          discountPercent: String(item.discount_percent || 0),
          discountAmount: String(item.discount_amount || 0),
          originalPrice: String(item.original_price || item.total_price),
        });

        const stockItem = stock.find(s => s.medicine_name === item.medicine_name);
        if (stockItem) {
          await api.stock.update(stockItem.id, {
            quantity: stockItem.quantity - item.quantity,
          });
        }
      }

      const newReceipt: Receipt = {
        receipt_number: receiptNumber,
        shop_name: shopName,
        items: [...cart],
        total: cart.reduce((sum, item) => sum + item.total_price, 0),
        date: new Date().toISOString(),
        customer_name: customerName,
        customer_phone: customerPhone,
      };

      setReceipt(newReceipt);
      setShowReceipt(true);
      setCart([]);
      
      toast({
        title: 'Sale completed!',
        description: `Receipt ${receiptNumber} generated.`,
      });

      fetchData();
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        variant: 'destructive',
        title: 'Checkout failed',
        description: 'There was an error processing your sale.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestock = async (medicineId: string, quantity: number) => {
    if (!shop || !user) return;
    
    const stockItem = stock.find(s => s.id === medicineId);
    if (!stockItem) throw new Error('Medicine not found');

    const previousQuantity = stockItem.quantity;
    const newQuantity = stockItem.quantity + quantity;
    
    await api.stock.update(medicineId, { quantity: newQuantity });

    await api.restockHistory.create(shop.id, {
      stockId: medicineId,
      medicineName: stockItem.medicine_name,
      quantityAdded: quantity,
      previousQuantity: previousQuantity,
      newQuantity: newQuantity,
    });
    
    await fetchData();
  };

  const handleAddNewMedicine = async (name: string, quantity: number, price: number, unitType: import('@/types/pharmacy').UnitType = 'strip', piecesPerUnit: number = 10) => {
    if (!shop || !user) return;

    const newStock = await api.stock.create(shop.id, {
      medicineName: name,
      quantity,
      price: String(price),
      unitType: unitType,
      piecesPerUnit: piecesPerUnit,
    });

    if (newStock) {
      await api.restockHistory.create(shop.id, {
        stockId: String(newStock.id),
        medicineName: name,
        quantityAdded: quantity,
        previousQuantity: 0,
        newQuantity: quantity,
      });
    }

    fetchData();
  };

  const handleEditStock = async (id: string, medicineName: string, quantity: number, price: number, unitType?: import('@/types/pharmacy').UnitType, piecesPerUnit?: number) => {
    if (!shop || !user) return;
    
    const stockItem = stock.find(s => s.id === id);
    if (!stockItem) return;
    
    const previousQuantity = stockItem.quantity;
    
    const updateData: Record<string, unknown> = { 
      medicineName: medicineName,
      quantity, 
      price: String(price),
    };
    
    if (unitType) updateData.unitType = unitType;
    if (piecesPerUnit !== undefined) updateData.piecesPerUnit = piecesPerUnit;
    
    await api.stock.update(id, updateData);

    if (quantity < previousQuantity) {
      await api.stockRemovalHistory.create(shop.id, {
        stockId: id,
        medicineName: medicineName,
        quantityRemoved: previousQuantity - quantity,
        previousQuantity: previousQuantity,
        newQuantity: quantity,
        removalType: 'reduce',
      });
    }
    
    await fetchData();
  };

  const handleEmptyStock = async (id: string) => {
    if (!shop || !user) return;
    
    const stockItem = stock.find(s => s.id === id);
    if (!stockItem) return;
    
    const previousQuantity = stockItem.quantity;
    
    await api.stock.update(id, { quantity: 0 });

    await api.stockRemovalHistory.create(shop.id, {
      stockId: id,
      medicineName: stockItem.medicine_name,
      quantityRemoved: previousQuantity,
      previousQuantity: previousQuantity,
      newQuantity: 0,
      removalType: 'empty',
    });

    await fetchData();
  };

  const handleRemoveStock = async (id: string) => {
    if (!shop || !user) return;
    
    const stockItem = stock.find(s => s.id === id);
    if (!stockItem) return;
    
    await api.stockRemovalHistory.create(shop.id, {
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

  const handleViewReceipt = (viewReceipt: Receipt) => {
    setReceipt(viewReceipt);
    setShowReceipt(true);
  };

  const totalStock = stock.reduce((sum, item) => sum + item.quantity, 0);
  const todaySales = sales.filter(
    s => new Date(s.created_at).toDateString() === new Date().toDateString()
  );
  const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.total_price), 0);
  const lowStockCount = stock.filter(s => s.quantity < 20 && s.quantity > 0).length;
  const outOfStockCount = stock.filter(s => s.quantity === 0).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold mb-2">{shopName} Dashboard</h2>
          <p className="text-muted-foreground">Manage sales, stock, and receipts</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <StatCard title="Total Stock Items" value={totalStock} icon={<Package className="h-6 w-6" />} variant="blue" />
          <StatCard title="Today's Sales" value={todaySales.length} icon={<ShoppingCart className="h-6 w-6" />} variant="teal" />
          <StatCard title="Today's Revenue" value={`৳${todayRevenue.toFixed(2)}`} icon={<TrendingUp className="h-6 w-6" />} variant="green" />
          <div className="cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => setShowLowStock(true)}>
            <StatCard title="Low Stock Items" value={`${lowStockCount}${outOfStockCount > 0 ? ` (+${outOfStockCount} out)` : ''}`} icon={<AlertTriangle className="h-6 w-6" />} variant="orange" />
          </div>
        </div>

        <Tabs defaultValue="sell" className="space-y-6">
          <TabsList className="grid w-full max-w-xl grid-cols-4">
            <TabsTrigger value="sell">Sell</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="sales-report"><FileSpreadsheet className="h-4 w-4 mr-1" />Sales & Report</TabsTrigger>
            <TabsTrigger value="history"><History className="h-4 w-4 mr-1" />History</TabsTrigger>
          </TabsList>

          <TabsContent value="sell" className="animate-fade-in">
            {/* ADDED setCart={setCart} below to enable the Clear Cart button */}
            <SellForm 
              stock={stock} 
              cart={cart} 
              setCart={setCart} 
              onAddToCart={handleAddToCart} 
              onRemoveFromCart={handleRemoveFromCart} 
              onCheckout={handleCheckout} 
              isProcessing={isProcessing} 
            />
          </TabsContent>

          <TabsContent value="stock" className="animate-fade-in">
            <Card className="pharmacy-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-display flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> Current Stock
                </CardTitle>
                <Button onClick={() => setShowRestock(true)}><Plus className="h-4 w-4 mr-2" /> Restock</Button>
              </CardHeader>
              <CardContent>
                <StockTable stock={stock} loading={loading} onEdit={(item) => { setEditingStock(item); setShowStockEdit(true); }} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales-report" className="animate-fade-in">
            <SalesReport sales={sales} loading={loading} />
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="pharmacy-card cursor-pointer hover:border-primary transition-colors" onClick={() => setShowRestockHistory(true)}>
                <CardHeader><CardTitle className="font-display flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Restock History</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">View all restock operations.</p>
                  <p className="text-2xl font-bold mt-2">{restockHistory.length} records</p>
                </CardContent>
              </Card>

              <Card className="pharmacy-card cursor-pointer hover:border-destructive transition-colors" onClick={() => setShowStockRemovalHistory(true)}>
                <CardHeader><CardTitle className="font-display flex items-center gap-2"><Trash2 className="h-5 w-5 text-destructive" /> Removal History</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">View stock removals & empties.</p>
                  <p className="text-2xl font-bold mt-2">{stockRemovalHistory.length} records</p>
                </CardContent>
              </Card>

              <Card className="pharmacy-card cursor-pointer hover:border-primary transition-colors" onClick={() => setShowReceiptHistory(true)}>
                <CardHeader><CardTitle className="font-display flex items-center gap-2"><ReceiptIcon className="h-5 w-5 text-primary" /> Receipt History</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">View and reprint past receipts.</p>
                  <p className="text-2xl font-bold mt-2">{new Set(sales.map(s => s.receipt_number)).size} receipts</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <ReceiptModal receipt={receipt} open={showReceipt} onClose={() => setShowReceipt(false)} />
      <RestockModal open={showRestock} onClose={() => setShowRestock(false)} stock={stock} onRestock={handleRestock} onAddNew={handleAddNewMedicine} />
      <RestockHistoryModal open={showRestockHistory} onClose={() => setShowRestockHistory(false)} history={restockHistory} loading={loading} />
      <StockRemovalHistoryModal open={showStockRemovalHistory} onClose={() => setShowStockRemovalHistory(false)} history={stockRemovalHistory} loading={loading} />
      <ReceiptHistoryModal open={showReceiptHistory} onClose={() => setShowReceiptHistory(false)} sales={sales} loading={loading} shopName={shopName} onViewReceipt={handleViewReceipt} />
      <LowStockModal open={showLowStock} onClose={() => setShowLowStock(false)} stock={stock} />
      <StockEditModal open={showStockEdit} onClose={() => { setShowStockEdit(false); setEditingStock(null); }} stockItem={editingStock} onSave={handleEditStock} onEmptyStock={handleEmptyStock} onRemove={handleRemoveStock} />
    </div>
  );
}
