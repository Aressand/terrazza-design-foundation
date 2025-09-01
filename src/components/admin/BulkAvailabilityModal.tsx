// src/components/admin/BulkAvailabilityModal.tsx

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  CalendarIcon, 
  Loader2, 
  AlertCircle,
  Calendar as CalendarIconSolid,
  X,
  Check
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface BulkAvailabilityModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (startDate: Date, endDate: Date, available: boolean) => Promise<void>;
  roomName: string;
}

const BulkAvailabilityModal: React.FC<BulkAvailabilityModalProps> = ({
  open,
  onClose,
  onConfirm,
  roomName
}) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [action, setAction] = useState<'block' | 'unblock'>('block');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (endDate < startDate) {
      setError('End date must be after start date');
      return;
    }

    const days = differenceInDays(endDate, startDate) + 1; // Include both start and end dates
    if (days > 90) {
      setError('Cannot modify more than 90 days at once');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const available = action === 'unblock';
      await onConfirm(startDate, endDate, available);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setStartDate(undefined);
      setEndDate(undefined);
      setAction('block');
      setError(null);
      onClose();
    }
  };

  const days = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;
  const isValid = startDate && endDate && endDate >= startDate && days <= 90;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CalendarIconSolid className="w-5 h-5 mr-2" />
            Bulk Availability Update
          </DialogTitle>
          <DialogDescription>
            Update availability for multiple dates in <strong>{roomName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Selection */}
          <div className="space-y-2">
            <Label>Action</Label>
            <Select value={action} onValueChange={(value: 'block' | 'unblock') => setAction(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="block">
                  <div className="flex items-center">
                    <X className="w-4 h-4 mr-2 text-destructive" />
                    Block dates (make unavailable)
                  </div>
                </SelectItem>
                <SelectItem value="unblock">
                  <div className="flex items-center">
                    <Check className="w-4 h-4 mr-2 text-sage" />
                    Unblock dates (make available)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Selection */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                    disabled={submitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                    disabled={submitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => 
                      date < new Date() || (startDate && date < startDate)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Summary */}
          {isValid && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-1">Summary:</p>
              <p className="text-sm text-muted-foreground">
                <strong>{action === 'block' ? 'Block' : 'Unblock'}</strong> {days} day{days !== 1 ? 's' : ''} 
                {' '}from {format(startDate!, 'MMM d')} to {format(endDate!, 'MMM d, yyyy')}
              </p>
              {days > 30 && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Large date range selected ({days} days)
                </p>
              )}
            </div>
          )}

          {/* Warning for blocking dates */}
          {action === 'block' && isValid && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Blocking dates will prevent new bookings for those dates. 
                Existing confirmed bookings will not be affected.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            variant={action === 'block' ? 'destructive' : 'default'}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `${action === 'block' ? 'Block' : 'Unblock'} ${days} day${days !== 1 ? 's' : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAvailabilityModal;