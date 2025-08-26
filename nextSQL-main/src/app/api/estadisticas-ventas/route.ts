import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const pool = await getConnection()
    if (!pool) {
      return NextResponse.json(
        { error: 'No se pudo conectar a la base de datos' },
        { status: 500 }
      )
    }

    // Obtener parámetros de la URL o usar valores por defecto (mes actual)
    const { searchParams } = new URL(request.url)
    const currentDate = new Date()
    const currentMonth = parseInt(searchParams.get('mes') || (currentDate.getMonth() + 1).toString())
    const currentYear = parseInt(searchParams.get('anio') || currentDate.getFullYear().toString())
    
    // Validar parámetros
    if (currentMonth < 1 || currentMonth > 12) {
      return NextResponse.json(
        { error: 'El mes debe estar entre 1 y 12' },
        { status: 400 }
      )
    }
    
    if (currentYear < 2000 || currentYear > 2100) {
      return NextResponse.json(
        { error: 'El año debe estar entre 2000 y 2100' },
        { status: 400 }
      )
    }
    
    console.log(`[ESTADISTICAS_VENTAS] Consultando datos para ${currentMonth}/${currentYear}`)

    // Query para obtener total de ventas mensuales
    const ventasQuery = `
      SELECT 
        COUNT(*) as TotalVentas,
        SUM(ISNULL(vf.FaTotal, 0)) as TotalFacturacion,
        AVG(ISNULL(vf.FaTotal, 0)) as PromedioVenta
      FROM VEN_FACTUR vf
      LEFT JOIN VEN_CODVTA vc ON vf.CVeNroId = vc.CVeNroId
      WHERE MONTH(vf.FaFecha) = @mes 
        AND YEAR(vf.FaFecha) = @anio
        AND ISNULL(vc.CVeSigno, 1) > 0  -- Solo facturas positivas (no notas de crédito)
    `

    const ventasResult = await pool.request()
      .input('mes', currentMonth)
      .input('anio', currentYear)
      .query(ventasQuery)

    // Query para obtener artículos más vendidos del mes
    const articulosQuery = `
      SELECT TOP 5
        art.ArtDescr as Descripcion,
        art.ArtCodigo as Codigo,
        SUM(ISNULL(vf1.DeCanti, 0)) as CantidadVendida,
        SUM(ISNULL(vf1.DeTotal, 0)) as TotalVentas
      FROM VEN_FACTUR vf
      INNER JOIN VEN_FACTUR1 vf1 ON vf.FaNroF1 = vf1.FaNroF1 
        AND vf.FaNroF2 = vf1.FaNroF2 
        AND vf.FaTipFa = vf1.FaTipFa 
        AND vf.CVeNroId = vf1.CVeNroId
      LEFT JOIN ART_ARTICU art ON vf1.ArtNroId = art.ArtNroId
      LEFT JOIN VEN_CODVTA vc ON vf.CVeNroId = vc.CVeNroId
      WHERE MONTH(vf.FaFecha) = @mes 
        AND YEAR(vf.FaFecha) = @anio
        AND ISNULL(vc.CVeSigno, 1) > 0  -- Solo facturas positivas
        AND vf1.DeCanti > 0
      GROUP BY art.ArtDescr, art.ArtCodigo
      ORDER BY SUM(ISNULL(vf1.DeCanti, 0)) DESC
    `

    const articulosResult = await pool.request()
      .input('mes', currentMonth)
      .input('anio', currentYear)
      .query(articulosQuery)

    // Query para obtener ventas por día del mes (para gráfico)
    const ventasDiariasQuery = `
      SELECT 
        DAY(vf.FaFecha) as Dia,
        COUNT(*) as CantidadVentas,
        SUM(ISNULL(vf.FaTotal, 0)) as TotalDia
      FROM VEN_FACTUR vf
      LEFT JOIN VEN_CODVTA vc ON vf.CVeNroId = vc.CVeNroId
      WHERE MONTH(vf.FaFecha) = @mes 
        AND YEAR(vf.FaFecha) = @anio
        AND ISNULL(vc.CVeSigno, 1) > 0
      GROUP BY DAY(vf.FaFecha)
      ORDER BY DAY(vf.FaFecha)
    `

    const ventasDiariasResult = await pool.request()
      .input('mes', currentMonth)
      .input('anio', currentYear)
      .query(ventasDiariasQuery)

    const estadisticas = {
      mes: currentMonth,
      anio: currentYear,
      resumenVentas: ventasResult.recordset[0] || {
        TotalVentas: 0,
        TotalFacturacion: 0,
        PromedioVenta: 0
      },
      articulosMasVendidos: articulosResult.recordset || [],
      ventasDiarias: ventasDiariasResult.recordset || []
    }

    console.log(`[ESTADISTICAS_VENTAS] ✅ Estadísticas obtenidas:`, {
      totalVentas: estadisticas.resumenVentas.TotalVentas,
      totalFacturacion: estadisticas.resumenVentas.TotalFacturacion,
      articulosEncontrados: estadisticas.articulosMasVendidos.length
    })

    return NextResponse.json(estadisticas)

  } catch (error) {
    console.error('[ESTADISTICAS_VENTAS] ❌ Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de ventas', details: errorMessage },
      { status: 500 }
    )
  }
}