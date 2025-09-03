// src/components/admin/PriceEditModal.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, Calendar, AlertCircle, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

interface PriceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  currentPrice: number;
  basePrice: number;
  onUpdate: (date: Date, newPrice: number | null) => Promise<void>;
}

const PriceEditModal: React.FC<PriceEditModalProps> = ({
  isOpen,
  onClose,
  date,
  currentPrice,
  basePrice,
  onUpdate
}) => {
  const [priceInput, setPriceInput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update price input when modal opens with different date
  useEffect(() => {
    if (isOpen && date) {
      setPriceInput(currentPrice.toString());
      setError(null);
    }
  }, [isOpen, date, currentPrice]);

  // Validate price input
  const validatePrice = (value: string): number | null => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;
    if (numValue < 10) return null; // Minimum reasonable price
    if (numValue > 1000) return null; // Maximum reasonable price
    return numValue;
  };

  // Handle price update
  const handleUpdatePrice = async () => {
    if (!date) return;

    const validatedPrice = validatePrice(priceInput);
    if (validatedPrice === null) {
      setError('Please enter a valid price between €10 and €1000');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onUpdate(date, validatedPrice);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update price');
    } finally {
      setLoading(false);
    }
  };

  // Handle reset to base price
  const handleResetPrice = async () => {
    if (!date) return;

    setLoading(true);
    setError(null);

    try {
      await onUpdate(date, null); // null means use base price
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset price');
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    // Allow only numbers and decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    setPriceInput(cleanValue);
    setError(null);
  };

  const isCustomPrice = currentPrice !== basePrice;
  const inputPrice = validatePrice(priceInput);
  const willChange = inputPrice !== null && inputPrice !== currentPrice;

  if (!date) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-sage" />
            Edit Price
          </DialogTitle>
          <DialogDescription className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            {format(date, 'EEEE, MMMM d, yyyy')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Pricing Info */}
          <div className="p-3 bg-sage/5 rounded-lg space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Base Price:</span>
              <span>€{basePrice}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Current Price:</span>
              <span className={isCustomPrice ? "text-orange-600 font-semibold" : ""}>
                €{currentPrice}
                {isCustomPrice && <span className="ml-1 text-xs">(Custom)</span>}
              </span>
            </div>
          </div>

          {/* Price Input */}
          <div className="space-y-2">
            <Label htmlFor="price">Set New Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                €
              </span>
              <Input
                id="price"
                type="text"
                value={priceInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={basePrice.toString()}
                className="pl-8"
                disabled={loading}
              />
            </div>
            {inputPrice && willChange && (
              <p className="text-xs text-muted-foreground">
                Price will change from €{currentPrice} to €{inputPrice}
              </p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Price Preview */}
          {inputPrice && (
            <div className="p-3 border rounded-lg bg-green-50">
              <p className="text-sm font-medium text-green-800">
                Preview: €{inputPrice}/night
              </p>
              {inputPrice > basePrice && (
                <p className="text-xs text-green-600 mt-1">
                  +€{(inputPrice - basePrice).toFixed(0)} above base price
                </p>
              )}
              {inputPrice < basePrice && (
                <p className="text-xs text-green-600 mt-1">
                  -€{(basePrice - inputPrice).toFixed(0)} below base price
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {/* Reset Button - only show if currently has custom price */}
          {isCustomPrice && (
            <Button
              variant="outline"
              onClick={handleResetPrice}
              disabled={loading}
              className="flex items-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Base
            </Button>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdatePrice}
              disabled={loading || !inputPrice || !willChange}
              className="min-w-[100px]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Set Price'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PriceEditModal;