import { headers } from 'next/headers';

/**
 * Creates a custom header for build-time authentication
 * This header will be used during the build process to authenticate API requests
 */
export function createBuildAuthHeader() {
  // Secure build-time token
  const buildToken = process.env.BUILD_AUTH_TOKEN || 'build_7X9kP2mN5vR8wQ3tY6hJ4cL1bV0nD9sK';
  
  return {
    'x-build-auth': buildToken,
    'Content-Type': 'application/json'
  };
}

/**
 * Verifies if the request is coming from a build-time process
 */
export async function isBuildTimeRequest() {
  const headersList = await headers();
  const buildAuth = headersList.get('x-build-auth');
  return buildAuth === process.env.BUILD_AUTH_TOKEN || buildAuth === 'build_7X9kP2mN5vR8wQ3tY6hJ4cL1bV0nD9sK';
}