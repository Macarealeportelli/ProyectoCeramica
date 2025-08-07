'use client'

import { useState, useEffect } from 'react'
import { ClienteDB } from '@/lib/queries'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  TablePagination,
  InputAdornment,
  CircularProgress
} from '@mui/material'
import {
  Storage,
  TableChart,
  Assessment,
  Search,
  People,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteDB[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const rowsPerPage = 20

  useEffect(() => {
    async function fetchClientes() {
      try {
        setLoading(true)
        const response = await fetch('/api/clientes')
        if (!response.ok) {
          throw new Error('Error al cargar clientes')
        }
        const data = await response.json()
        setClientes(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchClientes()
  }, [])

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefono?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const paginatedClientes = filteredClientes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'grey.800' }}>
            👥 Datos de Clientes
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Información de la tabla CLIE_MAECLIENTES
          </Typography>
        </Box>
      
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6">❌ Error al consultar la base de datos</Typography>
            <Typography>{error}</Typography>
            <Typography><strong>Tabla objetivo:</strong> CLIE_MAECLIENTES</Typography>
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Estadísticas */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    p: 1.5, 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <People fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total de clientes
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                      {clientes.length.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    bgcolor: 'success.main', 
                    color: 'white', 
                    p: 1.5, 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Email fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Con email
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                      {clientes.filter(c => c.email && c.email !== 'Sin email').length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    bgcolor: 'info.main', 
                    color: 'white', 
                    p: 1.5, 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Phone fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Con teléfono
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                      {clientes.filter(c => c.telefono && c.telefono !== 'Sin teléfono').length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    bgcolor: 'warning.main', 
                    color: 'white', 
                    p: 1.5, 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <LocationOn fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Con dirección
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                      {clientes.filter(c => c.direccion && c.direccion !== 'Sin dirección').length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Tabla de datos */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TableChart />
                    Datos de Clientes ({filteredClientes.length} registros)
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="Buscar por nombre, email, teléfono..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setPage(0)
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ minWidth: 300 }}
                  />
                </Box>
                <TableContainer component={Paper} sx={{ maxHeight: 600, overflowX: 'auto' }}>
                  <Table stickyHeader size="small" sx={{ minWidth: 800 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '8%' }}>ID</TableCell>
                        <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '18%' }}>Nombre</TableCell>
                        <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '20%' }}>Email</TableCell>
                        <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '12%' }}>Teléfono</TableCell>
                        <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '20%' }}>Dirección</TableCell>
                        <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '12%' }}>Fecha Registro</TableCell>
                        <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '8%' }}>Activo</TableCell>
                        <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '8%' }}>CliNroId</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedClientes.map((cliente, index) => (
                        <TableRow key={cliente.id} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                          <TableCell sx={{ p: 1, width: '8%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <Chip label={cliente.id} color="primary" variant="outlined" size="small" />
                          </TableCell>
                          <TableCell sx={{ p: 1, fontWeight: 'medium', width: '18%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {cliente.nombre?.trim() || 'Sin nombre'}
                          </TableCell>
                          <TableCell sx={{ p: 1, width: '20%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {cliente.email?.trim() && cliente.email !== 'Sin email' ? (
                              <Chip label={cliente.email.trim()} color="success" variant="outlined" size="small" />
                            ) : (
                              <Chip label="Sin email" color="default" variant="outlined" size="small" />
                            )}
                          </TableCell>
                          <TableCell sx={{ p: 1, width: '12%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {cliente.telefono?.trim() && cliente.telefono !== 'Sin teléfono' ? (
                              <Chip label={cliente.telefono.trim()} color="info" variant="outlined" size="small" />
                            ) : (
                              <Chip label="Sin teléfono" color="default" variant="outlined" size="small" />
                            )}
                          </TableCell>
                          <TableCell sx={{ p: 1, width: '20%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {cliente.direccion?.trim() && cliente.direccion !== 'Sin dirección' ? cliente.direccion.trim() : 'Sin dirección'}
                          </TableCell>
                          <TableCell sx={{ p: 1, width: '12%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {cliente.fecha_registro ? new Date(cliente.fecha_registro).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell sx={{ p: 1, width: '8%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <Chip 
                              label={cliente.activo ? 'Activo' : 'Inactivo'} 
                              color={cliente.activo ? 'success' : 'error'} 
                              variant="outlined" 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell sx={{ p: 1, width: '8%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cliente.CliNroId || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={filteredClientes.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[20]}
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                  labelRowsPerPage="Filas por página:"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Estructura de la tabla */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TableChart />
                  Estructura de la tabla CLIE_MAECLIENTES
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Clinroid" secondary="ID único del cliente (INT IDENTITY)" />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText primary="Clinombr" secondary="Nombre completo del cliente (NVARCHAR 100)" />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText primary="Cliemail" secondary="Dirección de correo electrónico (NVARCHAR 100)" />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText primary="Clitelef" secondary="Número de teléfono (NVARCHAR 50)" />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText primary="Clidirec" secondary="Dirección física (NVARCHAR 200)" />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText primary="CliNroId" secondary="Número de identificación del cliente" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Consulta SQL */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Storage />
                  Consulta SQL ejecutada
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    backgroundColor: 'grey.100',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    border: '1px solid',
                    borderColor: 'grey.300'
                  }}
                >
{`SELECT TOP 100 
  CAST(ISNULL(Clinroid, 0) AS NVARCHAR(100)) as id,
  CAST(ISNULL(Clinombr, '') AS NVARCHAR(100)) as nombre,
  CAST(ISNULL(Cliemail, '') AS NVARCHAR(100)) as email,
  CAST(ISNULL(Clitelef, '') AS NVARCHAR(100)) as telefono,
  CAST(ISNULL(Clidirec, '') AS NVARCHAR(100)) as direccion,
  CAST(ISNULL(CliFeReg, '') AS NVARCHAR(100)) as fecha_registro,
  CAST(ISNULL(CliActiv, 0) AS NVARCHAR(100)) as activo,
  CAST(ISNULL(CliNroId, '') AS NVARCHAR(100)) as CliNroId
FROM CLIE_MAECLIENTES
ORDER BY Clinroid`}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}