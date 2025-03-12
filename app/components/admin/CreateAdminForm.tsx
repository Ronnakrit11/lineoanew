"use client";

import { useState } from 'react';
import { Button } from '../ui/button';
import { showToast } from '@/app/utils/toast';

export function CreateAdminForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create admin');
      }

      showToast.success('Admin created successfully');
      setUsername('');
      setPassword('');
    } catch (error) {
      showToast.error('Failed to create admin', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Create New Admin</h2>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Creating...' : 'Create Admin'}
      </Button>
    </form>
  );
}