'use server';

import { revalidatePath } from 'next/cache';

// Define caching times
const CACHE_LONG = 60 * 60; // 1 hour
const CACHE_MEDIUM = 60 * 10; // 10 minutes
const CACHE_SHORT = 60; // 1 minute
const CACHE_NONE = 0; // No cache

/**
 * Server action to fetch user profile with appropriate caching
 */
export async function fetchUserProfile(userId?: string) {
  try {
    const url = userId 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/user/${userId}/profile`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`;
      
    const response = await fetch(url, {
      next: { revalidate: CACHE_SHORT }, // Revalidate every minute
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { success: false, error: 'Failed to fetch user profile' };
  }
}

/**
 * Server action to fetch user notification settings
 */
export async function fetchUserNotificationSettings() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/notifications/settings`, {
      next: { revalidate: CACHE_MEDIUM }, // Revalidate every 10 minutes
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch notification settings');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return { success: false, error: 'Failed to fetch notification settings' };
  }
}

/**
 * Server action to update user notification settings
 * No caching for mutations, but revalidates the affected paths
 */
export async function updateUserNotificationSettings(settings: any) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/notifications/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to update notification settings');
    }
    
    // Revalidate the user's profile path
    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard/notifications');
    
    return response.json();
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return { success: false, error: 'Failed to update notification settings' };
  }
}

/**
 * Server action to fetch user credit history with pagination
 */
export async function fetchUserCreditHistory(page = 1, limit = 20) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/credits/history?page=${page}&limit=${limit}`, 
      {
        next: { revalidate: CACHE_SHORT }, // Revalidate every minute
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch credit history');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching credit history:', error);
    return { success: false, error: 'Failed to fetch credit history' };
  }
} 