// src/pages/PriceManagement.tsx - COMPLETELY REBUILT

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import PriceCalendar from '@/components/admin/PriceCalendar';
import BulkPriceModal from '@/components/admin/BulkPriceModal';
import { 
  DollarSign, 
  Calendar, 
  AlertCircle, 
  Info,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { ROOM_NAMES, type RoomType } from '@/utils/roomMapping';
import { useAvailabilityManagement } from '@/hooks/useAvailabilityManagement';

// Room configuration
const ROOM_TABS = [
  { id: 'garden' as RoomType, name: ROOM_NAMES.garden, description: 'Private rooftop garden, 2 guests' },
  { id: 'stone' as RoomType, name: ROOM_NAMES.stone, description: 'Historic stone vault, 4 guests' },
  { id: 'terrace' as RoomType, name: ROOM_NAMES.terrace, description: 'Panoramic terrace, 3 guests' },
  { id: 'modern' as RoomType, name: ROOM_NAMES.modern, description: 'Contemporary luxury, 4 guests' }
];

const PriceManagement = () => {
  // Simple state management
  const [activeTab, setActiveTab] = useState<RoomType>('garden');
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  // Single hook for active room - no conflicts
  const { 
    availabilityData,
    roomData,
    loading,
    error,
    bulkSetPrices
  } = useAvailabilityManagement(activeTab);

  // Simple bulk modal handler
  const handleBulkUpdate = async (startDate: Date, endDate: Date, price: number) => {
    try {
      console.log(`💰 Bulk price update for ${activeTab}: €${price}`);
      await bulkSetPrices(startDate, endDate, price);
      setBulkModalOpen(false);
    } catch (error) {
      console.error('❌ Bulk update failed:', error);
      throw error;
    }
  };

  // Simple modal opener - just opens modal for current tab
  const openBulkModal = () => {
    setBulkModalOpen(true);
  };

  // Calculate stats
  const priceOverrides = availabilityData.filter(day => day.hasOverride).length;
  const basePrice = roomData?.base_price || 0;

  return (
    <AdminLayout title="Price Management - Terrazza Santa Chiara">
      <div className="space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-playfair text-sage flex items-center">
                  <DollarSign className="h-6 w-6 mr-2" />
                  Price Management
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Set custom pricing for specific dates. Click on any date to modify prices.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/admin" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Stats - Only show when data is loaded */}
        {roomData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Base Price</p>
                    <p className="text-2xl font-bold">€{basePrice}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-sage" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Price Overrides</p>
                    <p className="text-2xl font-bold">{priceOverrides}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-sage" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Room Status</p>
                    <p className="text-lg font-semibold text-green-600">Active</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Room Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Select Room
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as RoomType)}>
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                {ROOM_TABS.map((room) => (
                  <TabsTrigger key={room.id} value={room.id} className="text-xs">
                    {room.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {ROOM_TABS.map((room) => (
                <TabsContent key={room.id} value={room.id} className="mt-6">
                  
                  {/* Room Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-sage/5 rounded-lg mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{room.name}</h3>
                      <p className="text-sm text-muted-foreground">{room.description}</p>
                      {roomData && (
                        <p className="text-sm font-medium mt-1">Base Price: €{basePrice}/night</p>
                      )}
                    </div>
                    <div className="mt-3 sm:mt-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={openBulkModal}
                        disabled={loading}
                      >
                        Set Bulk Prices
                      </Button>
                    </div>
                  </div>

                  {/* Price Calendar */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Price Calendar</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Click on any date to set custom pricing. Dates showing base price (€{basePrice}) can be customized.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <PriceCalendar 
                        roomType={room.id}
                        basePrice={basePrice}
                        priceData={availabilityData}
                      />
                    </CardContent>
                  </Card>
                  
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-900">How to use Price Management:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Click on any date</strong> to set a custom price for that specific date</li>
                  <li>• <strong>Base price</strong> is used when no custom price is set</li>
                  <li>• <strong>Set Bulk Prices</strong> to apply the same price to multiple dates</li>
                  <li>• Changes take effect immediately and will be used for new bookings</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Bulk Price Modal - Clean and Simple */}
      {roomData && (
        <BulkPriceModal
          isOpen={bulkModalOpen}
          onClose={() => setBulkModalOpen(false)}
          onUpdate={handleBulkUpdate}
          roomName={roomData.name}
          basePrice={roomData.base_price}
        />
      )}
    </AdminLayout>
  );
};

export default PriceManagement;