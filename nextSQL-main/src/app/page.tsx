'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material'
import {
  TrendingUp,
  AttachMoney,
  ShoppingCart,
  Inventory,
  People,
  Assessment,
  CalendarToday,
  BarChart
} from '@mui/icons-material'
import Header from '../components/Header'
import { syndeoColors } from '../theme/colors'

interface EstadisticasVentas {
  mes: number
  anio: number
  resumenVentas: {
    TotalVentas: number
    TotalFacturacion: number
    PromedioVenta: number
  }
  articulosMasVendidos: Array<{
    Descripcion: string
    Codigo: string
    CantidadVendida: number
    TotalVentas: number
  }>
  ventasDiarias: Array<{
    Dia: number
    CantidadVentas: number
    TotalDia: number
  }>
}

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function HomePage() {
  const router = useRouter()
  const [estadisticas, setEstadisticas] = useState<EstadisticasVentas | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(new Date().getMonth() + 1)
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(new Date().getFullYear())

  const cargarEstadisticas = async (mes: number, anio: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(`/api/estadisticas-ventas?mes=${mes}&anio=${anio}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`Error al cargar estadísticas: ${response.status}`)
      }
      
      const data = await response.json()
      setEstadisticas(data)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted')
        setError('La solicitud tardó demasiado tiempo')
      } else {
        console.error('Error cargando estadísticas:', error)
        setError(error instanceof Error ? error.message : 'Error desconocido')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    
    const loadData = async () => {
      if (isMounted) {
        await cargarEstadisticas(mesSeleccionado, anioSeleccionado)
      }
    }
    
    loadData()
    
    return () => {
      isMounted = false
    }
  }, [mesSeleccionado, anioSeleccionado])

  const handleMesChange = (event: SelectChangeEvent<number>) => {
    setMesSeleccionado(event.target.value as number)
  }

  const handleAnioChange = (event: SelectChangeEvent<number>) => {
    setAnioSeleccionado(event.target.value as number)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
        <Header title="Dashboard de Ventas" />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">
            Error al cargar las estadísticas: {error}
          </Alert>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <Header title="Dashboard de Ventas" />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: syndeoColors.primary.main, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Assessment sx={{ fontSize: 40, color: syndeoColors.secondary.main }} />
            Dashboard de Ventas
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <CalendarToday sx={{ fontSize: 20 }} />
            {estadisticas ? `${meses[estadisticas.mes - 1]} ${estadisticas.anio}` : 'Cargando...'}
          </Typography>
          
          {/* Selectores de Mes y Año */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Mes</InputLabel>
              <Select
                value={mesSeleccionado}
                label="Mes"
                onChange={handleMesChange}
              >
                {meses.map((mes, index) => (
                  <MenuItem key={index + 1} value={index + 1}>
                    {mes}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Año</InputLabel>
              <Select
                value={anioSeleccionado}
                label="Año"
                onChange={handleAnioChange}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((anio) => (
                  <MenuItem key={anio} value={anio}>
                    {anio}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Typography variant="body2" color="text.secondary">
              Selecciona el período para ver las estadísticas
            </Typography>
          </Box>
        </Box>

        {/* Botón para ir a gestión de clientes */}
        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            startIcon={<People />}
            onClick={() => router.push('/datos')}
            sx={{ 
              bgcolor: syndeoColors.primary.main,
              '&:hover': { bgcolor: syndeoColors.primary.dark }
            }}
          >
            Ir a Gestión de Clientes
          </Button>
        </Box>

        {estadisticas && (
          <Grid container spacing={3}>
            {/* Tarjetas de resumen */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <TrendingUp sx={{ fontSize: 24, mr: 1, opacity: 0.9 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        Total Ventas Mensuales
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {estadisticas.resumenVentas.TotalVentas?.toLocaleString() || '0'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                      Facturas emitidas este mes
                    </Typography>
                    <Chip 
                      label="Unidades" 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        fontWeight: 'medium'
                      }} 
                    />
                  </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <AttachMoney sx={{ fontSize: 24, mr: 1, opacity: 0.9 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        Total Facturación Mensual
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      ${estadisticas.resumenVentas.TotalFacturacion ? Number(estadisticas.resumenVentas.TotalFacturacion).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                      Ingresos totales del mes
                    </Typography>
                    <Chip 
                      label="Pesos" 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        fontWeight: 'medium'
                      }} 
                    />
                  </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <BarChart sx={{ fontSize: 24, mr: 1, opacity: 0.9 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        Promedio por Venta
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      ${estadisticas.resumenVentas.PromedioVenta ? Number(estadisticas.resumenVentas.PromedioVenta).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                      Valor promedio por factura
                    </Typography>
                    <Chip 
                      label="Pesos" 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        fontWeight: 'medium'
                      }} 
                    />
                  </CardContent>
                </Card>
            </Grid>

            {/* Artículos más vendidos */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: syndeoColors.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Inventory sx={{ mr: 1 }} />
                    Artículos Más Vendidos del Mes
                  </Typography>
                  {estadisticas.articulosMasVendidos.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.100' }}>
                            <TableCell><strong>Posición</strong></TableCell>
                            <TableCell><strong>Código</strong></TableCell>
                            <TableCell><strong>Descripción</strong></TableCell>
                            <TableCell align="right"><strong>Cantidad Vendida</strong></TableCell>
                            <TableCell align="right"><strong>Total Ventas</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {estadisticas.articulosMasVendidos.map((articulo, index) => (
                            <TableRow key={articulo.Codigo || index}>
                              <TableCell>
                                <Chip 
                                  label={`#${index + 1}`} 
                                  color={index === 0 ? 'primary' : index === 1 ? 'secondary' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{articulo.Codigo || 'N/A'}</TableCell>
                              <TableCell>{articulo.Descripcion || 'Sin descripción'}</TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={articulo.CantidadVendida?.toLocaleString() || '0'}
                                  color="info"
                                  variant="outlined"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={`$${articulo.TotalVentas?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0.00'}`}
                                  color="success"
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">
                      No hay datos de artículos vendidos para este mes.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  )
}
