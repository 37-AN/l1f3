import React from 'react'
import { Typography, Box } from '@mui/material'

const GoalsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Goals
      </Typography>
      <Typography variant="body1">
        Track your progress toward R1.8M net worth goal and 43V3R business milestones.
      </Typography>
    </Box>
  )
}

export default GoalsPage