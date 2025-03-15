import { GeolocationData } from "./types";

/**
 * Interface for ipstack API response
 */
interface IpstackResponse {
  ip: string;
  country_name: string;
  region_name: string;
  city: string;
  latitude: number;
  longitude: number;
  success?: boolean;
  error?: {
    code: number;
    type: string;
    info: string;
  };
}

/**
 * Get geolocation data for an IP address using ipstack API
 * @param ip The IP address to geolocate
 * @returns Geolocation data for the IP address
 */
export async function getGeolocationData(ip: string): Promise<GeolocationData> {
  // Check if API key is configured
  const apiKey = process.env.IPSTACK_API_KEY;

  if (!apiKey) {
    console.warn(
      "IPSTACK_API_KEY not configured. Using simulated geolocation data."
    );
    return simulateGeolocation(ip);
  }

  try {
    // Make request to ipstack API
    const response = await fetch(
      `https://api.ipstack.com/${ip}?access_key=${apiKey}`
    );
    const data: IpstackResponse = await response.json();

    // Check for API errors
    if (!response.ok || data.error) {
      console.error(
        "Error from ipstack API:",
        data.error?.info || "Unknown error"
      );
      return simulateGeolocation(ip);
    }

    // Return formatted geolocation data
    return {
      country: data.country_name,
      region: data.region_name,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    console.error("Failed to get geolocation data:", error);
    // Fall back to simulated data if API call fails
    return simulateGeolocation(ip);
  }
}

/**
 * Simulate geolocation data for an IP address
 * This is used as a fallback when the API key is not configured or the API call fails
 * @param ip The IP address to geolocate
 * @returns Simulated geolocation data
 */
export function simulateGeolocation(ip: string): GeolocationData {
  // Generate a deterministic but seemingly random value from the IP
  const ipSum = ip
    .split(".")
    .reduce((sum, part) => sum + parseInt(part, 10), 0);

  // List of sample countries, regions, and cities
  const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
  ];
  const regions = [
    "California",
    "New York",
    "Texas",
    "London",
    "Ontario",
    "Queensland",
    "Bavaria",
    "Île-de-France",
  ];
  const cities = [
    "San Francisco",
    "New York",
    "Austin",
    "London",
    "Toronto",
    "Brisbane",
    "Munich",
    "Paris",
  ];

  // Select based on the IP sum
  const countryIndex = ipSum % countries.length;
  const regionIndex = ipSum % regions.length;
  const cityIndex = ipSum % cities.length;

  // Generate latitude and longitude (simplified)
  const latitude = (ipSum % 180) - 90 + Math.random();
  const longitude = (ipSum % 360) - 180 + Math.random();

  return {
    country: countries[countryIndex],
    region: regions[regionIndex],
    city: cities[cityIndex],
    latitude: parseFloat(latitude.toFixed(6)),
    longitude: parseFloat(longitude.toFixed(6)),
  };
}
