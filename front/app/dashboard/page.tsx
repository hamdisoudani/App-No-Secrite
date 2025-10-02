'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from '@/components/ui/Navbar';
import { Activity, User, Calendar } from 'lucide-react';
import { EditProfileDialog } from '@/components/EditProfileDialog';
import { ChangePasswordDialog } from '@/components/ChangePasswordDialog';
import { CsrfFormBuilder } from '@/components/security/CsrfFormBuilder';
import { Shield } from 'lucide-react';

interface User {
  name: string;
  email: string;
  createdAt?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      setUser(data);
    } catch {
      setError('Failed to load user profile');
      localStorage.removeItem('token');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleUpdateProfile = async (data: { name: string; email: string }) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3001/users/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      await fetchUserProfile();
    } catch {
      throw new Error('Failed to update profile');
    }
  };

  const handleChangePassword = async (data: { currentPassword: string; newPassword: string }) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3001/users/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }
    } catch {
      throw new Error('Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-6">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push('/login')}>
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLogout={handleLogout} />
      
      <main className="container mx-auto p-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Welcome, {user.name}!</h1>
        <p className="text-muted-foreground mb-8">{user.email}</p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Overview */}
          <Card className="col-span-full lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <EditProfileDialog user={user} onUpdate={handleUpdateProfile} />
              <ChangePasswordDialog onChangePassword={handleChangePassword} />
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm font-medium">
                    {new Date(user.createdAt || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Testing Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CsrfFormBuilder />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}