'use client'

import { useState, useEffect } from 'react'
import { ProveedorDB } from '@/lib/queries'
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
  Business,
  ContactPhone,
  Assignment,
  Category
} from '@mui/icons-material'

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<ProveedorDB[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const rowsPerPage = 20

  useEffect(() => {
    async function fetchProveedores() {
      try {
        setLoading(true)
        const response = await fetch('/api/proveedores')
        if (!response.ok) {
          throw new Error('Error al cargar proveedores')
        }
        const data = await response.json()
        setProveedores(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchProveedores()
  }, [])

  const filteredProveedores = proveedores.filter(proveedor =>
    proveedor.ProContac?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proveedor.ProObser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proveedor.ProRubCon?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const paginatedProveedores = filteredProveedores.slice(
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
            🏢 Datos de Proveedores
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Información de la tabla PROV_MAEPROV
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6">❌ Error al consultar la base de datos</Typography>
            <Typography>{error}</Typography>
            <Typography><strong>Tabla objetivo:</strong> PROV_MAEPROV</Typography>
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
                    <Business fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total de proveedores
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                      {proveedores.length.toLocaleString()}
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
                    <ContactPhone fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Con contacto
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                      {proveedores.filter(p => p.ProContac && p.ProContac.trim()).length}
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
                    <Assignment fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Activos
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                      {proveedores.filter(p => p.ProEstad === 'A').length}
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
                    <Category fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Con rubro
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                      {proveedores.filter(p => p.ProRubCon && p.ProRubCon.trim()).length}
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
                    Datos de Proveedores ({filteredProveedores.length} registros)
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="Buscar por contacto, observaciones, rubro..."
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
                  <Table stickyHeader size="small" sx={{ minWidth: 1000 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '8%' }}>ID</TableCell>
                        <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '15%' }}>Contacto</TableCell>
                        <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '20%' }}>Observaciones</TableCell>
                        <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '12%' }}>Rubro</TableCell>
                        <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '10%' }}>Estado</TableCell>
                        <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '10%' }}>Código</TableCell>
                        <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '12%' }}>Usuario Log</TableCell>
                        <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '13%' }}>Fecha Log</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedProveedores.map((proveedor) => (
                        <TableRow key={proveedor.ProNroId} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                          <TableCell sx={{ p: 1, width: '8%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <Chip label={proveedor.ProNroId} color="primary" variant="outlined" size="small" />
                          </TableCell>
                          <TableCell sx={{ p: 1, width: '15%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 'medium' }}>
                            {proveedor.ProContac?.trim() || 'Sin contacto'}
                          </TableCell>
                          <TableCell sx={{ p: 1, width: '20%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {proveedor.ProObser?.trim() ? (
                              <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {proveedor.ProObser.trim()}
                              </Typography>
                            ) : (
                              'Sin observaciones'
                            )}
                          </TableCell>
                          <TableCell sx={{ p: 1, width: '12%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {proveedor.ProRubCon?.trim() ? (
                              <Chip label={proveedor.ProRubCon.trim()} color="info" variant="outlined" size="small" />
                            ) : (
                              <Chip label="Sin rubro" color="default" variant="outlined" size="small" />
                            )}
                          </TableCell>
                          <TableCell sx={{ p: 1, width: '10%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <Chip 
                              label={proveedor.ProEstad === 'A' ? 'Activo' : 'Inactivo'} 
                              color={proveedor.ProEstad === 'A' ? 'success' : 'error'} 
                              variant="outlined" 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell sx={{ p: 1, width: '10%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{proveedor.ProDocIdeVen || 'N/A'}</TableCell>
                          <TableCell sx={{ p: 1, width: '12%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{proveedor.ProUslog || 'N/A'}</TableCell>
                          <TableCell sx={{ p: 1, width: '13%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{proveedor.ProFeLog || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={filteredProveedores.length}
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

          {/* Mensaje cuando no hay datos */}
          {filteredProveedores.length === 0 && !loading && (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <Business sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No se encontraron proveedores
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay datos disponibles en la tabla PROV_MAEPROV'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Información de la consulta SQL */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TableChart color="primary" />
                  Información de la consulta
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" paragraph>
                  <strong>Tabla consultada:</strong> PROV_MAEPROV
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Total de registros:</strong> {proveedores.length.toLocaleString()}
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Registros filtrados:</strong> {filteredProveedores.length.toLocaleString()}
                </Typography>
                <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mt: 2 }}>
                  <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem', overflow: 'auto' }}>
{`SELECT 
  CAST(ProNroId AS NVARCHAR(50)) AS ProNroId,
  CAST(ISNULL(ProContac, '') AS NVARCHAR(255)) AS ProContac,
  CAST(ISNULL(ProObser, '') AS NVARCHAR(MAX)) AS ProObser,
  CAST(ISNULL(ProRubCon, '') AS NVARCHAR(100)) AS ProRubCon,
  CAST(ISNULL(ProEstad, '') AS NVARCHAR(10)) AS ProEstad,
  CAST(ISNULL(ProDocIdeVen, '') AS NVARCHAR(50)) AS ProDocIdeVen,
  CAST(ISNULL(ProUslog, '') AS NVARCHAR(50)) AS ProUslog,
  CAST(ISNULL(CONVERT(VARCHAR, ProFeLog, 120), '') AS NVARCHAR(50)) AS ProFeLog
FROM PROV_MAEPROV`}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Estructura de la tabla */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Storage color="primary" />
                  Estructura de la tabla PROV_MAEPROV
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                      Columnas principales:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="ProNroId" 
                          secondary="ID del proveedor"
                          primaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="ProContac" 
                          secondary="Información de contacto"
                          primaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="ProObser" 
                          secondary="Observaciones"
                          primaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="ProRubCon" 
                          secondary="Rubro o categoría"
                          primaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                      Columnas de control:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="ProEstad" 
                          secondary="Estado (A=Activo)"
                          primaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="ProDocIdeVen" 
                          secondary="Código de identificación"
                          primaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="ProUslog" 
                          secondary="Usuario que registró"
                          primaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="ProFeLog" 
                          secondary="Fecha de registro"
                          primaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}