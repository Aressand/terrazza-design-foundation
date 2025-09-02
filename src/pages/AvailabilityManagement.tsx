// src/pages/AvailabilityManagement.tsx - FIXED VERSION

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import AvailabilityCalendar from '@/components/admin/AvailabilityCalendar';
import BulkAvailabilityModal from '@/components/admin/BulkAvailabilityModal';
import { 
  Calendar, 
  Settings, 
  AlertCircle, 
  Info,
  CalendarX,
  CalendarCheck,
  ArrowLeft
} from 'lucide-react';
import { ROOM_NAMES, type RoomType } from '@/utils/roomMapping';
import { useAvailabilityManagement } from '@/hooks/useAvailabilityManagement';

interface RoomTabData {
  id: RoomType;
  name: string;
  description: string;
}

const roomTabs: RoomTabData[] = [
  {
    id: 'garden',
    name: ROOM_NAMES.garden,
    description: 'Private rooftop garden, 2 guests'
  },
  {
    id: 'stone',
    name: ROOM_NAMES.stone,
    description: 'Historic stone vault, 4 guests'
  },
  {
    id: 'terrace',
    name: ROOM_NAMES.terrace,
    description: 'Panoramic terrace, 3 guests'
  },
  {
    id: 'modern',
    name: ROOM_NAMES.modern,
    description: 'Contemporary luxury, 4 guests'
  }
];

const AvailabilityManagement = () => {
  const [activeTab, setActiveTab] = useState<RoomType>('garden');
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkModalRoom, setBulkModalRoom] = useState<RoomType>('garden');

  // Get availability data for active room to show summary
  const { availabilityData: activeRoomData } = useAvailabilityManagement(activeTab);
  
  // 🔴 CRITICAL FIX: Get the bulk function for the correct room
  const { bulkToggleAvailability, loading: bulkLoading } = useAvailabilityManagement(bulkModalRoom);

  const openBulkModal = (roomType: RoomType) => {
    setBulkModalRoom(roomType);
    setBulkModalOpen(true);
  };

  // 🔴 CRITICAL FIX: Actually call the bulk function instead of page reload
  const handleBulkUpdate = async (startDate: Date, endDate: Date, available: boolean) => {
    try {
      console.log(`🔄 Bulk update: ${bulkModalRoom} from ${startDate.toISOString()} to ${endDate.toISOString()} - ${available ? 'AVAILABLE' : 'BLOCKED'}`);
      await bulkToggleAvailability(startDate, endDate, available);
      console.log('✅ Bulk update completed successfully');
    } catch (error) {
      console.error('❌ Bulk update failed:', error);
      throw error; // Re-throw so the modal can show the error
    }
  };

  const activeRoomTabData = roomTabs.find(room => room.id === activeTab);
  const blockedDates = activeRoomData.filter(day => !day.isAvailable).length;
  const bookedDates = activeRoomData.filter(day => day.isBooked).length;
  const availableDates = activeRoomData.length - blockedDates - bookedDates;

  return (
    <AdminLayout title="Availability Management">
      <div className="space-y-6">
        {/* 🔴 FIX 2: Back to Dashboard Button */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Room Availability Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-sage/10 rounded-lg">
                <CalendarCheck className="w-8 h-8 mx-auto mb-2 text-sage" />
                <div className="text-2xl font-bold text-sage">{availableDates}</div>
                <div className="text-sm text-muted-foreground">Available Days</div>
              </div>
              <div className="text-center p-4 bg-destructive/10 rounded-lg">
                <CalendarX className="w-8 h-8 mx-auto mb-2 text-destructive" />
                <div className="text-2xl font-bold text-destructive">{blockedDates}</div>
                <div className="text-sm text-muted-foreground">Blocked Days</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold text-muted-foreground">{bookedDates}</div>
                <div className="text-sm text-muted-foreground">Booked Days</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>How to use:</strong> Click individual dates to block/unblock them, or use the "Bulk Update" 
            button to modify multiple dates at once. Blocked dates will not appear as available for new bookings.
          </AlertDescription>
        </Alert>

        {/* Room Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as RoomType)}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <TabsList className="grid w-full md:w-auto grid-cols-4">
              {roomTabs.map((room) => (
                <TabsTrigger key={room.id} value={room.id} className="text-xs">
                  {room.name.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openBulkModal(activeTab)}
                className="flex items-center"
                disabled={bulkLoading}
              >
                <Settings className="w-4 h-4 mr-2" />
                Bulk Update
              </Button>
            </div>
          </div>

          {roomTabs.map((room) => (
            <TabsContent key={room.id} value={room.id} className="space-y-4">
              {/* Room Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{room.description}</p>
                </CardHeader>
              </Card>

              {/* Calendar */}
              <AvailabilityCalendar
                roomType={room.id}
                roomName={room.name}
              />
            </TabsContent>
          ))}
        </Tabs>

        {/* Bulk Update Modal */}
        <BulkAvailabilityModal
          open={bulkModalOpen}
          onClose={() => setBulkModalOpen(false)}
          onConfirm={handleBulkUpdate}
          roomName={roomTabs.find(room => room.id === bulkModalRoom)?.name || ''}
        />

        {/* Additional Info */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-800">
                  Important Notes
                </p>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Blocking dates prevents new bookings but doesn't cancel existing ones</li>
                  <li>• Booked dates (gray) cannot be modified - contact guests to cancel if needed</li>
                  <li>• Changes are applied immediately and affect the booking system in real-time</li>
                  <li>• Use bulk updates for efficiently managing long periods (weekends, holidays, maintenance)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AvailabilityManagement;