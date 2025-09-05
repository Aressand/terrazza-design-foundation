// src/components/admin/ICalHookTester.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, AlertCircle, Play, Database, Download, FileText, Trash2, Settings } from 'lucide-react';

// IMPORTA IL TUO VERO HOOK QUI
import { useICalSync } from '@/hooks/useICalSync';

const ICalHookTester = () => {
  const [testResults, setTestResults] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);
  const [testUrl, setTestUrl] = useState('https://calendar.google.com/calendar/ical/en.italian%23holiday%40group.v.calendar.google.com/public/basic.ics');
  
  // QUESTO È IL TUO VERO HOOK - non più mock!
  const {
    testTableAccess,
    getActiveConfigs, 
    downloadICalData,
    parseICalEvents,
    syncAllCalendars,
    processAutomaticSync,
    getSyncStatus,
    loading,
    error,
    progress
  } = useICalSync();

  const addResult = (testName, status, message, data = null) => {
    const result = {
      id: Date.now(),
      testName,
      status, // 'pending', 'success', 'error'
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, result]);
  };

  const updateLastResult = (status, message, data = null) => {
    setTestResults(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          status,
          message,
          data
        };
      }
      return updated;
    });
  };

  // Test 1: Database Table Access
  const testDatabase = async () => {
    setCurrentTest('database');
    addResult('Database Access', 'pending', 'Testing room_ical_configs table access...');
    
    try {
      const canAccess = await testTableAccess();
      updateLastResult(
        canAccess ? 'success' : 'error', 
        `Table access: ${canAccess ? 'SUCCESS ✅' : 'FAILED ❌'}`, 
        { canAccess }
      );
    } catch (error) {
      updateLastResult('error', `Database error: ${error.message}`, { error: error.message });
    }
    setCurrentTest(null);
  };

  // Test 2: Get Configurations
  const testConfigs = async () => {
    setCurrentTest('configs');
    addResult('Get Configurations', 'pending', 'Fetching active calendar configurations...');
    
    try {
      const configs = await getActiveConfigs();
      updateLastResult(
        'success', 
        `Found ${configs.length} active configurations`, 
        { configs, count: configs.length }
      );
    } catch (error) {
      updateLastResult('error', `Config error: ${error.message}`, { error: error.message });
    }
    setCurrentTest(null);
  };

  // Test 3: Download iCal Data via Edge Function
  const testDownload = async () => {
    if (!testUrl) {
      addResult('Download Test', 'error', 'Please enter a test URL');
      return;
    }

    setCurrentTest('download');
    addResult('Download iCal', 'pending', `Testing Edge Function with URL: ${testUrl.substring(0, 50)}...`);
    
    try {
      const data = await downloadICalData(testUrl);
      const isValid = data.includes('BEGIN:VCALENDAR');
      const hasEvents = data.includes('BEGIN:VEVENT');
      
      updateLastResult(
        isValid ? 'success' : 'error', 
        `Downloaded ${data.length} chars. Valid iCal: ${isValid ? '✅' : '❌'}, Has Events: ${hasEvents ? '✅' : '❌'}`,
        { 
          dataLength: data.length, 
          isValid,
          hasEvents,
          preview: data.substring(0, 300) + '...'
        }
      );
    } catch (error) {
      updateLastResult('error', `Download failed: ${error.message}`, { error: error.message });
    }
    setCurrentTest(null);
  };

  // Test 4: Parse iCal Data
  const testParsing = async () => {
    setCurrentTest('parsing');
    addResult('Parse iCal', 'pending', 'Testing iCal parsing with sample data...');
    
    try {
      const sampleData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:test
BEGIN:VEVENT
UID:test1@example.com
DTSTART:20241201T140000Z
DTEND:20241203T110000Z
SUMMARY:Test Booking 1
DESCRIPTION:Test booking description
END:VEVENT
BEGIN:VEVENT
UID:test2@example.com
DTSTART:20241205T140000Z
DTEND:20241207T110000Z
SUMMARY:Test Booking 2
END:VEVENT
END:VCALENDAR`;

      const events = parseICalEvents(sampleData);
      updateLastResult(
        events.length > 0 ? 'success' : 'error', 
        `Parsed ${events.length} events from sample iCal data`,
        { events, sampleEventsCount: events.length }
      );
    } catch (error) {
      updateLastResult('error', `Parse error: ${error.message}`, { error: error.message });
    }
    setCurrentTest(null);
  };

  // Test 5: Get Sync Status
  const testSyncStatus = async () => {
    setCurrentTest('status');
    addResult('Sync Status', 'pending', 'Getting sync status for all configurations...');
    
    try {
      const status = await getSyncStatus();
      updateLastResult(
        'success', 
        `Retrieved sync status for ${status.length} configurations`,
        { status }
      );
    } catch (error) {
      updateLastResult('error', `Status error: ${error.message}`, { error: error.message });
    }
    setCurrentTest(null);
  };

  // Test 6: Test Complete Sync Flow (if configs exist)
  const testFullSync = async () => {
    setCurrentTest('fullsync');
    addResult('Full Sync Test', 'pending', 'Testing complete sync flow...');
    
    try {
      const result = await syncAllCalendars();
      updateLastResult(
        result.success ? 'success' : 'error', 
        `Sync completed: ${result.successfulSyncs}/${result.totalConfigs} successful`,
        { result }
      );
    } catch (error) {
      updateLastResult('error', `Full sync error: ${error.message}`, { error: error.message });
    }
    setCurrentTest(null);
  };

  // Run Basic Tests (safe tests that don't modify data)
  const runBasicTests = async () => {
    setTestResults([]);
    await testDatabase();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testConfigs();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testDownload();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testParsing();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testSyncStatus();
  };

  // Run All Tests (including potentially destructive ones)
  const runAllTests = async () => {
    await runBasicTests();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testFullSync();
  };

  const clearResults = () => setTestResults([]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            useICalSync Hook Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hook Status Display */}
          {(loading || error) && (
            <Alert className={error ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                {loading && <span className="flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-1" />Hook is loading...</span>}
                {error && <span className="text-red-600">Hook error: {error}</span>}
              </AlertDescription>
            </Alert>
          )}

          {/* Progress Display */}
          {progress && (
            <Alert className="border-blue-200 bg-blue-50">
              <Settings className="w-4 h-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>{progress.step}</span>
                    <span className="text-xs">{progress.current}/{progress.total}</span>
                  </div>
                  {progress.currentRoom && (
                    <div className="text-xs text-blue-600">Current: {progress.currentRoom}</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Test URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Test iCal URL:</label>
            <Input 
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="Enter iCal URL for testing"
              className="font-mono text-xs"
            />
            <p className="text-xs text-gray-500">Default: Google Calendar public holidays (always works)</p>
          </div>

          {/* Individual Test Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button 
              onClick={testDatabase} 
              disabled={loading || currentTest === 'database'}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Database className="w-3 h-3 mr-1" />
              {currentTest === 'database' ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : 'Test DB'}
            </Button>
            
            <Button 
              onClick={testConfigs} 
              disabled={loading || currentTest === 'configs'}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Settings className="w-3 h-3 mr-1" />
              {currentTest === 'configs' ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : 'Get Configs'}
            </Button>
            
            <Button 
              onClick={testDownload} 
              disabled={loading || currentTest === 'download'}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              {currentTest === 'download' ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : 'Download'}
            </Button>
            
            <Button 
              onClick={testParsing} 
              disabled={loading || currentTest === 'parsing'}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <FileText className="w-3 h-3 mr-1" />
              {currentTest === 'parsing' ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : 'Parse iCal'}
            </Button>
            
            <Button 
              onClick={testSyncStatus} 
              disabled={loading || currentTest === 'status'}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              {currentTest === 'status' ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : 'Sync Status'}
            </Button>
            
            <Button 
              onClick={testFullSync} 
              disabled={loading || currentTest === 'fullsync'}
              variant="outline"
              size="sm"
              className="text-xs text-orange-600 border-orange-300"
            >
              <Play className="w-3 h-3 mr-1" />
              {currentTest === 'fullsync' ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : 'Full Sync'}
            </Button>
          </div>

          {/* Main Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={runBasicTests} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Run Safe Tests
            </Button>
            <Button 
              onClick={runAllTests} 
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Run All Tests
            </Button>
            <Button 
              onClick={clearResults} 
              variant="outline"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.map((result) => (
                <div key={result.id} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.testName}</span>
                    <span className="text-xs text-gray-500 ml-auto">{result.timestamp}</span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">{result.message}</p>
                  
                  {result.data && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        View Details ({typeof result.data === 'object' ? Object.keys(result.data).length + ' properties' : 'data'})
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          <strong>Testing Guide:</strong>
          <br />• <strong>Safe Tests</strong>: Database access, config loading, download test, parsing test - no data changes
          <br />• <strong>Full Tests</strong>: Includes actual sync operations - may modify availability data  
          <br />• <strong>Console</strong>: Open DevTools to see detailed logs from your hook
          <br />• <strong>Network</strong>: Check Network tab to see Edge Function calls
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ICalHookTester;