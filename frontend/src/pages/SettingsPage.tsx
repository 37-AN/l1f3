import React from 'react'
import { Typography, Box, Grid } from '@mui/material'
import GoogleDriveSync from '../components/GoogleDriveSync'

const SettingsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings & Integrations
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Configure your LIF3 dashboard preferences, notifications, and integrations.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <GoogleDriveSync />
        </Grid>
      </Grid>
    </Box>
  )
}

export default SettingsPage