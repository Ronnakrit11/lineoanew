"use client";

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { showToast } from '@/app/utils/toast';

interface AddAdminFormProps {
  onSuccess: () => void;
}

export function AddAdminForm({ onSuccess }: AddAdminFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      showToast.error('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create admin');
      }

      showToast.success('Admin created successfully');
      setFormData({ username: '', password: '', confirmPassword: '' });
      onSuccess();
    } catch (error) {
      showToast.error('Failed to create admin', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Add New Admin</h2>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          required
          placeholder="Enter username"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Enter password"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          placeholder="Confirm password"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating...' : 'Create Admin'}
      </Button>
    </form>
  );
}