'use client'

import React, { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
// Removed direct database import - now using API route
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
  CircularProgress,
  Button,
  Collapse,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Storage,
  TableChart,
  Assessment,
  Search,
  People,
  Email,
  Phone,
  LocationOn,
  ExpandMore,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Business,
  PersonAdd,
  AccountBalance,
  Payments,
  Receipt,
  FilterList,
  DateRange,
  Clear,
  PictureAsPdf,
  Print,
  Close
} from '@mui/icons-material'

interface EntidadRaw {
  Entnroid: number
  Entnombr: string
  Entemail: string
  EntRazSoc: string
  EntDomic: string
  EntLocal: string
  EntProvi: string
  EntCodPo: string
  EntTelef: string
  EntCUIT: string
  EntActEc: string
  EntUsLog: string
  EntFeLog: string
  EntSedronar: string
  EntTelef2: string
  EntCodigo: string
}

export default function DatosPage() {
  const [datos, setDatos] = useState<EntidadRaw[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage] = useState(20)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [datosRelacionados, setDatosRelacionados] = useState<{[key: number]: any}>({})
  const [loadingRelacionados, setLoadingRelacionados] = useState<Set<number>>(new Set())
  const [activeTab, setActiveTab] = useState<{[key: number]: string}>({})
  const [loadingTabData, setLoadingTabData] = useState<{[key: string]: boolean}>({})
  
  // Estados para filtros de fecha
  const [filtroFechaDeuda, setFiltroFechaDeuda] = useState<{[key: number]: {desde: string, hasta: string}}>({})  
  const [filtroFechaMovimientos, setFiltroFechaMovimientos] = useState<{[key: number]: {desde: string, hasta: string}}>({})  
  
  // Estados para paginación de movimientos
  const [paginaMovimientos, setPaginaMovimientos] = useState<{[key: number]: number}>({})
  const [filasPorPaginaMovimientos] = useState(10)
  
  // Estados para paginación de facturas
  const [paginaFacturas, setPaginaFacturas] = useState<{[key: number]: number}>({})
  const [filasPorPaginaFacturas] = useState(20)
  
  // Estado para facturas expandidas (mostrar detalle)
  const [facturasExpandidas, setFacturasExpandidas] = useState<Set<string>>(new Set())
  const [detallesFactura, setDetallesFactura] = useState<{[key: string]: any[]}>({})
  const [cargandoDetalles, setCargandoDetalles] = useState<Set<string>>(new Set())
  
  // Estados para reportes
  const [reporteAbierto, setReporteAbierto] = useState(false)
  const [tipoReporte, setTipoReporte] = useState<'deudas' | 'movimientos'>('deudas')
  const [entidadReporte, setEntidadReporte] = useState<EntidadRaw | null>(null)
  const [generandoPDF, setGenerandoPDF] = useState(false)

  // Componente de loader para tablas
  const TableLoader = ({ message }: { message: string }) => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      py: 6,
      bgcolor: 'grey.50',
      borderRadius: 2,
      border: '1px dashed #ddd'
    }}>
      <CircularProgress size={32} sx={{ mb: 2, color: 'primary.main' }} />
      <Typography variant="body1" sx={{ mb: 1, color: 'primary.main' }}>
        {message}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Por favor espere...
      </Typography>
    </Box>
  )

  // Componente para estado vacío
  const EmptyState = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      py: 6,
      bgcolor: 'grey.50',
      borderRadius: 2,
      border: '1px dashed #ddd'
    }}>
      <Box sx={{ mb: 2, color: 'text.secondary', fontSize: 48 }}>
        {icon}
      </Box>
      <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {description}
      </Typography>
    </Box>
  )
  
  // Funciones para filtrar por fecha
  const filtrarPorFecha = (datos: any[], fechaField: string, filtro: {desde: string, hasta: string}) => {
    if (!filtro.desde && !filtro.hasta) return datos
    
    return datos.filter(item => {
      if (!item[fechaField]) return false
      
      const fechaItem = new Date(item[fechaField])
      const fechaDesde = filtro.desde ? new Date(filtro.desde) : null
      const fechaHasta = filtro.hasta ? new Date(filtro.hasta) : null
      
      if (fechaDesde && fechaHasta) {
        return fechaItem >= fechaDesde && fechaItem <= fechaHasta
      } else if (fechaDesde) {
        return fechaItem >= fechaDesde
      } else if (fechaHasta) {
        return fechaItem <= fechaHasta
      }
      
      return true
    })
  }
  
  const actualizarFiltroDeuda = (entidadId: number, campo: 'desde' | 'hasta', valor: string) => {
    setFiltroFechaDeuda(prev => ({
      ...prev,
      [entidadId]: {
        ...prev[entidadId],
        [campo]: valor
      }
    }))
  }
  
  const actualizarFiltroMovimientos = (entidadId: number, campo: 'desde' | 'hasta', valor: string) => {
    setFiltroFechaMovimientos(prev => ({
      ...prev,
      [entidadId]: {
        ...prev[entidadId],
        [campo]: valor
      }
    }))
  }
  
  const limpiarFiltroDeuda = (entidadId: number) => {
    setFiltroFechaDeuda(prev => ({
      ...prev,
      [entidadId]: { desde: '', hasta: '' }
    }))
  }
  
  const limpiarFiltroMovimientos = (entidadId: number) => {
    setFiltroFechaMovimientos(prev => ({
      ...prev,
      [entidadId]: { desde: '', hasta: '' }
    }))
  }
  
  // Funciones para paginación de movimientos
  const cambiarPaginaMovimientos = (entidadId: number, nuevaPagina: number) => {
    setPaginaMovimientos(prev => ({
      ...prev,
      [entidadId]: nuevaPagina
    }))
  }
  
  const obtenerMovimientosPaginados = (movimientos: any[], entidadId: number) => {
    const paginaActual = paginaMovimientos[entidadId] || 0
    const inicio = paginaActual * filasPorPaginaMovimientos
    const fin = inicio + filasPorPaginaMovimientos
    return movimientos.slice(inicio, fin)
  }
  
  // Funciones para paginación de facturas
  const cambiarPaginaFacturas = (entidadId: number, nuevaPagina: number) => {
    setPaginaFacturas(prev => ({
      ...prev,
      [entidadId]: nuevaPagina
    }))
  }
  
  const obtenerFacturasPaginadas = (facturas: any[], entidadId: number) => {
    const paginaActual = paginaFacturas[entidadId] || 0
    const inicio = paginaActual * filasPorPaginaFacturas
    const fin = inicio + filasPorPaginaFacturas
    return facturas.slice(inicio, fin)
  }
  
  // Función para unificar artículos iguales
  const unificarArticulos = (detalles: any[]) => {
    const articulosMap = new Map()
    const contadorUnificaciones = new Map()
    
    detalles.forEach(detalle => {
      // Usar el código del artículo como clave para agrupar
      const clave = detalle.ArtCodigo || detalle.ArtCodAbr || detalle.ArtNroId || `sin-codigo-${detalle.ArtDescr || detalle.DeArtDescr}`
      
      if (articulosMap.has(clave)) {
        // Si ya existe, sumar cantidades y totales
        const existente = articulosMap.get(clave)
        const cantidadAnterior = existente.DeCanti || 0
        const cantidadNueva = detalle.DeCanti || 0
        const cantidadTotal = cantidadAnterior + cantidadNueva
        
        // Calcular precio unitario promedio ponderado
        if (cantidadTotal > 0) {
          const precioAnterior = existente.DePreUn || 0
          const precioNuevo = detalle.DePreUn || 0
          existente.DePreUn = ((precioAnterior * cantidadAnterior) + (precioNuevo * cantidadNueva)) / cantidadTotal
        }
        
        existente.DeCanti = cantidadTotal
        existente.DeNetGr = (existente.DeNetGr || 0) + (detalle.DeNetGr || 0)
        existente.DeImIva = (existente.DeImIva || 0) + (detalle.DeImIva || 0)
        existente.DeTotal = (existente.DeTotal || 0) + (detalle.DeTotal || 0)
        existente._unificado = true // Marcar como unificado
        
        // Incrementar contador de unificaciones
        contadorUnificaciones.set(clave, (contadorUnificaciones.get(clave) || 1) + 1)
      } else {
        // Si no existe, agregar como nuevo
        articulosMap.set(clave, { ...detalle })
        contadorUnificaciones.set(clave, 1)
      }
    })
    
    return Array.from(articulosMap.values())
  }

  // Función para manejar clic en facturas (mostrar/ocultar detalle)
  const toggleFacturaDetalle = async (facturaId: string) => {
    const isExpanding = !facturasExpandidas.has(facturaId)
    
    setFacturasExpandidas(prev => {
      const newSet = new Set(prev)
      if (newSet.has(facturaId)) {
        newSet.delete(facturaId)
      } else {
        newSet.add(facturaId)
      }
      return newSet
    })
    
    // Si se está expandiendo y no tenemos los detalles, los obtenemos
    if (isExpanding && !detallesFactura[facturaId]) {
      // Marcar como cargando
      setCargandoDetalles(prev => new Set(prev).add(facturaId))
      
      try {
        // Extraer el ID real de la factura del facturaId compuesto
        // facturaId tiene formato: "entidadId-facturaRealId-index"
        const parts = facturaId.split('-')
        const facturaRealId = parts[1] // El ID real de la factura está en la segunda posición
        
        console.log(`[DETALLE] 🔍 Obteniendo detalles para factura ID: ${facturaRealId} (facturaId completo: ${facturaId})`)
        
        const response = await fetch(`/api/factura/${facturaRealId}`)
        const data = await response.json()
        
        if (data.success) {
          console.log(`[DETALLE] ✅ ${data.count} detalles obtenidos para factura ${facturaRealId}`)
          
          // Mostrar artículos tal como aparecen en VEN_FACTUR1 (sin unificación)
          console.log(`[DETALLE] 📋 Mostrando ${data.data.length} artículos sin unificar`)
          
          setDetallesFactura(prev => ({
            ...prev,
            [facturaId]: data.data
          }))
        } else {
          console.error(`[DETALLE] ❌ Error en respuesta API:`, data.error)
        }
      } catch (error) {
        console.error('[DETALLE] ❌ Error obteniendo detalles de factura:', error)
      } finally {
        // Quitar del estado de carga
        setCargandoDetalles(prev => {
          const newSet = new Set(prev)
          newSet.delete(facturaId)
          return newSet
        })
      }
    }
  }
  
  // Funciones para reportes
  const abrirReporte = (entidad: EntidadRaw, tipo: 'deudas' | 'movimientos') => {
    setEntidadReporte(entidad)
    setTipoReporte(tipo)
    setReporteAbierto(true)
  }
  
  const cerrarReporte = () => {
    setReporteAbierto(false)
    setEntidadReporte(null)
  }
  
  const descargarPDF = async () => {
    if (!entidadReporte) return
    
    setGenerandoPDF(true)
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = 210
      const pageHeight = 297
      const margin = 10
      const lineHeight = 6
      let currentY = 30
      let pageNumber = 1
      
      // Función para agregar encabezado
      const addHeader = (pdf: jsPDF, pageNum: number) => {
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`Reporte de ${tipoReporte === 'deudas' ? 'Deudas' : 'Movimientos'}`, margin, 15)
        
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Entidad: ${entidadReporte.Entnombr.trim()}`, margin, 22)
        pdf.text(`CUIT: ${entidadReporte.EntCUIT}`, margin + 100, 22)
        pdf.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, margin + 150, 22)
        
        // Línea separadora
        pdf.setLineWidth(0.5)
        pdf.line(margin, 25, pageWidth - margin, 25)
        
        return 30
      }
      
      // Función para agregar pie de página
      const addFooter = (pdf: jsPDF, pageNum: number) => {
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Página ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
      }
      
      // Función para verificar si necesita nueva página
      const checkNewPage = (pdf: jsPDF, currentY: number, neededSpace: number) => {
        if (currentY + neededSpace > pageHeight - 20) {
          addFooter(pdf, pageNumber)
          pdf.addPage()
          pageNumber++
          return addHeader(pdf, pageNumber)
        }
        return currentY
      }
      
      // Agregar encabezado inicial
      currentY = addHeader(pdf, pageNumber)
      
      // Obtener datos filtrados
      const filtroEntidad = tipoReporte === 'deudas' 
        ? filtroFechaDeuda[entidadReporte.Entnroid] || { desde: '', hasta: '' }
        : filtroFechaMovimientos[entidadReporte.Entnroid] || { desde: '', hasta: '' }
      
      // Mostrar información de filtros
      currentY += 5
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Rango de Fechas Consultadas:', margin, currentY)
      currentY += lineHeight
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      if (filtroEntidad.desde || filtroEntidad.hasta) {
        const desde = filtroEntidad.desde || 'Sin límite'
        const hasta = filtroEntidad.hasta || 'Sin límite'
        pdf.text(`Desde: ${desde} - Hasta: ${hasta}`, margin, currentY)
      } else {
        pdf.text('Mostrando todos los registros (sin filtro de fecha)', margin, currentY)
      }
      currentY += lineHeight + 5
      
      if (tipoReporte === 'deudas') {
        // Procesar deudas
        const deudas = datosRelacionados[entidadReporte.Entnroid].deuda
          .filter((deuda: any) => {
            if (!filtroEntidad.desde && !filtroEntidad.hasta) return true
            const fechaDeuda = new Date(deuda.DeuFecha)
            const desde = filtroEntidad.desde ? new Date(filtroEntidad.desde) : null
            const hasta = filtroEntidad.hasta ? new Date(filtroEntidad.hasta) : null
            return (!desde || fechaDeuda >= desde) && (!hasta || fechaDeuda <= hasta)
          })
          .sort((a: any, b: any) => {
            const fechaA = new Date(a.DeuFecha || 0)
            const fechaB = new Date(b.DeuFecha || 0)
            return fechaA.getTime() - fechaB.getTime()
          })
        
        // Encabezados de tabla
        currentY = checkNewPage(pdf, currentY, 20)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Fecha', margin, currentY)
        pdf.text('Importe', margin + 40, currentY)
        pdf.text('Saldo', margin + 80, currentY)
        pdf.text('Sucursal ID', margin + 120, currentY)
        pdf.text('Deuda ID', margin + 160, currentY)
        currentY += 2
        pdf.line(margin, currentY, pageWidth - margin, currentY)
        currentY += 5
        
        // Datos de deudas
        pdf.setFont('helvetica', 'normal')
        deudas.forEach((deuda: any) => {
          currentY = checkNewPage(pdf, currentY, lineHeight)
          
          const fecha = deuda.DeuFecha ? new Date(deuda.DeuFecha).toLocaleDateString('es-AR') : 'Sin fecha'
          const importe = `$${deuda.DeuImpor?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0.00'}`
          const saldo = `$${deuda.DeuSaldo?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0.00'}`
          
          pdf.text(fecha, margin, currentY)
          pdf.text(importe, margin + 40, currentY)
          pdf.text(saldo, margin + 80, currentY)
          pdf.text(deuda.SucNroId?.toString() || '', margin + 120, currentY)
          pdf.text(deuda.DeuNroId?.toString() || '', margin + 160, currentY)
          currentY += lineHeight
        })
      } else {
        // Procesar movimientos
        const movimientos = datosRelacionados[entidadReporte.Entnroid].movimientosCombinados
          .filter((movimiento: any) => {
            if (!filtroEntidad.desde && !filtroEntidad.hasta) return true
            const fechaMovimiento = new Date(movimiento.MovFecha)
            const desde = filtroEntidad.desde ? new Date(filtroEntidad.desde) : null
            const hasta = filtroEntidad.hasta ? new Date(filtroEntidad.hasta) : null
            return (!desde || fechaMovimiento >= desde) && (!hasta || fechaMovimiento <= hasta)
          })
          .sort((a: any, b: any) => {
            const fechaA = new Date(a.MovFecha || 0)
            const fechaB = new Date(b.MovFecha || 0)
            return fechaA.getTime() - fechaB.getTime()
          })
        
        // Encabezados de tabla
        currentY = checkNewPage(pdf, currentY, 20)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Fecha', margin, currentY)
        pdf.text('Descripción', margin + 30, currentY)
        pdf.text('Debe', margin + 100, currentY)
        pdf.text('Haber', margin + 130, currentY)
        pdf.text('Saldo', margin + 160, currentY)
        currentY += 2
        pdf.line(margin, currentY, pageWidth - margin, currentY)
        currentY += 5
        
        // Datos de movimientos
        pdf.setFont('helvetica', 'normal')
        movimientos.forEach((movimiento: any) => {
          currentY = checkNewPage(pdf, currentY, lineHeight)
          
          const fecha = movimiento.MovFecha ? new Date(movimiento.MovFecha).toLocaleDateString('es-AR') : 'Sin fecha'
          const descripcion = (movimiento.CCCDescr || 'Sin descripción').substring(0, 25)
          const debe = movimiento.Debe > 0 ? `$${movimiento.Debe.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : ''
          const haber = movimiento.Haber > 0 ? `$${movimiento.Haber.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : ''
          const saldo = `$${(movimiento.Haber - movimiento.Debe).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
          
          pdf.text(fecha, margin, currentY)
          pdf.text(descripcion, margin + 30, currentY)
          pdf.text(debe, margin + 100, currentY)
          pdf.text(haber, margin + 130, currentY)
          pdf.text(saldo, margin + 160, currentY)
          currentY += lineHeight
        })
      }
      
      // Agregar pie de página final
      addFooter(pdf, pageNumber)
      
      const nombreArchivo = `reporte_${tipoReporte}_${entidadReporte.Entnombr.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(nombreArchivo)
    } catch (error) {
      console.error('Error al generar PDF:', error)
    } finally {
      setGenerandoPDF(false)
    }
  }

  useEffect(() => {
     const fetchData = async () => {
       try {
         console.log('[DATOS] 🔍 Obteniendo datos desde API...')
         const response = await fetch('/api/datos')
         const result = await response.json()
         
         if (result.success) {
           setDatos(result.data)
           console.log(`[DATOS] ✅ ${result.count} registros obtenidos desde API`)
         } else {
           setError(result.error)
           console.error('[DATOS] ❌ Error desde API:', result.error)
         }
         
       } catch (err: any) {
         setError(err.message)
         console.error('[DATOS] ❌ Error al consultar API:', err.message)
       } finally {
         setLoading(false)
       }
     }
 
     fetchData()
   }, [])

  // Filtrar datos basado en el término de búsqueda
  const filteredDatos = datos.filter(entidad => 
    entidad.Entnombr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entidad.Entemail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entidad.EntRazSoc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entidad.EntLocal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entidad.EntProvi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entidad.Entnroid.toString().includes(searchTerm)
  )

  // Datos paginados
  const paginatedDatos = filteredDatos.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const toggleRowExpansion = async (entidadId: number) => {
    const newExpandedRows = new Set(expandedRows)
    
    if (expandedRows.has(entidadId)) {
      // Contraer fila
      newExpandedRows.delete(entidadId)
    } else {
      // Expandir fila y cargar datos relacionados
      newExpandedRows.add(entidadId)
      
      // Si no tenemos los datos relacionados, cargarlos
      if (!datosRelacionados[entidadId]) {
        setLoadingRelacionados(prev => new Set([...prev, entidadId]))
        setLoadingTabData(prev => ({ ...prev, [entidadId]: true }))
        
        try {
          const response = await fetch(`/api/datos-relacionados?id=${entidadId}`)
          const result = await response.json()
          
          if (result.success) {
            setDatosRelacionados(prev => ({
              ...prev,
              [entidadId]: result.data
            }))
          } else {
            console.error('Error al cargar datos relacionados:', result.error)
          }
        } catch (error) {
          console.error('Error al cargar datos relacionados:', error)
        } finally {
          setLoadingRelacionados(prev => {
            const newSet = new Set(prev)
            newSet.delete(entidadId)
            return newSet
          })
          setLoadingTabData(prev => ({ ...prev, [entidadId]: false }))
        }
      }
    }
    
    setExpandedRows(newExpandedRows)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'grey.800', display: 'flex', alignItems: 'center', gap: 2 }}>
            <TableChart sx={{ fontSize: 40 }} />
            Datos de la tabla ENT_MAEENTIDAD
          </Typography>
        </Box>

        {error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6">Error al cargar los datos:</Typography>
            <Typography>{error}</Typography>
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {/* Estadísticas */}
            <Grid item xs={12}>
              <Card sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                    <Assessment sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h6" component="div">
                        Total Registros
                      </Typography>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                        {datos.length.toLocaleString()}
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
                      Datos completos ({filteredDatos.length.toLocaleString()} de {datos.length.toLocaleString()} registros)
                    </Typography>
                    <TextField
                      size="small"
                      placeholder="Buscar por nombre, email, razón social..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setPage(0) // Reset page when searching
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
                  <TableContainer component={Paper} sx={{ maxHeight: 600, overflowX: 'auto', width: '100%' }}>
                    <Table stickyHeader size="small" sx={{ minWidth: 1200 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '80px', p: 1 }}>Acciones</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '60px', p: 1 }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '120px', p: 1 }}>Nombre</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '150px', p: 1 }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '120px', p: 1 }}>Razón Social</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '120px', p: 1 }}>Domicilio</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '100px', p: 1 }}>Localidad</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '80px', p: 1 }}>Provincia</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '80px', p: 1 }}>Cód. Postal</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '100px', p: 1 }}>Teléfono</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '100px', p: 1 }}>CUIT</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '80px', p: 1 }}>Act. Econ.</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '80px', p: 1 }}>Usuario</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '90px', p: 1 }}>Fecha Log</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '80px', p: 1 }}>Sedronar</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '90px', p: 1 }}>Tel. 2</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '70px', p: 1 }}>Código</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedDatos.map((entidad, index) => (
                          <React.Fragment key={entidad.Entnroid}>
                            <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                              <TableCell sx={{ p: 1, width: '40px' }}>
                                <IconButton
                                  size="small"
                                  onClick={() => toggleRowExpansion(entidad.Entnroid)}
                                >
                                  {expandedRows.has(entidad.Entnroid) ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                </IconButton>
                              </TableCell>
                              <TableCell sx={{ p: 1, width: '80px' }}>
                                <Chip label={entidad.Entnroid} color="primary" variant="outlined" size="small" />
                              </TableCell>
                              <TableCell sx={{ p: 1, fontWeight: 'medium', width: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {entidad.Entnombr?.trim() || 'Sin nombre'}
                              </TableCell>
                              <TableCell sx={{ p: 1, width: '180px' }}>
                                {entidad.Entemail?.trim() ? (
                                  <Chip label={entidad.Entemail.trim()} color="success" variant="outlined" size="small" />
                                ) : (
                                  <Chip label="Sin email" color="default" variant="outlined" size="small" />
                                )}
                              </TableCell>
                              <TableCell sx={{ p: 1, width: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {entidad.EntRazSoc?.trim() || 'Sin razón social'}
                              </TableCell>
                              <TableCell sx={{ p: 1, width: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {entidad.EntDomic?.trim() || 'Sin domicilio'}
                              </TableCell>
                              <TableCell sx={{ p: 1, width: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {entidad.EntLocal?.trim() || 'Sin localidad'}
                              </TableCell>
                              <TableCell sx={{ p: 1, width: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {entidad.EntProvi?.trim() || 'Sin provincia'}
                              </TableCell>
                              <TableCell sx={{ p: 1, width: '80px' }}>
                                {entidad.EntCodPo?.trim() ? (
                                  <Chip label={entidad.EntCodPo.trim()} color="info" variant="outlined" size="small" />
                                ) : (
                                  <Chip label="Sin CP" color="default" variant="outlined" size="small" />
                                )}
                              </TableCell>
                              <TableCell sx={{ p: 1, width: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {entidad.EntTelef?.trim() || 'Sin teléfono'}
                              </TableCell>
                              <TableCell sx={{ p: 1, width: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entidad.EntCUIT || 'N/A'}</TableCell>
                              <TableCell sx={{ p: 1, width: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entidad.EntActEc || 'N/A'}</TableCell>
                              <TableCell sx={{ p: 1, width: '80px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entidad.EntUsLog || 'N/A'}</TableCell>
                              <TableCell sx={{ p: 1, width: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entidad.EntFeLog || 'N/A'}</TableCell>
                              <TableCell sx={{ p: 1, width: '80px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entidad.EntSedronar || 'N/A'}</TableCell>
                              <TableCell sx={{ p: 1, width: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entidad.EntTelef2 || 'N/A'}</TableCell>
                              <TableCell sx={{ p: 1, width: '80px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entidad.EntCodigo || 'N/A'}</TableCell>
                            </TableRow>
                            {/* Fila expandible con datos relacionados */}
                            {expandedRows.has(entidad.Entnroid) && (
                              <TableRow>
                                <TableCell colSpan={16} sx={{ py: 0 }}>
                                  <Collapse in={expandedRows.has(entidad.Entnroid)} timeout="auto" unmountOnExit>
                                    <Box sx={{ margin: 2 }}>
                                      {loadingRelacionados.has(entidad.Entnroid) ? (
                                        <Box sx={{ 
                                          display: 'flex', 
                                          flexDirection: 'column',
                                          justifyContent: 'center', 
                                          alignItems: 'center',
                                          py: 4,
                                          bgcolor: 'grey.50',
                                          borderRadius: 2,
                                          border: '1px dashed #ccc'
                                        }}>
                                          <CircularProgress size={40} sx={{ mb: 2, color: 'primary.main' }} />
                                          <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
                                            Cargando datos relacionados...
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary">
                                            Obteniendo información de cliente, proveedor, deudas y movimientos
                                          </Typography>
                                        </Box>
                                      ) : (
                                        <Box>
                                          {/* Botones de navegación */}
                                          <Box sx={{ display: 'flex', mb: 2, gap: 1, flexWrap: 'wrap' }}>
                                            <Button 
                                              variant={!activeTab[entidad.Entnroid] || activeTab[entidad.Entnroid] === 'info' ? 'contained' : 'outlined'} 
                                              color="primary" 
                                              startIcon={<PersonAdd />}
                                              onClick={() => setActiveTab({...activeTab, [entidad.Entnroid]: 'info'})}
                                              size="small"
                                            >
                                              Info Cliente/Proveedor
                                            </Button>
                                            <Button 
                                              variant={activeTab[entidad.Entnroid] === 'deuda' ? 'contained' : 'outlined'} 
                                              color="error" 
                                              startIcon={<AccountBalance />}
                                              onClick={() => setActiveTab({...activeTab, [entidad.Entnroid]: 'deuda'})}
                                              size="small"
                                            >
                                              Deuda
                                            </Button>
                                            <Button 
                                              variant={activeTab[entidad.Entnroid] === 'movimientos' ? 'contained' : 'outlined'} 
                                              color="info" 
                                              startIcon={<Payments />}
                                              onClick={() => setActiveTab({...activeTab, [entidad.Entnroid]: 'movimientos'})}
                                              size="small"
                                            >
                                              Movimientos
                                            </Button>
                                            <Button 
                                              variant={activeTab[entidad.Entnroid] === 'facturas' ? 'contained' : 'outlined'} 
                                              color="success" 
                                              startIcon={<Receipt />}
                                              onClick={() => setActiveTab({...activeTab, [entidad.Entnroid]: 'facturas'})}
                                              size="small"
                                            >
                                              Facturas
                                            </Button>
                                          </Box>
                                          
                                          {/* Contenido según la pestaña activa */}
                          {(!activeTab[entidad.Entnroid] || activeTab[entidad.Entnroid] === 'info') && (
                            <Grid container spacing={2}>
                              {/* Datos del Cliente */}
                              <Grid item xs={12}>
                                <Card variant="outlined">
                                  <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                      <PersonAdd sx={{ mr: 1, color: 'primary.main' }} />
                                      <Typography variant="h6" color="primary">
                                        Información del Cliente
                                      </Typography>
                                    </Box>
                                    {datosRelacionados[entidad.Entnroid]?.cliente ? (
                                      <Box>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                          <strong>ID:</strong> {datosRelacionados[entidad.Entnroid].cliente.CliNroId}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                          <strong>Contacto:</strong> {datosRelacionados[entidad.Entnroid].cliente.CliConta || 'No especificado'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                          <strong>Notas:</strong> {datosRelacionados[entidad.Entnroid].cliente.CliNotas || 'Sin notas'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                          <strong>Estado:</strong> {datosRelacionados[entidad.Entnroid].cliente.CliEstad || 'No especificado'}
                                        </Typography>
                                        <Typography variant="body2">
                                          <strong>Código:</strong> {datosRelacionados[entidad.Entnroid].cliente.CliCodigo || 'Sin código'}
                                        </Typography>
                                      </Box>
                                    ) : (
                                      <Typography variant="body2" color="text.secondary">
                                        No hay información de cliente asociada
                                      </Typography>
                                    )}
                                  </CardContent>
                                </Card>
                              </Grid>
                              
                              {/* Datos del Proveedor */}
                              <Grid item xs={12}>
                                <Card variant="outlined">
                                  <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                      <Business sx={{ mr: 1, color: 'secondary.main' }} />
                                      <Typography variant="h6" color="secondary">
                                        Información del Proveedor
                                      </Typography>
                                    </Box>
                                    {datosRelacionados[entidad.Entnroid]?.proveedor ? (
                                      <Box>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                          <strong>ID:</strong> {datosRelacionados[entidad.Entnroid].proveedor.ProNroId}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                          <strong>Contacto:</strong> {datosRelacionados[entidad.Entnroid].proveedor.ProContac || 'No especificado'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                          <strong>Observaciones:</strong> {datosRelacionados[entidad.Entnroid].proveedor.ProObser || 'Sin observaciones'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                          <strong>Estado:</strong> {datosRelacionados[entidad.Entnroid].proveedor.ProEstad || 'No especificado'}
                                        </Typography>
                                        <Typography variant="body2">
                                          <strong>Rubro/Condición:</strong> {datosRelacionados[entidad.Entnroid].proveedor.ProRubCon || 'No especificado'}
                                        </Typography>
                                      </Box>
                                    ) : (
                                      <Typography variant="body2" color="text.secondary">
                                        No hay información de proveedor asociada
                                      </Typography>
                                    )}
                                  </CardContent>
                                </Card>
                              </Grid>
                            </Grid>
                          )}
                                          
                                          {/* Pestaña de Deuda */}
                                          {activeTab[entidad.Entnroid] === 'deuda' && (
                                            <Card variant="outlined">
                                              <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                  <AccountBalance sx={{ mr: 1, color: 'error.main' }} />
                                                  <Typography variant="h6" color="error">
                                                    Deuda
                                                  </Typography>
                                                </Box>
                                                
                                                {/* Filtros de fecha para Deuda */}
                                                <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <DateRange sx={{ mr: 1, color: 'secondary.main' }} />
                                                    <Typography variant="subtitle2" color="primary">
                                                      Filtrar por fecha
                                                    </Typography>
                                                  </Box>
                                                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <TextField
                                                          label="Desde"
                                                          type="date"
                                                          size="small"
                                                          value={filtroFechaDeuda[entidad.Entnroid]?.desde || ''}
                                                          onChange={(e) => actualizarFiltroDeuda(entidad.Entnroid, 'desde', e.target.value)}
                                                          InputLabelProps={{ shrink: true }}
                                                          InputProps={{
                                                            endAdornment: (
                                                              <InputAdornment position="end">
                                                                <DateRange sx={{ color: 'action.active' }} />
                                                              </InputAdornment>
                                                            )
                                                          }}
                                                          inputProps={{
                                                            placeholder: 'dd/mm/aaaa'
                                                          }}
                                                          sx={{ minWidth: 150 }}
                                                        />
                                                    <TextField
                                                          label="Hasta"
                                                          type="date"
                                                          size="small"
                                                          value={filtroFechaDeuda[entidad.Entnroid]?.hasta || ''}
                                                          onChange={(e) => actualizarFiltroDeuda(entidad.Entnroid, 'hasta', e.target.value)}
                                                          InputLabelProps={{ shrink: true }}
                                                          InputProps={{
                                                            endAdornment: (
                                                              <InputAdornment position="end">
                                                                <DateRange sx={{ color: 'action.active' }} />
                                                              </InputAdornment>
                                                            )
                                                          }}
                                                          inputProps={{
                                                            placeholder: 'dd/mm/aaaa'
                                                          }}
                                                          sx={{ minWidth: 150 }}
                                                        />
                                                    <Button
                                                      variant="outlined"
                                                      size="small"
                                                      startIcon={<Clear />}
                                                      onClick={() => limpiarFiltroDeuda(entidad.Entnroid)}
                                                      sx={{ minWidth: 100 }}
                                                    >
                                                      Limpiar
                                                    </Button>
                                                    <Button
                                                      variant="contained"
                                                      size="small"
                                                      startIcon={<PictureAsPdf />}
                                                      onClick={() => abrirReporte(entidad, 'deudas')}
                                                      color="secondary"
                                                      sx={{ minWidth: 120 }}
                                                    >
                                                      Reporte PDF
                                                    </Button>
                                                  </Box>
                                                </Box>
                                                {loadingTabData[entidad.Entnroid] ? (
                                                  <TableLoader message="Cargando información de deudas..." />
                                                ) : datosRelacionados[entidad.Entnroid]?.deuda && datosRelacionados[entidad.Entnroid].deuda.length > 0 ? (
                                                  <TableContainer component={Paper} sx={{ maxHeight: 300, overflowX: 'auto' }}>
                                                    <Table size="small" stickyHeader sx={{ minWidth: 800 }}>
                                                      <TableHead>
                                                        <TableRow>
                                                          <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'error.main', color: 'white', width: '80px' }}>Sucursal ID</TableCell>
                                                          <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'error.main', color: 'white', width: '80px' }}>Deuda ID</TableCell>
                                                          <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'error.main', color: 'white', width: '80px' }}>Entidad ID</TableCell>
                                                          <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'error.main', color: 'white', width: '100px' }}>Fecha</TableCell>
                                                          <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'error.main', color: 'white', width: '120px' }}>Importe</TableCell>
                                                          <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'error.main', color: 'white', width: '120px' }}>Saldo</TableCell>
                                                        </TableRow>
                                                      </TableHead>
                                                      <TableBody>
                                                        {filtrarPorFecha(
                                                          datosRelacionados[entidad.Entnroid].deuda,
                                                          'DeuFecha',
                                                          filtroFechaDeuda[entidad.Entnroid] || { desde: '', hasta: '' }
                                                        ).map((deuda: any, index: number) => (
                                                          <TableRow key={`${deuda.DeuNroId}-${index}`}>
                                                            <TableCell sx={{ p: 1, width: '80px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{deuda.SucNroId}</TableCell>
                                                            <TableCell sx={{ p: 1, width: '80px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{deuda.DeuNroId}</TableCell>
                                                            <TableCell sx={{ p: 1, width: '80px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{deuda.EntNroId}</TableCell>
                                                            <TableCell sx={{ p: 1, width: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                              {deuda.DeuFecha ? new Date(deuda.DeuFecha).toLocaleDateString('es-AR') : 'Sin fecha'}
                                                            </TableCell>
                                                            <TableCell sx={{ p: 1, width: '120px' }}>
                                                              <Chip 
                                                                label={`$${deuda.DeuImpor?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0.00'}`} 
                                                                color="error" 
                                                                variant="outlined" 
                                                                size="small" 
                                                              />
                                                            </TableCell>
                                                            <TableCell sx={{ p: 1, width: '120px' }}>
                                                              <Chip 
                                                                label={`$${deuda.DeuSaldo?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0.00'}`} 
                                                                color={deuda.DeuSaldo > 0 ? "warning" : "success"} 
                                                                variant="outlined" 
                                                                size="small" 
                                                              />
                                                            </TableCell>
                                                          </TableRow>
                                                        ))}
                                                      </TableBody>
                                                    </Table>
                                                  </TableContainer>
                                                ) : (
                                                  <EmptyState 
                                                    icon={<Receipt />}
                                                    title="Sin facturas"
                                                    description="No hay facturas asociadas a esta entidad."
                                                  />
                                                )}
                                              </CardContent>
                                            </Card>
                                          )}
                                          
                                          {/* Pestaña de Movimientos */}
                                          {activeTab[entidad.Entnroid] === 'movimientos' && (
                                            <Grid container spacing={2}>
                                              {/* Movimientos Combinados con Debe y Haber */}
                                              <Grid item xs={12}>
                                                <Card variant="outlined">
                                                  <CardContent>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                      <Payments sx={{ mr: 1, color: 'primary.main' }} />
                                                      <Typography variant="h6" color="primary">
                                                        💰 Movimientos Contables (Debe y Haber)
                                                      </Typography>
                                                    </Box>
                                                    
                                                    {/* Filtros de fecha para Movimientos */}
                                                    <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <DateRange sx={{ mr: 1, color: 'secondary.main' }} />
                                                        <Typography variant="subtitle2" color="primary">
                                                          Filtrar por fecha
                                                        </Typography>
                                                      </Box>
                                                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                                        <TextField
                                                           label="Desde"
                                                           type="date"
                                                           size="small"
                                                           value={filtroFechaMovimientos[entidad.Entnroid]?.desde || ''}
                                                           onChange={(e) => actualizarFiltroMovimientos(entidad.Entnroid, 'desde', e.target.value)}
                                                           InputLabelProps={{ shrink: true }}
                                                           InputProps={{
                                                             endAdornment: (
                                                               <InputAdornment position="end">
                                                                 <DateRange sx={{ color: 'action.active' }} />
                                                               </InputAdornment>
                                                             )
                                                           }}
                                                           inputProps={{
                                                             placeholder: 'dd/mm/aaaa'
                                                           }}
                                                           sx={{ minWidth: 150 }}
                                                         />
                                                        <TextField
                                                           label="Hasta"
                                                           type="date"
                                                           size="small"
                                                           value={filtroFechaMovimientos[entidad.Entnroid]?.hasta || ''}
                                                           onChange={(e) => actualizarFiltroMovimientos(entidad.Entnroid, 'hasta', e.target.value)}
                                                           InputLabelProps={{ shrink: true }}
                                                           InputProps={{
                                                             endAdornment: (
                                                               <InputAdornment position="end">
                                                                 <DateRange sx={{ color: 'action.active' }} />
                                                               </InputAdornment>
                                                             )
                                                           }}
                                                           inputProps={{
                                                             placeholder: 'dd/mm/aaaa'
                                                           }}
                                                           sx={{ minWidth: 150 }}
                                                         />
                                                        <Button
                                                          variant="outlined"
                                                          size="small"
                                                          startIcon={<Clear />}
                                                          onClick={() => limpiarFiltroMovimientos(entidad.Entnroid)}
                                                          sx={{ minWidth: 100 }}
                                                        >
                                                          Limpiar
                                                        </Button>
                                                        <Button
                                                          variant="contained"
                                                          size="small"
                                                          startIcon={<PictureAsPdf />}
                                                          onClick={() => abrirReporte(entidad, 'movimientos')}
                                                          color="secondary"
                                                          sx={{ minWidth: 120 }}
                                                        >
                                                          Reporte PDF
                                                        </Button>
                                                      </Box>
                                                    </Box>
                                                    
                                                    {loadingTabData[entidad.Entnroid] ? (
                                                      <TableLoader message="Cargando movimientos contables..." />
                                                    ) : datosRelacionados[entidad.Entnroid]?.movimientosCombinados && datosRelacionados[entidad.Entnroid].movimientosCombinados.length > 0 ? (
                                                      <>
                                                        <TableContainer component={Paper} sx={{ maxHeight: 400, overflowX: 'auto' }}>
                                                          <Table size="small" stickyHeader sx={{ minWidth: 1000 }}>
                                                            <TableHead>
                                                              <TableRow>
                                                                <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '80px' }}>Sucursal</TableCell>
                                                                <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '80px' }}>Mov ID</TableCell>
                                                                <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '80px' }}>CTM</TableCell>
                                                                <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '100px' }}>Fecha</TableCell>
                                                                <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '120px' }}>Importe</TableCell>
                                                                <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', width: '150px' }}>Concepto</TableCell>
                                                                <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'success.main', color: 'white', width: '120px' }}>Debe</TableCell>
                                                                <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'error.main', color: 'white', width: '120px' }}>Haber</TableCell>
                                                              </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {obtenerMovimientosPaginados(
                                                                  filtrarPorFecha(
                                                                    datosRelacionados[entidad.Entnroid].movimientosCombinados,
                                                                    'MovFecha',
                                                                    filtroFechaMovimientos[entidad.Entnroid] || { desde: '', hasta: '' }
                                                                  ),
                                                                  entidad.Entnroid
                                                                ).map((movimiento: any, index: number) => (
                                                                <TableRow key={`${movimiento.MovNroId}-${movimiento.DeuNroId || 'null'}-${index}`}>
                                                                  <TableCell sx={{ p: 1, width: '80px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movimiento.SucNroId}</TableCell>
                                                                  <TableCell sx={{ p: 1, width: '80px' }}>
                                                                    <Chip label={movimiento.MovNroId} color="primary" variant="outlined" size="small" />
                                                                  </TableCell>
                                                                  <TableCell sx={{ p: 1, width: '80px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movimiento.CtmNroId}</TableCell>
                                                                  <TableCell sx={{ p: 1, width: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                    {movimiento.MovFecha ? 
                                                                      new Date(movimiento.MovFecha).toLocaleDateString('es-AR') : 
                                                                      'Sin fecha'
                                                                    }
                                                                  </TableCell>
                                                                  <TableCell sx={{ p: 1, width: '120px' }}>
                                                                    <Chip 
                                                                      label={`$${movimiento.MovImpor?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} 
                                                                      color={movimiento.MovImpor >= 0 ? "info" : "warning"} 
                                                                      variant="outlined" 
                                                                      size="small" 
                                                                    />
                                                                  </TableCell>
                                                                  <TableCell sx={{ p: 1, width: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                    {movimiento.CCCDescr || 'Sin concepto'}
                                                                  </TableCell>
                                                                  <TableCell sx={{ p: 1, width: '120px' }}>
                                                                    {movimiento.Debe > 0 ? (
                                                                      <Chip 
                                                                        label={`$${movimiento.Debe?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} 
                                                                        color="success" 
                                                                        variant="filled" 
                                                                        size="small" 
                                                                      />
                                                                    ) : (
                                                                      <Typography variant="body2" color="text.disabled">-</Typography>
                                                                    )}
                                                                  </TableCell>
                                                                  <TableCell sx={{ p: 1, width: '120px' }}>
                                                                    {movimiento.Haber > 0 ? (
                                                                      <Chip 
                                                                        label={`$${movimiento.Haber?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} 
                                                                        color="error" 
                                                                        variant="filled" 
                                                                        size="small" 
                                                                      />
                                                                    ) : (
                                                                      <Typography variant="body2" color="text.disabled">-</Typography>
                                                                    )}
                                                                  </TableCell>
                                                                </TableRow>
                                                              ))}
                                                            </TableBody>
                                                          </Table>
                                                        </TableContainer>
                                                        <TablePagination
                                                          component="div"
                                                          count={filtrarPorFecha(
                                                            datosRelacionados[entidad.Entnroid].movimientosCombinados,
                                                            'MovFecha',
                                                            filtroFechaMovimientos[entidad.Entnroid] || { desde: '', hasta: '' }
                                                          ).length}
                                                          page={paginaMovimientos[entidad.Entnroid] || 0}
                                                          onPageChange={(event, newPage) => cambiarPaginaMovimientos(entidad.Entnroid, newPage)}
                                                          rowsPerPage={filasPorPaginaMovimientos}
                                                          rowsPerPageOptions={[10]}
                                                          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                                                          labelRowsPerPage="Filas por página:"
                                                          sx={{ 
                                                            borderTop: 1, 
                                                            borderColor: 'divider',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            '& .MuiTablePagination-toolbar': {
                                                              justifyContent: 'center'
                                                            }
                                                          }}
                                                        />
                                                      </>
                                                    ) : (
                                                      <EmptyState 
                                                        icon={<Payments />}
                                                        title="Sin movimientos contables"
                                                        description="No hay información de movimientos contables asociada a esta entidad en el período seleccionado."
                                                      />
                                                    )}
                                                  </CardContent>
                                                </Card>
                                              </Grid>
                                            </Grid>
                                          )}
                                          
                                          {/* Pestaña de Facturas */}
                                          {activeTab[entidad.Entnroid] === 'facturas' && (
                                            <Card variant="outlined">
                                              <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                  <Receipt sx={{ mr: 1, color: 'success.main' }} />
                                                  <Typography variant="h6" color="success">
                                                    Facturas
                                                  </Typography>
                                                </Box>
                                                
                                                {loadingTabData[entidad.Entnroid] ? (
                                                  <TableLoader message="Cargando facturas..." />
                                                ) : datosRelacionados[entidad.Entnroid]?.facturas && datosRelacionados[entidad.Entnroid].facturas.length > 0 ? (
                                                  <>
                                                    <TableContainer component={Paper} sx={{ maxHeight: 400, overflowX: 'hidden' }}>
                                                      <Table size="small" stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
                                                        <TableHead>
                                                          <TableRow>
                                                            <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'success.main', color: 'white', width: '50px' }}></TableCell>
                                                            <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'success.main', color: 'white', width: '120px' }}>Número</TableCell>
                                                            <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'success.main', color: 'white', width: '100px' }}>Fecha</TableCell>
                                                            <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'success.main', color: 'white', width: '100px' }}>Tipo</TableCell>
                                                            <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'success.main', color: 'white', width: '120px' }}>Importe</TableCell>
                                                            <TableCell sx={{ p: 1, fontWeight: 'bold', bgcolor: 'success.main', color: 'white', width: '100px' }}>Estado</TableCell>
                                                          </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                          {obtenerFacturasPaginadas(
                                                            datosRelacionados[entidad.Entnroid].facturas,
                                                            entidad.Entnroid
                                                          ).map((factura: any, index: number) => {
                                                            const facturaId = `${entidad.Entnroid}-${factura.FactNroId || factura.id}-${index}`
                                                            const isExpanded = facturasExpandidas.has(facturaId)
                                                            return (
                                                              <React.Fragment key={facturaId}>
                                                                <TableRow 
                                                                  hover 
                                                                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'success.50' } }}
                                                                  onClick={() => toggleFacturaDetalle(facturaId)}
                                                                >
                                                                  <TableCell sx={{ p: 1, width: '50px' }}>
                                                                    <IconButton size="small">
                                                                      {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                                                    </IconButton>
                                                                  </TableCell>
                                                                  <TableCell sx={{ p: 1, width: '120px' }}>
                                                                    <Chip 
                                                                      label={factura.FactNumero || factura.numero || 'S/N'} 
                                                                      color="success" 
                                                                      variant="outlined" 
                                                                      size="small" 
                                                                    />
                                                                  </TableCell>
                                                                  <TableCell sx={{ p: 1, width: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                    {factura.FactFecha || factura.fecha ? 
                                                                      new Date(factura.FactFecha || factura.fecha).toLocaleDateString('es-AR') : 
                                                                      'Sin fecha'
                                                                    }
                                                                  </TableCell>
                                                                  <TableCell sx={{ p: 1, width: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{factura.FactTipo || factura.tipo || 'No especificado'}</TableCell>
                                                                  <TableCell sx={{ p: 1, width: '120px' }}>
                                                                    <Chip 
                                                                      label={`$${(factura.FaTotal || factura.FactImporte || factura.importe || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} 
                                                                      color="success" 
                                                                      variant="outlined" 
                                                                      size="small" 
                                                                    />
                                                                  </TableCell>
                                                                  <TableCell sx={{ p: 1, width: '100px' }}>
                                                                    <Chip 
                                                                      label={factura.FactEstado || factura.estado || 'Pendiente'} 
                                                                      color={factura.FactEstado === 'Pagada' || factura.estado === 'Pagada' ? 'success' : 'warning'} 
                                                                      variant="outlined" 
                                                                      size="small" 
                                                                    />
                                                                  </TableCell>
                                                                </TableRow>
                                                                {isExpanded && (
                                                                  <TableRow>
                                                                    <TableCell colSpan={6} sx={{ py: 0 }}>
                                                                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                                        <Box sx={{ margin: 2 }}>
                                                                          <Typography variant="h6" gutterBottom component="div" sx={{ color: 'success.main' }}>
                                                                            📋 Detalle de Factura
                                                                          </Typography>
                                                                          
                                                                          {/* Datos del Cliente */}
                                                                          <Card variant="outlined" sx={{ mb: 3, bgcolor: 'grey.50' }}>
                                                                            <CardContent sx={{ p: 2 }}>
                                                                              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                                                                                <Business sx={{ mr: 1 }} />
                                                                                Datos del Cliente
                                                                              </Typography>
                                                                              <Grid container spacing={2}>
                                                                                <Grid item xs={12} md={6}>
                                                                                  <List dense>
                                                                                    <ListItem>
                                                                                      <ListItemText 
                                                                                        primary="Razón Social" 
                                                                                        secondary={entidad.EntRazSoc || 'No especificada'} 
                                                                                      />
                                                                                    </ListItem>
                                                                                    <ListItem>
                                                                                      <ListItemText 
                                                                                        primary="Nombre" 
                                                                                        secondary={entidad.Entnombr || 'No especificado'} 
                                                                                      />
                                                                                    </ListItem>
                                                                                    <ListItem>
                                                                                      <ListItemText 
                                                                                        primary="CUIT" 
                                                                                        secondary={entidad.EntCUIT || 'No especificado'} 
                                                                                      />
                                                                                    </ListItem>
                                                                                  </List>
                                                                                </Grid>
                                                                                <Grid item xs={12} md={6}>
                                                                                  <List dense>
                                                                                    <ListItem>
                                                                                      <ListItemText 
                                                                                        primary="Domicilio" 
                                                                                        secondary={entidad.EntDomic || 'No especificado'} 
                                                                                      />
                                                                                    </ListItem>
                                                                                    <ListItem>
                                                                                      <ListItemText 
                                                                                        primary="Localidad" 
                                                                                        secondary={`${entidad.EntLocal || ''} ${entidad.EntProvi || ''} ${entidad.EntCodPo || ''}`.trim() || 'No especificada'} 
                                                                                      />
                                                                                    </ListItem>
                                                                                    <ListItem>
                                                                                      <ListItemText 
                                                                                        primary="Teléfono" 
                                                                                        secondary={entidad.EntTelef || entidad.EntTelef2 || 'No especificado'} 
                                                                                      />
                                                                                    </ListItem>
                                                                                  </List>
                                                                                </Grid>
                                                                              </Grid>
                                                                            </CardContent>
                                                                          </Card>
                                                                          
                                                                          {/* Datos de la Factura */}
                                                                            <Card variant="outlined" sx={{ mb: 3, bgcolor: 'success.50' }}>
                                                                              <CardContent sx={{ p: 2 }}>
                                                                                <Typography variant="h6" gutterBottom sx={{ color: 'success.main', display: 'flex', alignItems: 'center' }}>
                                                                                  <Receipt sx={{ mr: 1 }} />
                                                                                  Datos de la Factura
                                                                                </Typography>
                                                                                <Grid container spacing={2}>
                                                                                  <Grid item xs={12} md={4}>
                                                                                    <List dense>
                                                                                      <ListItem>
                                                                                        <ListItemText 
                                                                                          primary="Número de Factura" 
                                                                                          secondary={factura.FactNumero || factura.numero || 'S/N'} 
                                                                                        />
                                                                                      </ListItem>
                                                                                      <ListItem>
                                                                                        <ListItemText 
                                                                                          primary="Tipo de Factura" 
                                                                                          secondary={factura.FactTipo || factura.tipo || 'No especificado'} 
                                                                                        />
                                                                                      </ListItem>
                                                                                    </List>
                                                                                  </Grid>
                                                                                  <Grid item xs={12} md={4}>
                                                                                    <List dense>
                                                                                      <ListItem>
                                                                                        <ListItemText 
                                                                                          primary="Fecha de Emisión" 
                                                                                          secondary={factura.FactFecha || factura.fecha ? 
                                                                                            new Date(factura.FactFecha || factura.fecha).toLocaleDateString('es-AR') : 
                                                                                            'Sin fecha'
                                                                                          } 
                                                                                        />
                                                                                      </ListItem>
                                                                                      <ListItem>
                                                                                        <ListItemText 
                                                                                          primary="Estado" 
                                                                                          secondary={
                                                                                            <Chip 
                                                                                              label={factura.FactEstado || factura.estado || 'Pendiente'} 
                                                                                              color={factura.FactEstado === 'C' ? 'success' : factura.FactEstado === 'A' ? 'info' : 'warning'} 
                                                                                              size="small" 
                                                                                            />
                                                                                          } 
                                                                                        />
                                                                                      </ListItem>
                                                                                    </List>
                                                                                  </Grid>
                                                                                  <Grid item xs={12} md={4}>
                                                                                    <List dense>
                                                                                      <ListItem>
                                                                                        <ListItemText 
                                                                                          primary="Importe Total" 
                                                                                          secondary={
                                                                                            <Typography variant="h6" color="success.main">
                                                                                              ${(factura.FaTotal || factura.FactImporte || factura.importe || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                                                            </Typography>
                                                                                          } 
                                                                                        />
                                                                                      </ListItem>
                                                                                      <ListItem>
                                                                                        <ListItemText 
                                                                                          primary="ID de Factura" 
                                                                                          secondary={factura.FactNroId || factura.id || 'N/A'} 
                                                                                        />
                                                                                      </ListItem>
                                                                                    </List>
                                                                                  </Grid>
                                                                                </Grid>
                                                                              </CardContent>
                                                                            </Card>
                                                                          
                                                                          {/* Detalle de líneas de factura */}
                                                                          <Box sx={{ mt: 3 }}>
                                                                            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                                                                              📋 Detalle de Artículos
                                                                            </Typography>
                                                                            
                                                                            {cargandoDetalles.has(facturaId) ? (
                                                                              <TableLoader message="Cargando detalle de artículos..." />
                                                                            ) : detallesFactura[facturaId] && detallesFactura[facturaId].length > 0 ? (
                                                                              <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
                                                                                <Table size="small" sx={{ minWidth: 600 }}>
                                                                                  <TableHead>
                                                                                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                                                                                      <TableCell sx={{ p: 1, width: '25%' }}><strong>Artículo</strong></TableCell>
                                                                                      <TableCell align="center" sx={{ p: 1, width: '12%' }}><strong>Código</strong></TableCell>
                                                                                      <TableCell align="center" sx={{ p: 1, width: '10%' }}><strong>Cantidad</strong></TableCell>
                                                                                      <TableCell align="right" sx={{ p: 1, width: '15%' }}><strong>Precio Unit.</strong></TableCell>
                                                                                      <TableCell align="right" sx={{ p: 1, width: '15%' }}><strong>Neto</strong></TableCell>
                                                                                      <TableCell align="right" sx={{ p: 1, width: '12%' }}><strong>IVA</strong></TableCell>
                                                                                      <TableCell align="right" sx={{ p: 1, width: '16%' }}><strong>Total</strong></TableCell>
                                                                                    </TableRow>
                                                                                  </TableHead>
                                                                                  <TableBody>
                                                                                    {detallesFactura[facturaId].map((detalle: any, index: number) => (
                                                                                      <TableRow key={index} hover>
                                                                                        <TableCell sx={{ p: 1, width: '25%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                                          <Typography variant="body2" fontWeight="medium">
                                                                                            {detalle.ArtDescr || detalle.DeArtDescr || 'Sin descripción'}
                                                                                          </Typography>
                                                                                          {detalle.DeArtDescr2 && (
                                                                                            <Typography variant="caption" color="text.secondary">
                                                                                              {detalle.DeArtDescr2}
                                                                                            </Typography>
                                                                                          )}
                                                                                          {detalle.ArtBarra && (
                                                                                            <Typography variant="caption" color="text.secondary" display="block">
                                                                                              Código de barras: {detalle.ArtBarra}
                                                                                            </Typography>
                                                                                          )}
                                                                                        </TableCell>
                                                                                        <TableCell align="center" sx={{ p: 1, width: '12%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                                          <Chip 
                                                                                            label={detalle.ArtCodigo || detalle.ArtCodAbr || detalle.ArtNroId || 'N/A'} 
                                                                                            size="small" 
                                                                                            variant="outlined"
                                                                                          />
                                                                                        </TableCell>
                                                                                        <TableCell align="center" sx={{ p: 1, width: '10%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                                          <Typography variant="body2" fontWeight="medium">
                                                                                            {detalle.DeCanti || 0}
                                                                                          </Typography>
                                                                                        </TableCell>
                                                                                        <TableCell align="right" sx={{ p: 1, width: '15%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                                          ${(detalle.DePreUn || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                                                        </TableCell>
                                                                                        <TableCell align="right" sx={{ p: 1, width: '15%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                                          ${(detalle.DeNetGr || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                                                        </TableCell>
                                                                                        <TableCell align="right" sx={{ p: 1, width: '12%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                                          ${(detalle.DeImIva || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                                                        </TableCell>
                                                                                        <TableCell align="right" sx={{ p: 1, width: '16%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                                          <Typography variant="body2" fontWeight="bold" color="primary">
                                                                                            ${(detalle.DeTotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                                                          </Typography>
                                                                                        </TableCell>
                                                                                      </TableRow>
                                                                                    ))}
                                                                                    <TableRow sx={{ bgcolor: 'primary.50' }}>
                                                                                      <TableCell colSpan={6} align="right">
                                                                                        <Typography variant="subtitle2" fontWeight="bold">
                                                                                          Total Factura:
                                                                                        </Typography>
                                                                                      </TableCell>
                                                                                      <TableCell align="right">
                                                                                        <Typography variant="h6" fontWeight="bold" color="primary">
                                                                                          ${(detallesFactura[facturaId][0]?.FaTotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                                                        </Typography>
                                                                                      </TableCell>
                                                                                    </TableRow>
                                                                                  </TableBody>
                                                                                </Table>
                                                                              </TableContainer>
                                                                            ) : (
                                                                              <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                                                                                <Typography variant="body2" color="warning.main">
                                                                                  ⚠️ <strong>Sin detalles:</strong> No se encontraron líneas de detalle para esta factura. 
                                                                                  Asegúrate de que las tablas de detalle estén creadas y contengan datos.
                                                                                </Typography>
                                                                              </Box>
                                                                            )}
                                                                          </Box>
                                                                        </Box>
                                                                      </Collapse>
                                                                    </TableCell>
                                                                  </TableRow>
                                                                )}
                                                              </React.Fragment>
                                                            )
                                                          })}
                                                      </TableBody>
                                                    </Table>
                                                  </TableContainer>
                                                  <TablePagination
                                                    component="div"
                                                    count={datosRelacionados[entidad.Entnroid].facturas.length}
                                                    page={paginaFacturas[entidad.Entnroid] || 0}
                                                    onPageChange={(event, newPage) => cambiarPaginaFacturas(entidad.Entnroid, newPage)}
                                                    rowsPerPage={filasPorPaginaFacturas}
                                                    rowsPerPageOptions={[20]}
                                                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                                                    labelRowsPerPage="Filas por página:"
                                                  />
                                                </>
                                              ) : (
                                                  <EmptyState 
                                                    icon={<Receipt />}
                                                    title="Sin facturas"
                                                    description="No hay facturas asociadas a esta entidad."
                                                  />
                                                )}
                                              </CardContent>
                                            </Card>
                                          )}


                                        </Box>
                                      )}
                                    </Box>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={filteredDatos.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[20]}
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                    labelRowsPerPage="Filas por página:"
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      '& .MuiTablePagination-toolbar': {
                        justifyContent: 'center'
                      }
                    }}
                  />
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
{`SELECT 
  Entnroid,
  Entnombr,
  Entemail,
  EntRazSoc,
  EntDomic,
  EntLocal,
  EntProvi,
  EntCodPo,
  EntTelef
FROM Ent_maeentidad
ORDER BY Entnroid`}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Resumen estadístico */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assessment />
                    Resumen estadístico
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="Total de registros" secondary={datos.length.toLocaleString()} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Registros filtrados" secondary={filteredDatos.length.toLocaleString()} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Registros con email" secondary={datos.filter(d => d.Entemail && d.Entemail.trim()).length.toLocaleString()} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Registros sin email" secondary={datos.filter(d => !d.Entemail || !d.Entemail.trim()).length.toLocaleString()} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Registros con razón social" secondary={datos.filter(d => d.EntRazSoc && d.EntRazSoc.trim()).length.toLocaleString()} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Registros con domicilio" secondary={datos.filter(d => d.EntDomic && d.EntDomic.trim()).length.toLocaleString()} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Registros con localidad" secondary={datos.filter(d => d.EntLocal && d.EntLocal.trim()).length.toLocaleString()} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Registros con provincia" secondary={datos.filter(d => d.EntProvi && d.EntProvi.trim()).length.toLocaleString()} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Registros con código postal" secondary={datos.filter(d => d.EntCodPo && d.EntCodPo.trim()).length.toLocaleString()} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Registros con teléfono" secondary={datos.filter(d => d.EntTelef && d.EntTelef.trim()).length.toLocaleString()} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
      )}
      
      {/* Modal de Reporte */}
      <Dialog 
        open={reporteAbierto} 
        onClose={cerrarReporte} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Reporte de {tipoReporte === 'deudas' ? 'Deudas' : 'Movimientos'}
            </Typography>
            <IconButton onClick={cerrarReporte}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <div id="reporte-contenido">
            {entidadReporte && (
              <>
                {/* Datos de la Entidad */}
                <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    Información de la Entidad
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography><strong>ID:</strong> {entidadReporte.Entnroid}</Typography>
                      <Typography><strong>Nombre:</strong> {entidadReporte.Entnombr}</Typography>
                      <Typography><strong>Razón Social:</strong> {entidadReporte.EntRazSoc}</Typography>
                      <Typography><strong>Email:</strong> {entidadReporte.Entemail}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography><strong>CUIT:</strong> {entidadReporte.EntCUIT}</Typography>
                      <Typography><strong>Teléfono:</strong> {entidadReporte.EntTelef}</Typography>
                      <Typography><strong>Domicilio:</strong> {entidadReporte.EntDomic}</Typography>
                      <Typography><strong>Localidad:</strong> {entidadReporte.EntLocal}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Información del Rango de Fechas */}
                <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1, color: 'secondary.main', display: 'flex', alignItems: 'center' }}>
                    <DateRange sx={{ mr: 1 }} />
                    Rango de Fechas Consultadas
                  </Typography>
                  {(() => {
                    const filtroEntidad = tipoReporte === 'deudas' 
                      ? filtroFechaDeuda[entidadReporte.Entnroid] || { desde: '', hasta: '' }
                      : filtroFechaMovimientos[entidadReporte.Entnroid] || { desde: '', hasta: '' }
                    
                    if (!filtroEntidad.desde && !filtroEntidad.hasta) {
                      return (
                        <Typography color="text.secondary">
                          Mostrando todos los registros (sin filtro de fecha)
                        </Typography>
                      )
                    }
                    
                    return (
                      <Typography>
                        <strong>Desde:</strong> {filtroEntidad.desde ? new Date(filtroEntidad.desde).toLocaleDateString('es-AR') : 'Sin límite'} 
                        {' | '}
                        <strong>Hasta:</strong> {filtroEntidad.hasta ? new Date(filtroEntidad.hasta).toLocaleDateString('es-AR') : 'Sin límite'}
                      </Typography>
                    )
                  })()}
                </Box>

                {/* Tabla de Datos */}
                {tipoReporte === 'deudas' && datosRelacionados[entidadReporte.Entnroid]?.deuda && (
                  <TableContainer component={Paper} sx={{ overflowX: 'hidden' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Sucursal ID</strong></TableCell>
                          <TableCell><strong>Deuda ID</strong></TableCell>
                          <TableCell><strong>Entidad ID</strong></TableCell>
                          <TableCell><strong>Fecha</strong></TableCell>
                          <TableCell><strong>Importe</strong></TableCell>
                          <TableCell><strong>Saldo</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {datosRelacionados[entidadReporte.Entnroid].deuda
                          .filter((deuda: any) => {
                            const filtroEntidad = filtroFechaDeuda[entidadReporte.Entnroid] || { desde: '', hasta: '' }
                            if (!filtroEntidad.desde && !filtroEntidad.hasta) return true
                            const fechaDeuda = new Date(deuda.DeuFecha)
                            const desde = filtroEntidad.desde ? new Date(filtroEntidad.desde) : null
                            const hasta = filtroEntidad.hasta ? new Date(filtroEntidad.hasta) : null
                            return (!desde || fechaDeuda >= desde) && (!hasta || fechaDeuda <= hasta)
                          })
                          .sort((a: any, b: any) => {
                            const fechaA = new Date(a.DeuFecha || 0)
                            const fechaB = new Date(b.DeuFecha || 0)
                            return fechaA.getTime() - fechaB.getTime()
                          })
                          .map((deuda: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{deuda.SucNroId}</TableCell>
                              <TableCell>{deuda.DeuNroId}</TableCell>
                              <TableCell>{deuda.EntNroId}</TableCell>
                              <TableCell>{deuda.DeuFecha ? new Date(deuda.DeuFecha).toLocaleDateString('es-AR') : 'Sin fecha'}</TableCell>
                              <TableCell>${deuda.DeuImpor?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0.00'}</TableCell>
                              <TableCell>${deuda.DeuSaldo?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0.00'}</TableCell>
                            </TableRow>
                          ))
                        }
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {tipoReporte === 'movimientos' && datosRelacionados[entidadReporte.Entnroid]?.movimientosCombinados && (
                  <TableContainer component={Paper} sx={{ overflowX: 'hidden' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Fecha</strong></TableCell>
                          <TableCell><strong>Descripción</strong></TableCell>
                          <TableCell><strong>Debe</strong></TableCell>
                          <TableCell><strong>Haber</strong></TableCell>
                          <TableCell><strong>Saldo</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {datosRelacionados[entidadReporte.Entnroid].movimientosCombinados
                          .filter((movimiento: any) => {
                            const filtroEntidad = filtroFechaMovimientos[entidadReporte.Entnroid] || { desde: '', hasta: '' }
                            if (!filtroEntidad.desde && !filtroEntidad.hasta) return true
                            const fechaMovimiento = new Date(movimiento.MovFecha)
                            const desde = filtroEntidad.desde ? new Date(filtroEntidad.desde) : null
                            const hasta = filtroEntidad.hasta ? new Date(filtroEntidad.hasta) : null
                            return (!desde || fechaMovimiento >= desde) && (!hasta || fechaMovimiento <= hasta)
                          })
                          .sort((a: any, b: any) => {
                            const fechaA = new Date(a.MovFecha || 0)
                            const fechaB = new Date(b.MovFecha || 0)
                            return fechaA.getTime() - fechaB.getTime()
                          })
                          .map((movimiento: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{movimiento.MovFecha ? new Date(movimiento.MovFecha).toLocaleDateString('es-AR') : 'Sin fecha'}</TableCell>
                              <TableCell>{movimiento.CCCDescr || 'Sin descripción'}</TableCell>
                              <TableCell>
                                {movimiento.Debe > 0 && (
                                  <Chip 
                                    label={`$${movimiento.Debe.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} 
                                    color="error" 
                                    variant="outlined" 
                                    size="small" 
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                {movimiento.Haber > 0 && (
                                  <Chip 
                                    label={`$${movimiento.Haber.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} 
                                    color="success" 
                                    variant="outlined" 
                                    size="small" 
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={`$${(movimiento.Haber - movimiento.Debe).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} 
                                  color={(movimiento.Haber - movimiento.Debe) >= 0 ? "success" : "error"} 
                                  variant="outlined" 
                                  size="small" 
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        }
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={descargarPDF} 
            variant="contained" 
            startIcon={<PictureAsPdf />}
            disabled={generandoPDF}
          >
            {generandoPDF ? 'Generando PDF...' : 'Descargar PDF'}
          </Button>
          <Button onClick={cerrarReporte}>Cerrar</Button>
        </DialogActions>
      </Dialog>
      
        {/* Botón de navegación */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="outlined"
            href="/"
            sx={{ px: 3, py: 1 }}
          >
            ← Volver al Dashboard
          </Button>
        </Box>
      </Container>
    </Box>
  )
}