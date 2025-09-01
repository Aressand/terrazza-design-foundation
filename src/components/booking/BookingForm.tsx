// src/components/booking/BookingForm.tsx

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, ArrowLeft, ArrowRight, CreditCard, Shield, Loader2, Check } from 'lucide-react';
import { cn } from "@/lib/utils";

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  guests: string;
  specialRequests: string;
  agreeToTerms: boolean;
}

interface BookingFormProps {
  totalPrice: number;
  nights: number;
  onComplete: (bookingData: BookingFormData) => void;
  className?: string;
}

const countries = [
  'Italy', 'United States', 'United Kingdom', 'Germany', 'France', 
  'Spain', 'Netherlands', 'Canada', 'Australia', 'Switzerland',
  'Austria', 'Belgium', 'Other'
];

const BookingForm: React.FC<BookingFormProps> = ({
  totalPrice,
  nights,
  onComplete,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    guests: '2',
    specialRequests: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof BookingFormData, string>> = {};

    if (step === 1) {
      if (!formData.guests) newErrors.guests = 'Number of guests is required';
    }

    if (step === 2) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.country) newErrors.country = 'Country is required';
    }

    if (step === 3) {
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3) || submitting) return;
    
    setSubmitting(true);
    try {
      await onComplete(formData);
    } catch (error) {
      console.error('Booking submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateFormData = (field: keyof BookingFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-playfair font-semibold mb-4">Guest Details</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="guests">Number of Guests</Label>
            <Select 
              value={formData.guests} 
              onValueChange={(value) => updateFormData('guests', value)}
              disabled={submitting}
            >
              <SelectTrigger className={cn("mt-1", errors.guests && "border-destructive")}>
                <div className="flex items-center">
                  <Users size={18} className="mr-2 text-sage" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Guest</SelectItem>
                <SelectItem value="2">2 Guests</SelectItem>
              </SelectContent>
            </Select>
            {errors.guests && <p className="text-destructive text-sm mt-1">{errors.guests}</p>}
          </div>

          <div className="bg-stone-light rounded-lg p-4">
            <h4 className="font-medium mb-2">Your Stay Summary</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{nights} night{nights > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span>Guests:</span>
                <span>{formData.guests} guest{formData.guests !== '1' ? 's' : ''}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Total:</span>
                <span className="text-terracotta">€{totalPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-playfair font-semibold mb-4">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData('firstName', e.target.value)}
              className={cn("mt-1", errors.firstName && "border-destructive")}
              placeholder="Enter your first name"
              disabled={submitting}
            />
            {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData('lastName', e.target.value)}
              className={cn("mt-1", errors.lastName && "border-destructive")}
              placeholder="Enter your last name"
              disabled={submitting}
            />
            {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              className={cn("mt-1", errors.email && "border-destructive")}
              placeholder="your@email.com"
              disabled={submitting}
            />
            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="country">Country *</Label>
            <Select 
              value={formData.country} 
              onValueChange={(value) => updateFormData('country', value)}
              disabled={submitting}
            >
              <SelectTrigger className={cn("mt-1", errors.country && "border-destructive")}>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && <p className="text-destructive text-sm mt-1">{errors.country}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => updateFormData('phone', e.target.value)}
              className="mt-1"
              placeholder="+39 123 456 7890"
              disabled={submitting}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea
              id="specialRequests"
              value={formData.specialRequests}
              onChange={(e) => updateFormData('specialRequests', e.target.value)}
              className="mt-1"
              placeholder="Any special requests or dietary requirements..."
              rows={3}
              disabled={submitting}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-playfair font-semibold mb-4">Payment & Confirmation</h3>
        
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-stone-light rounded-lg p-4">
            <h4 className="font-medium mb-3">Booking Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Guest:</span>
                <span>{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span>{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Guests:</span>
                <span>{formData.guests}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{nights} night{nights > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t pt-2 mt-3">
                <span>Total Amount:</span>
                <span className="text-terracotta">€{totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Mock Payment Form */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-sage" />
              <h4 className="font-medium">Payment Method</h4>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <Shield className="w-8 h-8 text-sage mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                This is a demo booking system.<br/>
                No actual payment will be processed.
              </p>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => updateFormData('agreeToTerms', !!checked)}
                className={cn(errors.agreeToTerms && "border-destructive")}
                disabled={submitting}
              />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I agree to the terms and conditions
                </label>
                <p className="text-xs text-muted-foreground">
                  By checking this box, you agree to our booking terms, privacy policy, and cancellation policy.
                </p>
              </div>
            </div>
            {errors.agreeToTerms && <p className="text-destructive text-sm">{errors.agreeToTerms}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-8", className)}>
      {/* Step Progress */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              currentStep === step 
                ? "bg-sage text-white" 
                : currentStep > step 
                ? "bg-sage/20 text-sage"
                : "bg-gray-200 text-gray-500"
            )}>
              {currentStep > step ? <Check size={16} /> : step}
            </div>
            {step < 3 && (
              <div className={cn(
                "w-12 h-0.5 mx-2",
                currentStep > step ? "bg-sage" : "bg-gray-200"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1 || submitting}
          className="flex items-center"
        >
          <ArrowLeft size={16} className="mr-2" />
          Previous
        </Button>

        {currentStep < 3 ? (
          <Button
            onClick={handleNext}
            disabled={submitting}
            className="flex items-center bg-sage hover:bg-sage/90"
          >
            Next
            <ArrowRight size={16} className="ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center bg-terracotta hover:bg-terracotta/90 min-w-[120px]"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default BookingForm;