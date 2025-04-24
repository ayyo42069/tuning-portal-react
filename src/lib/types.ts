/**
 * Interface for geolocation data
 */
export interface GeolocationData {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  credits?: number;
  email_verified: boolean;
  last_login_date?: string;
  registration_date?: string;
  created_at?: string;
  updated_at?: string;
}
