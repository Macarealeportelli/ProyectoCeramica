'use client'

import React, { useState } from 'react'
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  Paper
} from '@mui/material'
import {
  Storage,
  CheckCircle,
  Error,
  Info,
  Build,
  TableChart,
  Inventory,
  Receipt
} from '@mui/icons-material'

export default function DetalleFacturasPage() {
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const crearTablas = async () => {
    setLoading(true)
    setError(null)
    setResultado(null)

    try {
      const response = await fetch('/api/detalle-factura', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setResultado(data.resultado)
      } else {
        setError(data.error || 'Error desconocido')
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
        📋 Gestión de Tablas de Detalle de Factura
      </Typography>
      
      <Typography variant="h6" color="text.secondary" paragraph>
        Implementación de las tablas Ven_VenFactur1 y ARTI_MAEARTICULOS para el sistema de facturas
      </Typography>

      <Grid container spacing={3}>
        {/* Panel de Control */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Build sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  🔧 Panel de Control
                </Typography>
              </Box>
              
              <Typography variant="body1" paragraph>
                Haz clic en el botón para crear las tablas de detalle de factura y artículos en la base de datos.
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={crearTablas}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Storage />}
                fullWidth
                sx={{ mt: 2 }}
              >
                {loading ? 'Creando Tablas...' : 'Crear Tablas de Detalle'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Información del Sistema */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Info sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h5" component="h2">
                  ℹ️ Información del Sistema
                </Typography>
              </Box>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <TableChart color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Tabla Ven_VenFactur1" 
                    secondary="Detalle de líneas de factura con artículos, cantidades y precios"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Inventory color="secondary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Tabla ARTI_MAEARTICULOS" 
                    secondary="Catálogo de artículos con precios y stock"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Receipt color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Integración con VEN_FACTUR" 
                    secondary="Relación con facturas existentes"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Resultados */}
        {(resultado || error) && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                {resultado && (
                  <Alert 
                    severity="success" 
                    icon={<CheckCircle />}
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="h6" gutterBottom>
                      ✅ Operación Completada
                    </Typography>
                    <Typography variant="body1">
                      {resultado}
                    </Typography>
                  </Alert>
                )}
                
                {error && (
                  <Alert 
                    severity="error" 
                    icon={<Error />}
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="h6" gutterBottom>
                      ❌ Error en la Operación
                    </Typography>
                    <Typography variant="body1">
                      {error}
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Estructura de las Tablas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>
                📊 Estructura de las Tablas
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      📋 Ven_VenFactur1 (Detalle de Facturas)
                    </Typography>
                    <List dense>
                      <ListItem><ListItemText primary="VfaNroId (PK)" secondary="ID único del detalle" /></ListItem>
                      <ListItem><ListItemText primary="FaNroId (FK)" secondary="ID de la factura" /></ListItem>
                      <ListItem><ListItemText primary="ArtNroId (FK)" secondary="ID del artículo" /></ListItem>
                      <ListItem><ListItemText primary="VfaCanti" secondary="Cantidad" /></ListItem>
                      <ListItem><ListItemText primary="VfaPreUn" secondary="Precio unitario" /></ListItem>
                      <ListItem><ListItemText primary="VfaNetGr" secondary="Neto gravado" /></ListItem>
                      <ListItem><ListItemText primary="VfaImIva" secondary="Importe IVA" /></ListItem>
                      <ListItem><ListItemText primary="VfaTotal" secondary="Total línea" /></ListItem>
                      <ListItem><ListItemText primary="VfaDescr" secondary="Descripción" /></ListItem>
                    </List>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom color="secondary">
                      📦 ARTI_MAEARTICULOS (Artículos)
                    </Typography>
                    <List dense>
                      <ListItem><ListItemText primary="ArtNroId (PK)" secondary="ID único del artículo" /></ListItem>
                      <ListItem><ListItemText primary="ArtDescr" secondary="Descripción del artículo" /></ListItem>
                      <ListItem><ListItemText primary="ArtPreUn" secondary="Precio unitario" /></ListItem>
                      <ListItem><ListItemText primary="ArtStock" secondary="Stock disponible" /></ListItem>
                      <ListItem><ListItemText primary="ArtCodigo" secondary="Código del artículo" /></ListItem>
                      <ListItem><ListItemText primary="ArtUnidad" secondary="Unidad de medida" /></ListItem>
                      <ListItem><ListItemText primary="ArtCateg" secondary="Categoría" /></ListItem>
                      <ListItem><ListItemText primary="ArtEstad" secondary="Estado (A/I)" /></ListItem>
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Datos de Ejemplo */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ color: 'success.main' }}>
                🎯 Datos de Ejemplo Incluidos
              </Typography>
              
              <Typography variant="body1" paragraph>
                Al crear las tablas, se insertarán automáticamente datos de ejemplo para facilitar las pruebas:
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    📦 Artículos de Cerámica (10 items)
                  </Typography>
                  <List dense>
                    <ListItem><ListItemText primary="Cerámica Piso 60x60 Blanco" secondary="$2,500.00 - 100 M2" /></ListItem>
                    <ListItem><ListItemText primary="Cerámica Pared 30x60 Beige" secondary="$1,800.00 - 150 M2" /></ListItem>
                    <ListItem><ListItemText primary="Porcelanato 80x80 Gris" secondary="$4,200.00 - 80 M2" /></ListItem>
                    <ListItem><ListItemText primary="Adhesivo Cerámico 30kg" secondary="$850.00 - 200 BOLSA" /></ListItem>
                    <ListItem><ListItemText primary="Y 6 artículos más..." secondary="Pastinas, zócalos, mosaicos, etc." /></ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" color="secondary" gutterBottom>
                    📋 Detalles de Factura (10 líneas)
                  </Typography>
                  <List dense>
                    <ListItem><ListItemText primary="Factura 1" secondary="3 líneas: Cerámica + Adhesivo + Pastina" /></ListItem>
                    <ListItem><ListItemText primary="Factura 2" secondary="2 líneas: Cerámica pared + Zócalos" /></ListItem>
                    <ListItem><ListItemText primary="Factura 3" secondary="2 líneas: Porcelanato + Perfiles" /></ListItem>
                    <ListItem><ListItemText primary="Facturas 4 y 5" secondary="Con artículos antideslizantes y mosaicos" /></ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          💡 Después de crear las tablas, podrás ver los detalles expandidos en la sección de facturas
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="outlined" 
            href="/datos" 
            sx={{ mr: 2 }}
          >
            📊 Ver Datos
          </Button>
          <Button 
            variant="outlined" 
            href="/"
          >
            🏠 Inicio
          </Button>
        </Box>
      </Box>
    </Container>
  )
}