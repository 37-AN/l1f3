// Mock authentication for WebSocket connections
// This creates a temporary JWT token for WebSocket authentication

export const getMockAuthToken = (): string => {
  // Create a simple mock JWT token for development
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    userId: 'mock-user-123',
    email: 'user@lif3.com',
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiry
    iat: Math.floor(Date.now() / 1000)
  }));
  
  // Mock signature (not secure, for development only)
  const signature = btoa('mock-signature');
  
  return `${header}.${payload}.${signature}`;
};

export const initializeAuth = () => {
  // Set mock token in localStorage if not present
  if (!localStorage.getItem('authToken')) {
    localStorage.setItem('authToken', getMockAuthToken());
    console.log('[INFO] Authentication: Mock token initialized for WebSocket');
  }
};