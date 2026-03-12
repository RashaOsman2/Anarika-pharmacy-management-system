import { useState, useMemo } from 'react';
import { StockItem, UnitType } from '@/types/pharmacy';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, Loader2 } from 'lucide-react';

interface RestockModalProps {
  open: boolean;
  onClose: () => void;
  stock: StockItem[];
  onRestock: (medicineId: string, quantity: number, restockType?: 'strip' | 'piece' | 'unit') => Promise<void>;
  onAddNew: (name: string, quantity: number, price: number, unitType: UnitType, piecesPerUnit: number) => Promise<void>;
}

const unitTypeOptions: { value: UnitType; label: string }[] = [
  { value: 'strip', label: 'Strip' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'box', label: 'Box' },
  { value: 'injection', label: 'Injection' },
];

export default function RestockModal({ open, onClose, stock, onRestock, onAddNew }: RestockModalProps) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [quantity, setQuantity] = useState('');
  const [restockType, setRestockType] = useState<'strip' | 'piece' | 'unit'>('strip');
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newUnitType, setNewUnitType] = useState<UnitType>('strip');
  const [newPiecesPerUnit, setNewPiecesPerUnit] = useState('10');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const selectedStockItem = useMemo(() => {
    return stock.find(s => s.id === selectedMedicine);
  }, [stock, selectedMedicine]);

  const handleSubmit = async () => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      toast({
        variant: 'destructive',
        title: 'Invalid quantity',
        description: 'Please enter a valid quantity.',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'existing') {
        if (!selectedMedicine) {
          toast({
            variant: 'destructive',
            title: 'Select a medicine',
            description: 'Please select a medicine to restock.',
          });
          setIsLoading(false);
          return;
        }
        
        // Calculate actual pieces to add
        let piecesToAdd = qty;
        if (selectedStockItem?.unit_type === 'strip' && restockType === 'strip') {
          piecesToAdd = qty * selectedStockItem.pieces_per_unit;
        }
        
        await onRestock(selectedMedicine, piecesToAdd, restockType);
        toast({
          title: 'Stock updated!',
          description: `Added ${qty} ${restockType === 'strip' ? 'strips' : restockType === 'piece' ? 'pieces' : 'units'} to inventory.`,
        });
      } else {
        if (!newName.trim()) {
          toast({
            variant: 'destructive',
            title: 'Enter medicine name',
            description: 'Please enter the medicine name.',
          });
          setIsLoading(false);
          return;
        }
        const price = parseFloat(newPrice);
        if (isNaN(price) || price <= 0) {
          toast({
            variant: 'destructive',
            title: 'Invalid price',
            description: 'Please enter a valid price.',
          });
          setIsLoading(false);
          return;
        }
        
        const piecesPerUnit = newUnitType === 'strip' ? parseInt(newPiecesPerUnit) || 10 : 1;
        // For strip type, store quantity as pieces
        const actualQuantity = newUnitType === 'strip' ? qty * piecesPerUnit : qty;
        
        await onAddNew(newName.trim(), actualQuantity, price, newUnitType, piecesPerUnit);
        toast({
          title: 'Medicine added!',
          description: `${newName} added to inventory.`,
        });
      }
      resetForm();
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update stock. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedMedicine('');
    setQuantity('');
    setRestockType('strip');
    setNewName('');
    setNewPrice('');
    setNewUnitType('strip');
    setNewPiecesPerUnit('10');
    setMode('existing');
  };

  const getRestockTypeOptions = () => {
    if (!selectedStockItem) return null;
    
    if (selectedStockItem.unit_type === 'strip') {
      return (
        <div className="space-y-2">
          <Label>Restock By</Label>
          <RadioGroup value={restockType} onValueChange={(v) => setRestockType(v as 'strip' | 'piece')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="strip" id="strip" />
              <Label htmlFor="strip" className="font-normal">
                Strip ({selectedStockItem.pieces_per_unit} pcs each)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="piece" id="piece" />
              <Label htmlFor="piece" className="font-normal">Piece (loose)</Label>
            </div>
          </RadioGroup>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) { resetForm(); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Restock Inventory
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="flex gap-2">
            <Button
              variant={mode === 'existing' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setMode('existing')}
            >
              Existing Medicine
            </Button>
            <Button
              variant={mode === 'new' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setMode('new')}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Medicine
            </Button>
          </div>

          {mode === 'existing' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Medicine</Label>
                <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose medicine" />
                  </SelectTrigger>
                  <SelectContent>
                    {stock.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.medicine_name} ({item.unit_type === 'strip' 
                          ? `${Math.floor(item.quantity / item.pieces_per_unit)} strips + ${item.quantity % item.pieces_per_unit} pcs`
                          : `${item.quantity} ${item.unit_type}s`
                        })
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {getRestockTypeOptions()}
              
              <div className="space-y-2">
                <Label>
                  Quantity to Add 
                  {selectedStockItem?.unit_type === 'strip' && (
                    <span className="text-muted-foreground text-sm ml-1">
                      ({restockType === 'strip' ? 'strips' : 'pieces'})
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
                {selectedStockItem?.unit_type === 'strip' && restockType === 'strip' && quantity && (
                  <p className="text-xs text-muted-foreground">
                    = {parseInt(quantity) * selectedStockItem.pieces_per_unit} pieces total
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Medicine Name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Naprosyn Plus 500mg"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Unit Type</Label>
                <Select value={newUnitType} onValueChange={(v) => setNewUnitType(v as UnitType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {newUnitType === 'strip' && (
                <div className="space-y-2">
                  <Label>Pieces per Strip</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newPiecesPerUnit}
                    onChange={(e) => setNewPiecesPerUnit(e.target.value)}
                    placeholder="e.g., 10"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Initial Quantity ({newUnitType === 'strip' ? 'strips' : 'units'})</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Quantity"
                  />
                  {newUnitType === 'strip' && quantity && newPiecesPerUnit && (
                    <p className="text-xs text-muted-foreground">
                      = {parseInt(quantity) * parseInt(newPiecesPerUnit)} pieces total
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>MRP per {newUnitType === 'strip' ? 'Strip' : 'Unit'} (৳)</Label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="0.00"
                  />
                  {newUnitType === 'strip' && newPrice && newPiecesPerUnit && (
                    <p className="text-xs text-muted-foreground">
                      ৳{(parseFloat(newPrice) / parseInt(newPiecesPerUnit)).toFixed(2)}/pc
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  {mode === 'existing' ? 'Update Stock' : 'Add Medicine'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}