// src/pages/ICalTester.tsx

import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import ICalSyncTester from '@/components/admin/ICalSyncTester';

const ICalTester = () => {
  return (
    <AdminLayout title="iCal Sync Tester - Terrazza Santa Chiara">
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Tester Component */}
        <ICalSyncTester />
      </div>
    </AdminLayout>
  );
};

export default ICalTester;