'use client'

import { Cliente } from '@/lib/types'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button
} from '@mui/material'
import {
  People,
  Email,
  TrendingUp,
  Domain,
  Storage,
  TableChart,
  Assessment,
  Build
} from '@mui/icons-material'

interface ClienteDashboardProps {
  clientes: Cliente[]
}

export default function ClienteDashboard({ clientes }: ClienteDashboardProps) {
  // Procesar datos para análisis
  const clientesPorDominio = clientes.reduce((acc, cliente) => {
    const dominio = cliente.email.split('@')[1] || 'Sin dominio'
    acc[dominio] = (acc[dominio] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topDominios = Object.entries(clientesPorDominio)
    .map(([dominio, cantidad]) => ({ dominio, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)

  const clientesPorLetra = clientes.reduce((acc, cliente) => {
    const letra = cliente.nombre.charAt(0).toUpperCase()
    acc[letra] = (acc[letra] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topLetras = Object.entries(clientesPorLetra)
    .map(([letra, cantidad]) => ({ letra, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)

  const totalDominios = Object.keys(clientesPorDominio).length
  const promedioPorDominio = Math.round(clientes.length / totalDominios)

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Estadísticas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                <People sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6" component="div">
                    Total Clientes
                  </Typography>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                    {clientes.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                <Domain sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6" component="div">
                    Dominios Únicos
                  </Typography>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                    {totalDominios}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                <TrendingUp sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6" component="div">
                    Promedio por Dominio
                  </Typography>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                    {promedioPorDominio}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Navegación rápida */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            🚀 Acceso Rápido
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Storage />}
                href="/datos"
                sx={{ py: 2, textTransform: 'none' }}
              >
                <Box>
                  <Typography variant="subtitle2">📊 Ver Datos</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Explorar entidades y facturas
                  </Typography>
                </Box>
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Build />}
                href="/detalle-facturas"
                sx={{ py: 2, textTransform: 'none' }}
              >
                <Box>
                  <Typography variant="subtitle2">🔧 Gestión Tablas</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Crear tablas de detalle
                  </Typography>
                </Box>
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<TableChart />}
                href="/estructura-clientes"
                sx={{ py: 2, textTransform: 'none' }}
              >
                <Box>
                  <Typography variant="subtitle2">🏗️ Estructura</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ver estructura de BD
                  </Typography>
                </Box>
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Assessment />}
                href="/insertar"
                sx={{ py: 2, textTransform: 'none' }}
              >
                <Box>
                  <Typography variant="subtitle2">➕ Insertar</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Agregar nuevos datos
                  </Typography>
                </Box>
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Análisis de datos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Top dominios */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" sx={{ mb: 2 }}>
                Top 5 Dominios de Email
              </Typography>
              <List>
                {topDominios.map((item, index) => {
                  const percentage = (item.cantidad / clientes.length) * 100
                  return (
                    <Box key={item.dominio}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: `hsl(${index * 60}, 70%, 50%)` }}>
                            <Email />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.dominio}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {item.cantidad} clientes ({percentage.toFixed(1)}%)
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={percentage}
                                sx={{ mt: 1, height: 8, borderRadius: 4 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < topDominios.length - 1 && <Divider />}
                    </Box>
                  )
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Top letras iniciales */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" sx={{ mb: 2 }}>
                Top 5 Iniciales de Nombres
              </Typography>
              <List>
                {topLetras.map((item, index) => {
                  const percentage = (item.cantidad / clientes.length) * 100
                  return (
                    <Box key={item.letra}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: `hsl(${index * 72}, 60%, 60%)` }}>
                            {item.letra}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`Letra "${item.letra}"`}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {item.cantidad} clientes ({percentage.toFixed(1)}%)
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={percentage}
                                sx={{ mt: 1, height: 8, borderRadius: 4 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < topLetras.length - 1 && <Divider />}
                    </Box>
                  )
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de clientes */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="div" sx={{ mb: 2 }}>
            Lista de Clientes
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 400, overflowX: 'hidden' }}>
            <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ p: 1, width: '8%' }}>Avatar</TableCell>
                  <TableCell sx={{ p: 1, width: '15%' }}>Nombre</TableCell>
                  <TableCell sx={{ p: 1, width: '18%' }}>Email</TableCell>
                  <TableCell sx={{ p: 1, width: '15%' }}>Razón Social</TableCell>
                  <TableCell sx={{ p: 1, width: '15%' }}>Domicilio</TableCell>
                  <TableCell sx={{ p: 1, width: '10%' }}>Localidad</TableCell>
                  <TableCell sx={{ p: 1, width: '8%' }}>Provincia</TableCell>
                  <TableCell sx={{ p: 1, width: '6%' }}>Código Postal</TableCell>
                  <TableCell sx={{ p: 1, width: '10%' }}>Teléfono</TableCell>
                  <TableCell align="right" sx={{ p: 1, width: '5%' }}>ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientes.map((cliente) => {
                  return (
                    <TableRow
                      key={cliente.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      hover
                    >
                      <TableCell sx={{ p: 1, width: '8%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {cliente.nombre.charAt(0).toUpperCase()}
                        </Avatar>
                      </TableCell>
                      <TableCell component="th" scope="row" sx={{ p: 1, width: '15%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Typography variant="body1" fontWeight="medium">
                          {cliente.nombre}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ p: 1, width: '18%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Typography variant="body2" color="text.secondary">
                          {cliente.email}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ p: 1, width: '15%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Typography variant="body2" color="text.secondary">
                          {cliente.razon_social || 'Sin razón social'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ p: 1, width: '15%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Typography variant="body2" color="text.secondary">
                          {cliente.domicilio || 'Sin domicilio'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ p: 1, width: '10%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Typography variant="body2" color="text.secondary">
                          {cliente.localidad || 'Sin localidad'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ p: 1, width: '8%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Typography variant="body2" color="text.secondary">
                          {cliente.provincia || 'Sin provincia'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ p: 1, width: '6%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Typography variant="body2" color="text.secondary">
                          {cliente.codigo_postal || 'Sin código postal'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ p: 1, width: '10%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Typography variant="body2" color="text.secondary">
                          {cliente.telefono || 'Sin teléfono'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ p: 1, width: '5%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Typography variant="body2" color="text.secondary">
                          {cliente.id}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}