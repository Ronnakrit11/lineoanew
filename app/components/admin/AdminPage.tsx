"use client";

import { useEffect, useState } from 'react';
import { AdminList } from './AdminList';
import { AddAdminForm } from './AddAdminForm';

export function AdminPage() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    checkAdminRole();
  }, []);

  const checkAdminRole = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setIsSuperAdmin(data.role === 'SUPER_ADMIN');
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
    }
  };

  const handleAdminCreated = () => {
    // Refresh the admin list
    const adminListElement = document.querySelector('AdminList');
    if (adminListElement) {
      // @ts-ignore
      adminListElement.refresh?.();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Admin Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin List */}
        <div className="lg:col-span-2">
          <AdminList />
        </div>

        {/* Add Admin Form - Only shown for super admin */}
        {isSuperAdmin && (
          <div className="lg:col-span-1">
            <AddAdminForm onSuccess={handleAdminCreated} />
          </div>
        )}
      </div>
    </div>
  );
}