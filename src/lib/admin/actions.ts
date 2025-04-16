'use server';

import { revalidatePath } from 'next/cache';

// Define caching times
const CACHE_LONG = 60 * 60; // 1 hour
const CACHE_MEDIUM = 60 * 10; // 10 minutes
const CACHE_SHORT = 60; // 1 minute
const CACHE_NONE = 0; // No cache

/**
 * Server action to fetch users list with caching
 */
export async function fetchUsers(searchQuery?: string) {
  try {
    const url = searchQuery 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?search=${encodeURIComponent(searchQuery)}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`;
      
    const response = await fetch(url, {
      cache: 'no-store', // Dynamic data should not be cached
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}

/**
 * Server action to fetch tuning requests with cache control
 */
export async function fetchTuningRequests(status?: string) {
  try {
    const url = status 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tuning-requests?status=${encodeURIComponent(status)}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tuning-requests`;
      
    const response = await fetch(url, {
      next: { revalidate: CACHE_SHORT }, // Revalidate every minute
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch tuning requests');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching tuning requests:', error);
    return { success: false, error: 'Failed to fetch tuning requests' };
  }
}

/**
 * Server action to fetch security logs with intelligent caching
 */
export async function fetchSecurityLogs(page = 1, limit = 50) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/security/logs?page=${page}&limit=${limit}`, 
      {
        next: { revalidate: CACHE_MEDIUM }, // Cache for 10 minutes
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch security logs');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching security logs:', error);
    return { success: false, error: 'Failed to fetch security logs' };
  }
}

/**
 * Server action to update tuning request status
 * No caching for mutations, but revalidates the affected paths
 */
export async function updateTuningRequestStatus(requestId: number, status: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tuning-requests/${requestId}/status`, 
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
        cache: 'no-store',
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to update tuning request status');
    }
    
    // Revalidate affected paths to reflect changes
    revalidatePath('/admin/tuning-requests');
    revalidatePath(`/admin/tuning-requests/${requestId}`);
    revalidatePath('/dashboard/tuning-history');
    
    return response.json();
  } catch (error) {
    console.error('Error updating tuning request status:', error);
    return { success: false, error: 'Failed to update tuning request status' };
  }
}

/**
 * Server action to fetch dashboard stats with appropriate caching
 */
export async function fetchAdminDashboardStats() {
  try {
    // Ensure we have a valid API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    
    const response = await fetch(
      `${apiUrl}/api/admin/stats`, 
      {
        next: { revalidate: CACHE_SHORT }, // Revalidate every minute
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin dashboard stats');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return { success: false, error: 'Failed to fetch admin dashboard stats' };
  }
} 