import { useState, useMemo } from 'react';
import { StockItem, CartItem, UnitType } from '@/types/pharmacy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, ShoppingCart, Receipt, Percent, Search, Pill, Eraser } from 'lucide-react';

interface SellFormProps {
  stock: StockItem[];
  onAddToCart: (item: CartItem) => void;
  cart: CartItem[];
  onRemoveFromCart: (index: number) => void;
  onCheckout: (customerName: string, customerPhone: string) => void;
  isProcessing: boolean;
  // Added setCart to props to support Clear Cart
  setCart?: (cart: CartItem[]) => void; 
}

export default function SellForm({ 
  stock, 
  onAddToCart, 
  cart, 
  onRemoveFromCart, 
  onCheckout,
  isProcessing,
  setCart // Ensure this is passed from ShopDashboard if you use it there
}: SellFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [sellType, setSellType] = useState<'strip' | 'piece' | 'unit'>('strip');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const { toast } = useToast();

  const filteredStock = useMemo(() => {
    return stock.filter(s => 
      s.quantity > 0 && 
      s.medicine_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stock, searchQuery]);

  const selectedStockItem = useMemo(() => {
    return stock.find(s => s.medicine_name === selectedMedicine);
  }, [stock, selectedMedicine]);

  const getAvailableQuantityDisplay = (item: StockItem) => {
    if (item.unit_type === 'strip') {
      const strips = Math.floor(item.quantity / item.pieces_per_unit);
      const pieces = item.quantity % item.pieces_per_unit;
      return `${strips} strips + ${pieces} pcs (${item.quantity} pcs total)`;
    }
    return `${item.quantity} ${item.unit_type}s`;
  };

  const handleAddToCart = () => {
    if (!selectedMedicine) {
      toast({
        variant: 'destructive',
        title: 'Select a medicine',
        description: 'Please select a medicine to add to cart.',
      });
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      toast({
        variant: 'destructive',
        title: 'Invalid quantity',
        description: 'Please enter a valid quantity.',
      });
      return;
    }

    const discount = parseFloat(discountPercent) || 0;
    if (discount < 0 || discount > 100) {
      toast({
        variant: 'destructive',
        title: 'Invalid discount',
        description: 'Discount must be between 0 and 100%.',
      });
      return;
    }

    const stockItem = stock.find(s => s.medicine_name === selectedMedicine);
    if (!stockItem) return;

    let piecesNeeded = qty;
    if (stockItem.unit_type === 'strip' && sellType === 'strip') {
      piecesNeeded = qty * stockItem.pieces_per_unit;
    }

    const existingCartPieces = cart
      .filter(c => c.medicine_name === selectedMedicine)
      .reduce((sum, c) => sum + c.quantity, 0);

    if (piecesNeeded + existingCartPieces > stockItem.quantity) {
      const availablePieces = stockItem.quantity - existingCartPieces;
      if (stockItem.unit_type === 'strip') {
        const availableStrips = Math.floor(availablePieces / stockItem.pieces_per_unit);
        toast({
          variant: 'destructive',
          title: 'Insufficient stock',
          description: sellType === 'strip' 
            ? `Only ${availableStrips} strips (${availablePieces} pcs) available.`
            : `Only ${availablePieces} pieces available.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Insufficient stock',
          description: `Only ${availablePieces} units available.`,
        });
      }
      return;
    }

    let unitPrice: number;
    if (stockItem.unit_type === 'strip') {
      if (sellType === 'strip') {
        unitPrice = Number(stockItem.price);
      } else {
        unitPrice = Number(stockItem.price) / stockItem.pieces_per_unit;
      }
    } else {
      unitPrice = Number(stockItem.price);
    }

    const originalPrice = qty * unitPrice;
    const discountAmount = (originalPrice * discount) / 100;
    const finalPrice = Math.round((originalPrice - discountAmount) * 100) / 100;

    onAddToCart({
      medicine_name: selectedMedicine,
      quantity: piecesNeeded,
      unit_price: unitPrice,
      total_price: finalPrice,
      discount_percent: discount,
      discount_amount: Math.round(discountAmount * 100) / 100,
      original_price: Math.round(originalPrice * 100) / 100,
      sold_as: stockItem.unit_type === 'strip' ? sellType : 'unit',
      pieces_per_unit: stockItem.pieces_per_unit,
      unit_type: stockItem.unit_type,
    });

    setSelectedMedicine('');
    setQuantity('1');
    setSellType('strip');
    setDiscountPercent('0');

    toast({
      title: 'Added to cart',
      description: `${selectedMedicine} added to cart.`,
    });
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    // We call the prop if provided, otherwise you might need to handle this in ShopDashboard
    if (setCart) {
        setCart([]);
        toast({ title: "Cart cleared" });
    } else {
        // Fallback: Manually remove each item if setCart isn't passed
        cart.forEach((_, i) => onRemoveFromCart(0));
        toast({ title: "Cart cleared" });
    }
  };

  const formatCartQuantity = (item: CartItem) => {
    if (item.unit_type === 'strip') {
      if (item.sold_as === 'strip') {
        const strips = item.quantity / (item.pieces_per_unit || 10);
        return `${strips} strip${strips !== 1 ? 's' : ''}`;
      }
      return `${item.quantity} pc${item.quantity !== 1 ? 's' : ''}`;
    }
    return `${item.quantity} ${item.unit_type}${item.quantity !== 1 ? 's' : ''}`;
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.total_price, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.original_price || item.total_price), 0);
  const totalDiscount = cartSubtotal - cartTotal;

  const handleCheckout = () => {
    const name = customerName.trim() || 'Walk-in Customer';
    const phone = customerPhone.trim() || 'N/A';
    onCheckout(name, phone);
    setCustomerName('');
    setCustomerPhone('');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="pharmacy-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add to Sale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              Search Medicine
            </Label>
            <Input
              type="text"
              placeholder="Type to search medicine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Select Medicine</Label>
            <div className="max-h-40 overflow-y-auto rounded-lg border bg-background">
              {filteredStock.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  {searchQuery ? 'No medicines found' : 'No stock available'}
                </div>
              ) : (
                filteredStock.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 cursor-pointer hover:bg-muted transition-colors border-b last:border-b-0 ${
                      selectedMedicine === item.medicine_name ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                    }`}
                    onClick={() => {
                      setSelectedMedicine(item.medicine_name);
                      setSellType(item.unit_type === 'strip' ? 'strip' : 'unit');
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">{item.medicine_name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Pill className="h-3 w-3" />
                            {item.unit_type}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-muted-foreground">
                          ৳{Number(item.price).toFixed(2)}/{item.unit_type}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getAvailableQuantityDisplay(item)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {selectedStockItem?.unit_type === 'strip' && (
            <div className="space-y-2">
              <Label>Sell As</Label>
              <RadioGroup value={sellType} onValueChange={(v) => setSellType(v as 'strip' | 'piece')}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="strip" id="sell-strip" />
                    <Label htmlFor="sell-strip" className="font-normal">
                      Strip (৳{Number(selectedStockItem.price).toFixed(2)})
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="piece" id="sell-piece" />
                    <Label htmlFor="sell-piece" className="font-normal">
                      Piece (৳{(Number(selectedStockItem.price) / selectedStockItem.pieces_per_unit).toFixed(2)})
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}
          
          {/* FIXED ALIGNMENT: added items-end */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label>
                Quantity
                {selectedStockItem && (
                  <span className="text-muted-foreground text-sm ml-1">
                    ({selectedStockItem.unit_type === 'strip' 
                      ? (sellType === 'strip' ? 'strips' : 'pieces')
                      : `${selectedStockItem.unit_type}s`
                    })
                  </span>
                )}
              </Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Percent className="h-3 w-3" />
                Discount %
              </Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <Button onClick={handleAddToCart} className="w-full" disabled={!selectedMedicine}>
            <Plus className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </CardContent>
      </Card>

      <Card className="pharmacy-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Current Cart
          </CardTitle>
          {cart.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearCart}
              className="text-destructive hover:bg-destructive/10"
            >
              <Eraser className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mb-4 opacity-50" />
              <p>Cart is empty</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden mb-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Medicine</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.medicine_name}</p>
                            {item.discount_percent && item.discount_percent > 0 && (
                              <p className="text-xs text-pharmacy-green">
                                {item.discount_percent}% off (-৳{item.discount_amount?.toFixed(2)})
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatCartQuantity(item)}</TableCell>
                        <TableCell className="text-right">
                          {item.discount_percent && item.discount_percent > 0 ? (
                            <div>
                              <p className="line-through text-xs text-muted-foreground">
                                ৳{item.original_price?.toFixed(2)}
                              </p>
                              <p>৳{item.total_price.toFixed(2)}</p>
                            </div>
                          ) : (
                            `৳${item.total_price.toFixed(2)}`
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => onRemoveFromCart(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1">
                  <Label className="text-xs">Customer Name (Optional)</Label>
                  <Input
                    type="text"
                    placeholder="Walk-in Customer"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Phone (Optional)</Label>
                  <Input
                    type="text"
                    placeholder="N/A"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 p-4 bg-muted rounded-lg mb-4">
                {totalDiscount > 0 && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span>Subtotal</span>
                      <span>৳{cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-pharmacy-green">
                      <span>Total Discount</span>
                      <span>-৳{totalDiscount.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-display font-semibold">Total</span>
                  <span className="text-2xl font-display font-bold text-primary">
                    ৳{cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleCheckout} 
                className="w-full" 
                size="lg"
                disabled={isProcessing}
              >
                <Receipt className="h-4 w-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Complete Sale & Generate Receipt'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
