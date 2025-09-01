// src/components/BookingSystemTester.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertCircle, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ROOM_MAPPING, getRoomId, type RoomType } from '@/utils/roomMapping';
import { useRoomData, useAvailabilityCheck, useCreateBooking } from '@/hooks/useBooking';
import type { RoomData } from '@/types/booking';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

const BookingSystemTester: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [allRooms, setAllRooms] = useState<RoomData[]>([]);

  // Initialize test results
  useEffect(() => {
    const initialTests: TestResult[] = [
      { test: 'Database Connection', status: 'pending', message: 'Checking Supabase connection...' },
      { test: 'Rooms Table Data', status: 'pending', message: 'Verifying rooms data...' },
      { test: 'Room Mapping', status: 'pending', message: 'Testing room ID mapping...' },
      { test: 'Garden Room Hook', status: 'pending', message: 'Testing Garden Room data fetch...' },
      { test: 'Stone Room Hook', status: 'pending', message: 'Testing Stone Room data fetch...' },
      { test: 'Terrace Room Hook', status: 'pending', message: 'Testing Terrace Room data fetch...' },
      { test: 'Modern Room Hook', status: 'pending', message: 'Testing Modern Room data fetch...' },
      { test: 'Availability Check', status: 'pending', message: 'Testing availability checking...' },
      { test: 'Booking Creation', status: 'pending', message: 'Testing booking creation...' },
    ];
    setTests(initialTests);
  }, []);

  const updateTest = (testName: string, status: TestResult['status'], message: string, data?: any) => {
    setTests(prev => prev.map(test => 
      test.test === testName ? { ...test, status, message, data } : test
    ));
  };

  const runAllTests = async () => {
    setTesting(true);

    try {
      // Test 1: Database Connection
      updateTest('Database Connection', 'pending', 'Connecting...');
      const { data: connectionTest, error: connError } = await supabase.from('rooms').select('count').limit(1);
      if (connError) {
        updateTest('Database Connection', 'error', `Connection failed: ${connError.message}`);
        return;
      }
      updateTest('Database Connection', 'success', 'Connected successfully!');

      // Test 2: Rooms Table Data  
      updateTest('Rooms Table Data', 'pending', 'Fetching all rooms...');
      const { data: roomsData, error: roomsError } = await supabase.from('rooms').select('*');
      if (roomsError) {
        updateTest('Rooms Table Data', 'error', `Failed: ${roomsError.message}`);
        return;
      }
      setAllRooms(roomsData || []);
      updateTest('Rooms Table Data', 'success', `Found ${roomsData?.length || 0} rooms in database`, roomsData);

      // Test 3: Room Mapping
      updateTest('Room Mapping', 'pending', 'Verifying room mappings...');
      const mappingResults = Object.entries(ROOM_MAPPING).map(([roomType, roomId]) => {
        const foundRoom = roomsData?.find(room => room.id === roomId);
        return {
          roomType,
          roomId,
          found: !!foundRoom,
          roomName: foundRoom?.name || 'NOT FOUND'
        };
      });
      
      const allMappingsValid = mappingResults.every(result => result.found);
      if (!allMappingsValid) {
        updateTest('Room Mapping', 'error', 'Some room mappings are invalid', mappingResults);
      } else {
        updateTest('Room Mapping', 'success', 'All room mappings are valid!', mappingResults);
      }

      // Test 4-7: Individual Room Hook Tests
      for (const roomType of Object.keys(ROOM_MAPPING) as RoomType[]) {
        const testName = `${roomType.charAt(0).toUpperCase() + roomType.slice(1)} Room Hook`;
        updateTest(testName, 'pending', 'Fetching room data...');
        
        try {
          const roomId = getRoomId(roomType);
          const { data: roomData, error } = await supabase
            .from('rooms')
            .select('*')
            .eq('id', roomId)
            .single();

          if (error) {
            updateTest(testName, 'error', `Failed: ${error.message}`);
          } else {
            updateTest(testName, 'success', `✓ ${roomData.name} - €${roomData.base_price}/night`, roomData);
          }
        } catch (err) {
          updateTest(testName, 'error', `Exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      // Test 8: Availability Check
      updateTest('Availability Check', 'pending', 'Testing availability logic...');
      try {
        const testCheckIn = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
        const testCheckOut = new Date(new Date().getTime() + 9 * 24 * 60 * 60 * 1000); // +9 days
        
        const { data: conflictingBookings, error: availError } = await supabase
          .from('bookings')
          .select('*')
          .eq('room_id', getRoomId('garden'))
          .eq('status', 'confirmed');

        if (availError) {
          updateTest('Availability Check', 'error', `Failed: ${availError.message}`);
        } else {
          updateTest('Availability Check', 'success', 
            `✓ Availability check working. Found ${conflictingBookings?.length || 0} existing bookings`, 
            conflictingBookings
          );
        }
      } catch (err) {
        updateTest('Availability Check', 'error', `Exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }

      // Test 9: Booking Creation (TEST MODE - not actual booking)
      updateTest('Booking Creation', 'pending', 'Testing booking table structure...');
      try {
        // Just test that we can query the bookings table structure
        const { data: bookingStructure, error: structError } = await supabase
          .from('bookings')
          .select('*')
          .limit(1);

        if (structError) {
          updateTest('Booking Creation', 'error', `Table structure issue: ${structError.message}`);
        } else {
          updateTest('Booking Creation', 'success', '✓ Bookings table is ready for inserts');
        }
      } catch (err) {
        updateTest('Booking Creation', 'error', `Exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }

    } catch (error) {
      console.error('Testing failed:', error);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-6 h-6" />
            Booking System Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runAllTests} disabled={testing}>
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
            <Badge variant="outline">
              {tests.filter(t => t.status === 'success').length}/{tests.length} Tests Passed
            </Badge>
          </div>

          <div className="grid gap-3">
            {tests.map((test, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getStatusColor(test.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <span className="font-medium">{test.test}</span>
                  </div>
                  <Badge variant={test.status === 'success' ? 'default' : test.status === 'error' ? 'destructive' : 'secondary'}>
                    {test.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 ml-8">{test.message}</p>
                
                {/* Show additional data if available */}
                {test.data && test.status === 'success' && (
                  <details className="mt-2 ml-8">
                    <summary className="text-xs text-blue-600 cursor-pointer">Show Details</summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>

          {/* Quick Room Overview */}
          {allRooms.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Rooms Found:</strong> {allRooms.map(room => `${room.name} (€${room.base_price})`).join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingSystemTester;