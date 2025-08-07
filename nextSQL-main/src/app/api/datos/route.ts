import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '../../../lib/db'

export async function GET() {
  try {
    console.log('[API DATOS] 🔍 Consultando tabla ENT_MAEENTIDAD...')
    const pool = await getConnection()
    if (!pool) {
      throw new Error('No se pudo establecer conexión con la base de datos');
    }
    
    const result = await pool.request().query(`
      SELECT 
        Entnroid,
        Entnombr,
        Entemail,
        EntRazSoc,
        EntDomic,
        EntLocal,
        EntProvi,
        EntCodPo,
        EntTelef,
        EntCUIT,
        EntActEc,
        EntUsLog,
        EntFeLog,
        EntSedronar,
        EntTelef2,
        EntCodigo
      FROM Ent_maeentidad
      ORDER BY Entnroid
    `)
    
    console.log(`[API DATOS] ✅ ${result.recordset.length} registros obtenidos`)
    
    return NextResponse.json({
      success: true,
      data: result.recordset,
      count: result.recordset.length
    })
    
  } catch (error: any) {
    console.error('[API DATOS] ❌ Error:', error.message)
    
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