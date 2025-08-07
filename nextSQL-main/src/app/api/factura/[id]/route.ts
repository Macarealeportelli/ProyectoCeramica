import { NextRequest, NextResponse } from 'next/server'
import { obtenerDetalleFactura } from '../../../../lib/queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const facturaId = parseInt(id)
    
    if (isNaN(facturaId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de factura inválido'
        },
        { status: 400 }
      )
    }
    
    console.log(`[API FACTURA-DETALLE] 🔍 Obteniendo detalle para factura ID: ${facturaId}`)
    
    const detalles = await obtenerDetalleFactura(facturaId)
    
    console.log(`[API FACTURA-DETALLE] ✅ ${detalles.length} detalles obtenidos`)
    
    return NextResponse.json({
      success: true,
      data: detalles,
      count: detalles.length,
      facturaId: facturaId
    })
    
  } catch (error: any) {
    console.error('[API FACTURA-DETALLE] ❌ Error:', error.message)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        data: []
      },
      { status: 500 }
    )
  }
}