"use client";

import { useState, useEffect } from 'react';
import { formatThaiDateTime } from '@/lib/utils/dateFormatter';

interface Admin {
  id: string;
  username: string;
  role: 'SUPER_ADMIN' | 'USER';
  createdAt: string;
}

export function AdminList() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin');
      if (!response.ok) throw new Error('Failed to fetch admins');
      const data = await response.json();
      setAdmins(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admins');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {admin.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    admin.role === 'SUPER_ADMIN' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {admin.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {formatThaiDateTime(new Date(admin.createdAt))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}