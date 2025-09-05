// src/pages/ICalTester.tsx 
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
// CAMBIA QUESTA RIGA - usa il nuovo tester per l'hook
import ICalHookTester from '@/components/admin/ICalHookTester';

const ICalTester = () => {
  return (
    <AdminLayout title="iCal Hook Tester - Terrazza Santa Chiara">
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

        {/* Hook Tester Component */}
        <ICalHookTester />
      </div>
    </AdminLayout>
  );
};

export default ICalTester;