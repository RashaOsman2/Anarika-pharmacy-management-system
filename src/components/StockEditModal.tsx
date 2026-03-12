import { useState, useEffect } from 'react';
import { StockItem, UnitType } from '@/types/pharmacy';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Edit, Loader2, Trash2, Package, Pill } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface StockEditModalProps {
  open: boolean;
  onClose: () => void;
  stockItem: StockItem | null;
  onSave: (id: string, medicineName: string, quantity: number, price: number, unitType?: UnitType, piecesPerUnit?: number) => Promise<void>;
  onEmptyStock?: (id: string) => Promise<void>;
  onRemove?: (id: string) => Promise<void>;
}

const unitTypeOptions: { value: UnitType; label: string }[] = [
  { value: 'strip', label: 'Strip' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'box', label: 'Box' },
  { value: 'injection', label: 'Injection' },
];

export default function StockEditModal({ open, onClose, stockItem, onSave, onEmptyStock, onRemove }: StockEditModalProps) {
  const [medicineName, setMedicineName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [unitType, setUnitType] = useState<UnitType>('strip');
  const [piecesPerUnit, setPiecesPerUnit] = useState('10');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmptying, setIsEmptying] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (stockItem) {
      setMedicineName(stockItem.medicine_name);
      setQuantity(stockItem.quantity.toString());
      setPrice(Number(stockItem.price).toFixed(2));
      setUnitType(stockItem.unit_type || 'strip');
      setPiecesPerUnit((stockItem.pieces_per_unit || 10).toString());
    }
  }, [stockItem]);

  const handleSave = async () => {
    if (!stockItem) return;

    const name = medicineName.trim();
    if (!name) {
      toast({
        variant: 'destructive',
        title: 'Invalid name',
        description: 'Please enter a valid medicine name.',
      });
      return;
    }

    const qty = parseInt(quantity);
    const prc = parseFloat(price);
    const ppu = parseInt(piecesPerUnit) || 10;

    if (isNaN(qty) || qty < 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid quantity',
        description: 'Please enter a valid quantity (0 or more).',
      });
      return;
    }

    if (isNaN(prc) || prc < 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid price',
        description: 'Please enter a valid price.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(stockItem.id, name, qty, prc, unitType, ppu);
      toast({
        title: 'Stock updated!',
        description: `${name} has been updated.`,
      });
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

  const handleEmptyStock = async () => {
    if (!stockItem || !onEmptyStock) return;

    setIsEmptying(true);
    try {
      await onEmptyStock(stockItem.id);
      toast({
        title: 'Stock emptied!',
        description: `${stockItem.medicine_name} quantity set to 0.`,
      });
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to empty stock. Please try again.',
      });
    } finally {
      setIsEmptying(false);
    }
  };

  const handleRemove = async () => {
    if (!stockItem || !onRemove) return;

    setIsRemoving(true);
    try {
      await onRemove(stockItem.id);
      toast({
        title: 'Medicine removed!',
        description: `${stockItem.medicine_name} has been removed from stock.`,
      });
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove medicine. Please try again.',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  if (!stockItem) return null;

  const formatCurrentQuantity = () => {
    if (stockItem.unit_type === 'strip') {
      const strips = Math.floor(stockItem.quantity / stockItem.pieces_per_unit);
      const pieces = stockItem.quantity % stockItem.pieces_per_unit;
      return `${strips} strips + ${pieces} pcs (${stockItem.quantity} total pcs)`;
    }
    return `${stockItem.quantity} ${stockItem.unit_type}s`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Edit Stock
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Medicine Name</Label>
            <Input
              type="text"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              placeholder="Enter medicine name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Unit Type</Label>
              <Select value={unitType} onValueChange={(v) => setUnitType(v as UnitType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <Pill className="h-3 w-3" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {unitType === 'strip' && (
              <div className="space-y-2">
                <Label>Pieces per Strip</Label>
                <Input
                  type="number"
                  min="1"
                  value={piecesPerUnit}
                  onChange={(e) => setPiecesPerUnit(e.target.value)}
                  placeholder="10"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Quantity (in pieces for strips)</Label>
            <Input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
            />
            <p className="text-xs text-muted-foreground">
              Current: {formatCurrentQuantity()}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Price per {unitType === 'strip' ? 'Strip' : 'Unit'} (৳ BDT)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
            />
            <p className="text-xs text-muted-foreground">
              Current: ৳{Number(stockItem.price).toFixed(2)}
              {stockItem.unit_type === 'strip' && (
                <span> (৳{(Number(stockItem.price) / stockItem.pieces_per_unit).toFixed(2)}/pc)</span>
              )}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={isLoading || isEmptying || isRemoving}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={isLoading || isEmptying || isRemoving}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>

          {/* Empty Stock & Remove Medicine */}
          <div className="flex gap-3 pt-2 border-t">
            {onEmptyStock && (
              <Button 
                variant="outline" 
                className="flex-1 text-orange-600 border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                onClick={handleEmptyStock}
                disabled={isLoading || isEmptying || isRemoving || stockItem.quantity === 0}
              >
                {isEmptying ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Package className="h-4 w-4 mr-2" />
                )}
                Empty Stock
              </Button>
            )}
            {onRemove && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                    disabled={isLoading || isEmptying || isRemoving}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Medicine?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove "{stockItem.medicine_name}" from stock. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {isRemoving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}