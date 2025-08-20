import React from 'react'
import { AppBar, Toolbar, Typography, Box } from '@mui/material'
import Image from 'next/image'
import { syndeoColors } from '../theme/colors'

interface HeaderProps {
  title?: string
}

export default function Header({ title = 'Dashboard' }: HeaderProps) {
  return (
    <AppBar position="static" sx={{ bgcolor: 'black', boxShadow: 1, height: '150px' }}>
      <Toolbar sx={{ justifyContent: 'space-between', height: '100%', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Image
            src="/syndeo_logo_02.png"
            alt="Syndeo Logo"
            width={160}
            height={48}
            priority
          />
        </Box>
        <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 'medium' }}>
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  )
}