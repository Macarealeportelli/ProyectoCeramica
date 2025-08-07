import { getEntidades } from '@/lib/queries'
import ClienteDashboard from '@/components/ClienteDashboard'
import { Container, Typography, Box } from '@mui/material'

export default async function HomePage() {
  const clientes = await getEntidades()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'grey.800' }}>
            Dashboard de Clientes
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Análisis y visualización de datos de clientes
          </Typography>
        </Box>
        <ClienteDashboard clientes={clientes} />
      </Container>
    </Box>
  )
}
