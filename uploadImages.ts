import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Cargar variables de entorno desde .env si existe
dotenv.config()

// Usar VITE_ prefix para consistencia con el resto del proyecto
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Faltan las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY')
  console.log('Asegúrate de tener un archivo .env con estas variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Carpetas a procesar (según la solicitud del usuario, ajustadas a la realidad del proyecto)
const folders = [
  'imagenes_productos',
  'imagenes_combos',
  'portadas_locales'
]

async function uploadImages() {
  console.log('🚀 Iniciando subida de imágenes a Supabase...')
  console.log(`URL: ${supabaseUrl}`)

  for (const folder of folders) {
    // Intentamos buscar en la raíz y en src/assets por si acaso
    let dirPath = path.join(process.cwd(), folder)
    
    if (!fs.existsSync(dirPath)) {
      dirPath = path.join(process.cwd(), 'src', 'assets', folder)
    }

    if (!fs.existsSync(dirPath)) {
      console.warn(`⚠️ La carpeta "${folder}" no se encontró en la raíz ni en src/assets/. Saltando...`)
      continue
    }

    console.log(`\n📁 Procesando carpeta: ${folder}`)
    const files = fs.readdirSync(dirPath)

    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const stats = fs.statSync(filePath)
      
      // Ignorar archivos ocultos o directorios
      if (stats.isFile() && !file.startsWith('.') && isImage(file)) {
        console.log(`  📤 Subiendo: ${file}...`)
        const fileBuffer = fs.readFileSync(filePath)
        
        // Subimos al bucket "imagenes"
        const { error } = await supabase.storage
          .from('imagenes')
          .upload(file, fileBuffer, {
            upsert: true,
            contentType: getContentType(file)
          })

        if (error) {
          console.error(`  ❌ Error al subir ${file}:`, error.message)
        } else {
          console.log(`  ✅ ${file} subido correctamente.`)
        }
      }
    }
  }

  console.log('\n✨ Proceso finalizado.')
}

function isImage(fileName: string) {
  const exts = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif']
  return exts.includes(path.extname(fileName).toLowerCase())
}

function getContentType(fileName: string) {
  const ext = path.extname(fileName).toLowerCase()
  switch (ext) {
    case '.png': return 'image/png'
    case '.jpg':
    case '.jpeg': return 'image/jpeg'
    case '.webp': return 'image/webp'
    case '.svg': return 'image/svg+xml'
    case '.gif': return 'image/gif'
    default: return 'application/octet-stream'
  }
}

uploadImages().catch(err => {
  console.error('💥 Error fatal:', err)
  process.exit(1)
})
