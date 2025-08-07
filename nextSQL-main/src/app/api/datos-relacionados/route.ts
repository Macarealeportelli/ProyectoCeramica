import { NextRequest, NextResponse } from 'next/server'
import { getDatosRelacionados } from '../../../lib/queries'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entidadId = searchParams.get('id')
    
    if (!entidadId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de entidad requerido',
          data: {}
        },
        { status: 400 }
      )
    }
    
    const id = parseInt(entidadId)
    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de entidad debe ser un número válido',
          data: {}
        },
        { status: 400 }
      )
    }
    
    console.log(`[API RELACIONADOS] 🔍 Consultando datos relacionados para ID: ${id}...`)
    const datosRelacionados = await getDatosRelacionados(id)
    
    console.log(`[API RELACIONADOS] ✅ Datos obtenidos para ID ${id}:`, {
      tieneCliente: !!datosRelacionados.cliente,
      tieneProveedor: !!datosRelacionados.proveedor
    })
    
    return NextResponse.json({
      success: true,
      data: datosRelacionados,
      entidadId: id
    })
    
  } catch (error: any) {
    console.error('[API RELACIONADOS] ❌ Error:', error.message)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        data: {}
      },
      { status: 500 }
    )
  }
}