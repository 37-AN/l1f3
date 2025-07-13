import React from 'react'
import { Box, Typography } from '@mui/material'
import TestConnection from './TestConnection'

function SimpleApp() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h3" component="h1" sx={{ p: 3, textAlign: 'center' }}>
        🎯 LIF3 Financial Dashboard
      </Typography>
      <Typography variant="h6" sx={{ p: 1, textAlign: 'center', color: 'text.secondary' }}>
        R239,625 → R1,800,000 (13.3% progress)
      </Typography>
      <TestConnection />
    </Box>
  )
}

export default SimpleApp