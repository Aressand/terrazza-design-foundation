// src/components/admin/BulkPriceModal.tsx

import React, { useState } from 'react';
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
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DollarSign, 
  Calendar as CalendarIcon, 
  AlertCircle, 
  Target,
  RotateCcw
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { DateRange } from "react-day-picker";

interface BulkPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (startDate: Date, endDate: Date, price: number) => Promise<void>;
  roomName: string;
  basePrice: number;
}

const BulkPriceModal: React.FC<BulkPriceModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  roomName,
  basePrice
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [priceInput, setPriceInput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setDateRange(undefined);
      setPriceInput('');
      setError(null);
    }
  }, [isOpen]);

  // Validate price input
  const validatePrice = (value: string): number | null => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;
    if (numValue < 10) return null; // Minimum reasonable price
    if (numValue > 1000) return null; // Maximum reasonable price
    return numValue;
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    // Allow only numbers and decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    setPriceInput(cleanValue);
    setError(null);
  };

  // Handle bulk update
  const handleBulkUpdate = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      setError('Please select a date range');
      return;
    }

    const validatedPrice = validatePrice(priceInput);
    if (validatedPrice === null) {
      setError('Please enter a valid price between €10 and €1000');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onUpdate(dateRange.from, dateRange.to, validatedPrice);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update prices');
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary data
  const validPrice = validatePrice(priceInput);
  const totalDays = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from) + 1 
    : 0;
  const isValidRange = totalDays > 0;
  const canSubmit = isValidRange && validPrice !== null && !loading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-sage" />
            Bulk Price Update
          </DialogTitle>
          <DialogDescription>
            Set the same price for multiple dates in <strong>{roomName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Room Info */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{roomName}</p>
                  <p className="text-sm text-muted-foreground">Current base price: €{basePrice}/night</p>
                </div>
                <DollarSign className="w-8 h-8 text-sage" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Range Selection */}
            <div className="space-y-3">
              <Label className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Select Date Range
              </Label>
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
              {dateRange?.from && dateRange?.to && (
                <div className="text-xs text-muted-foreground p-2 bg-sage/5 rounded">
                  <p><strong>From:</strong> {format(dateRange.from, 'MMM dd, yyyy')}</p>
                  <p><strong>To:</strong> {format(dateRange.to, 'MMM dd, yyyy')}</p>
                  <p><strong>Total days:</strong> {totalDays}</p>
                </div>
              )}
            </div>

            {/* Price Setting */}
            <div className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="bulk-price">Set Price for All Selected Dates</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    €
                  </span>
                  <Input
                    id="bulk-price"
                    type="text"
                    value={priceInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={basePrice.toString()}
                    className="pl-8"
                    disabled={loading}
                  />
                </div>
                
                {/* Quick Price Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPriceInput(basePrice.toString())}
                    disabled={loading}
                  >
                    Base (€{basePrice})
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPriceInput((basePrice + 20).toString())}
                    disabled={loading}
                  >
                    +€20
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPriceInput((basePrice + 35).toString())}
                    disabled={loading}
                  >
                    +€35
                  </Button>
                </div>
              </div>

              {/* Price Preview */}
              {validPrice && isValidRange && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <p className="font-medium text-green-800">Preview</p>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Price per night:</span>
                          <span className="font-medium">€{validPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Number of nights:</span>
                          <span className="font-medium">{totalDays}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span>Potential revenue:</span>
                          <span className="font-semibold">€{(validPrice * totalDays).toLocaleString()}</span>
                        </div>
                        {validPrice !== basePrice && (
                          <div className="text-xs text-muted-foreground mt-2">
                            {validPrice > basePrice ? (
                              <span className="text-green-600">
                                +€{((validPrice - basePrice) * totalDays).toLocaleString()} above base pricing
                              </span>
                            ) : (
                              <span className="text-orange-600">
                                -€{((basePrice - validPrice) * totalDays).toLocaleString()} below base pricing
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Warning about existing bookings */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> This will only affect dates that are currently available. 
              Existing bookings will not be modified.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkUpdate}
            disabled={!canSubmit}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Updating...
              </>
            ) : (
              `Update ${totalDays} Date${totalDays !== 1 ? 's' : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkPriceModal;