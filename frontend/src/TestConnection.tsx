import React, { useState, useEffect } from 'react'
import { Box, Typography, Button, Alert } from '@mui/material'
import axios from 'axios'

const TestConnection: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<string>('Testing...')
  const [apiData, setApiData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testBackendConnection = async () => {
    try {
      setBackendStatus('Testing backend...')
      setError(null)
      
      // Test basic health endpoint
      const healthResponse = await axios.get('https://lif3-backend-clean.onrender.com/health')
      console.log('Health check response:', healthResponse.data)
      
      // Test API endpoint
      const apiResponse = await axios.get('https://lif3-backend-clean.onrender.com/api/financial/dashboard')
      console.log('API response:', apiResponse.data)
      
      setBackendStatus('✅ Backend Connected')
      setApiData(healthResponse.data)
      
    } catch (err: any) {
      console.error('Connection failed:', err)
      setError(err.message || 'Unknown error')
      setBackendStatus('❌ Backend Connection Failed')
    }
  }

  useEffect(() => {
    testBackendConnection()
  }, [])

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        LIF3 Connection Test
      </Typography>
      
      <Typography variant="h6" gutterBottom>
        Backend Status: {backendStatus}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      )}
      
      {apiData && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Backend Response:</Typography>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(apiData, null, 2)}
          </pre>
        </Box>
      )}
      
      <Button 
        variant="contained" 
        onClick={testBackendConnection}
        sx={{ mt: 2 }}
      >
        Test Again
      </Button>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">Troubleshooting:</Typography>
        <ul>
          <li>Backend should be running on https://lif3-backend-clean.onrender.com</li>
          <li>Check browser console for errors</li>
          <li>Verify CORS is enabled on backend</li>
          <li>Check if all dependencies are installed</li>
        </ul>
      </Box>
    </Box>
  )
}

export default TestConnection