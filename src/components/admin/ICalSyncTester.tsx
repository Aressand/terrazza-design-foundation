// src/components/admin/ICalSyncTester.tsx

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Calendar,
  AlertCircle,
  TestTube2
} from 'lucide-react';
import { useICalSync } from '@/hooks/useICalSync';
import { ROOM_MAPPING } from '@/utils/roomMapping';

// Test URLs per sviluppo (esempi pubblici)
const TEST_ICAL_URLS = {
  'test-basic': 'https://calendar.google.com/calendar/ical/en.italian%23holiday%40group.v.calendar.google.com/public/basic.ics',
  'test-custom': '', // L'utente inserisce il proprio
};

const ICalSyncTester = () => {
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedUrlType, setSelectedUrlType] = useState<string>('test-custom');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [syncSource, setSyncSource] = useState<'airbnb' | 'booking'>('airbnb');
  const [testResults, setTestResults] = useState<string[]>([]);

  const { 
    syncAllCalendars,
    clearAvailabilityData, 
    downloadICalData,
    loading, 
    error, 
    progress,
    lastSyncTime 
  } = useICalSync();

  const addTestResult = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setTestResults(prev => [...prev, `${timestamp} ${emoji} ${message}`]);
  };

  const handleValidateUrl = async () => {
    const url = selectedUrlType === 'test-custom' ? customUrl : TEST_ICAL_URLS[selectedUrlType];
    if (!url) {
      addTestResult('Please enter a URL to validate', 'error');
      return;
    }

    addTestResult(`Validating URL: ${url}`);
    try {
      await downloadICalData(url);
      addTestResult(`URL validation: VALID`, 'success');
    } catch (err) {
      addTestResult(`Validation failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  };

  const handleSyncTest = async () => {
    if (!selectedRoom) {
      addTestResult('Please select a room first', 'error');
      return;
    }

    const url = selectedUrlType === 'test-custom' ? customUrl : TEST_ICAL_URLS[selectedUrlType];
    if (!url) {
      addTestResult('Please enter a calendar URL', 'error');
      return;
    }

    // Clear previous results for new test
    setTestResults([]);
    addTestResult(`Starting sync test for room: ${selectedRoom}`);
    addTestResult(`URL: ${url}`);
    addTestResult(`Source: ${syncSource}`);

    try {
      const result = await syncAllCalendars();
      
      if (result.success) {
        addTestResult(`🎉 SYNC SUCCESS!`, 'success');
        const totalEvents = result.results.reduce((sum, r) => sum + r.eventsProcessed, 0);
        const totalDates = result.results.reduce((sum, r) => sum + r.datesBlocked, 0);
        addTestResult(`Events processed: ${totalEvents}`, 'success');
        addTestResult(`Dates blocked: ${totalDates}`, 'success');
        addTestResult(`Successful syncs: ${result.successfulSyncs}/${result.totalConfigs}`, 'success');
      } else {
        addTestResult(`Sync failed. Failed syncs: ${result.failedSyncs}/${result.totalConfigs}`, 'error');
        const errors = result.results.filter(r => !r.success).map(r => r.error).filter(Boolean);
        if (errors.length > 0) {
          addTestResult(`Errors: ${errors.join(', ')}`, 'error');
        }
      }
    } catch (err) {
      addTestResult(`Sync exception: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  };

  const handleClearData = async () => {
    if (!selectedRoom) {
      addTestResult('Please select a room first', 'error');
      return;
    }

    addTestResult(`Clearing sync data for room: ${selectedRoom}`);
    try {
      await clearAvailabilityData(selectedRoom);
      addTestResult('✅ Data cleared successfully', 'success');
    } catch (err) {
      addTestResult(`Clear failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  };

  const progressPercentage = progress ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TestTube2 className="w-5 h-5 mr-2" />
            iCal Sync Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Test the iCal synchronization functionality with real calendar URLs.</p>
          <p><strong>⚠️ Warning:</strong> This will modify real availability data!</p>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Room Selection */}
          <div className="space-y-2">
            <Label>Select Room</Label>
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a room to test" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROOM_MAPPING).map(([roomType, roomId]) => (
                  <SelectItem key={roomType} value={roomId}>
                    {roomType.charAt(0).toUpperCase() + roomType.slice(1)} Room ({roomId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* URL Selection */}
          <div className="space-y-2">
            <Label>Calendar URL</Label>
            <Select value={selectedUrlType} onValueChange={setSelectedUrlType}>
              <SelectTrigger>
                <SelectValue placeholder="Choose URL type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="test-basic">Test Calendar (Google Holidays)</SelectItem>
                <SelectItem value="test-custom">Custom URL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom URL Input */}
          {selectedUrlType === 'test-custom' && (
            <div className="space-y-2">
              <Label>Custom iCal URL</Label>
              <Input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://calendar.booking.com/calendar/12345.ics"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Enter your Airbnb or Booking.com calendar export URL
              </p>
            </div>
          )}

          {/* Source Selection */}
          <div className="space-y-2">
            <Label>Calendar Source</Label>
            <Select value={syncSource} onValueChange={(value: 'airbnb' | 'booking') => setSyncSource(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="airbnb">Airbnb</SelectItem>
                <SelectItem value="booking">Booking.com</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleValidateUrl} 
              disabled={loading}
              variant="outline"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Validate URL
            </Button>

            <Button 
              onClick={handleSyncTest} 
              disabled={loading || !selectedRoom}
              className="bg-sage hover:bg-sage/90"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
              Test Sync
            </Button>

            <Button 
              onClick={handleClearData} 
              disabled={loading || !selectedRoom}
              variant="destructive"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
              Clear Data
            </Button>
          </div>

          {/* Progress */}
          {loading && progress && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{progress.step}</span>
                <span className="text-sm text-muted-foreground">
                  {progress.current}/{progress.total}
                </span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
            </div>
          )}

          {/* Status */}
          {lastSyncTime && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Last sync: {lastSyncTime.toLocaleString()}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Results</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setTestResults([])}
              className="ml-auto"
            >
              Clear Results
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 p-4 rounded-lg max-h-80 overflow-y-auto">
              <div className="font-mono text-xs space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-muted-foreground">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-orange-800">
            <AlertCircle className="w-5 h-5 mr-2" />
            How to Test
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-orange-700">
          <p><strong>Step 1:</strong> Select a room from the dropdown</p>
          <p><strong>Step 2:</strong> Choose "Custom URL" and paste your Airbnb/Booking calendar export URL</p>
          <p><strong>Step 3:</strong> Click "Validate URL" to check if the URL works</p>
          <p><strong>Step 4:</strong> Click "Test Sync" to perform the actual synchronization</p>
          <p><strong>Step 5:</strong> Check the results in the test log and verify data in your availability management</p>
          <p><strong>💡 Tip:</strong> Use "Test Calendar" first to verify the hook works with a known-good iCal feed</p>
          
          <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-800">📋 About CORS & Airbnb/Booking URLs:</p>
            <p className="text-blue-700 text-xs mt-1">
              Airbnb and Booking.com URLs may show validation issues due to CORS restrictions. 
              For testing, this tool uses a CORS proxy. For production, consider using a server-side solution.
            </p>
          </div>
          
          <div className="mt-2 p-3 bg-green-100 rounded-lg border border-green-200">
            <p className="font-semibold text-green-800">✅ CORS Proxy Enabled:</p>
            <p className="text-green-700 text-xs mt-1">
              This tester automatically uses a CORS proxy for Airbnb/Booking URLs, so sync should work even when validation shows issues.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ICalSyncTester;