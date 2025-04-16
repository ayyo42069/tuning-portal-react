'use server';

/**
 * Server action to fetch tuning files
 * This can be imported and used in server components directly
 */
export async function fetchTuningFiles() {
  // Mock data for static builds and fallbacks
  const mockTuningFiles = {
    success: true,
    tuningFiles: [
      {
        id: 1,
        file_name: 'BMW M3 Stage 1.bin',
        vehicle_info: 'BMW M3 (F80) 2018',
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        credits_used: 3,
        tuning_options: 'Stage 1, ECU Remap, Increased Torque'
      },
      {
        id: 2,
        file_name: 'Mercedes C63 AMG.bin',
        vehicle_info: 'Mercedes C63 AMG 2019',
        status: 'processing',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        credits_used: 4,
        tuning_options: 'Full Custom, Throttle Response, Improved Efficiency'
      }
    ]
  };

  // Skip actual API calls during build time
  if (process.env.NODE_ENV === 'production' && 
      (process.env.NEXT_PHASE === 'phase-production-build' || 
       typeof window === 'undefined' && !process.env.VERCEL_URL)) {
    console.log('🏗️ Build-time: Using mock data for tuning files');
    return mockTuningFiles;
  }
  
  try {
    // For runtime, use the appropriate URL
    let url;
    
    if (process.env.NEXT_PUBLIC_API_URL) {
      url = `${process.env.NEXT_PUBLIC_API_URL}/api/tuning/history`;
    } else {
      // Use relative URL for same-origin API calls
      url = '/api/tuning/history';
    }
    
    console.log('Fetching tuning files from URL:', url);
    
    // Set a timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    );
    
    // Create fetch request with abort controller
    const controller = new AbortController();
    const fetchPromise = fetch(url, {
      next: { revalidate: 60 }, // Revalidate every minute
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    
    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise])
      .catch(error => {
        controller.abort();
        console.error(`Fetch error: ${error.message}`);
        return null;
      }) as Response | null;
    
    // Handle failed or invalid responses
    if (!response || !response.ok) {
      console.warn(`API response not ok: ${response?.status || 'Request failed'}`);
      return mockTuningFiles;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching tuning files:', error);
    // Return mock data instead of error data 
    return mockTuningFiles;
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