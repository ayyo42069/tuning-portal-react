'use server';

/**
 * Server action to fetch tuning files
 * This can be imported and used in server components directly
 */
export async function fetchTuningFiles() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tuning-files`, {
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch tuning files');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching tuning files:', error);
    return { success: false, error: 'Failed to fetch tuning files' };
  }
}

/**
 * Server action to fetch user profile data
 * This can be imported and used in server components directly
 */
export async function fetchUserProfile() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
      next: { revalidate: 60 },
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