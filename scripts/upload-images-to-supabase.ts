import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Faltan las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const BUCKET_NAME = 'imagenes'
const PUBLIC_DIR = path.join(process.cwd(), 'public')

// Carpetas específicas a subir dentro de /public
const foldersToUpload = [
  'imagenes_productos',
  'imagenes_combos',
  'portadas_locales',
  'imagenes_promos',
  'assets'
]

async function getFiles(dir: string): Promise<string[]> {
  const dirents = fs.readdirSync(dir, { withFileTypes: true })
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name)
    return dirent.isDirectory() ? getFiles(res) : res
  }))
  return Array.prototype.concat(...files)
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

async function uploadImages() {
  console.log('🚀 Iniciando subida de imágenes a Supabase Storage...')
  
  for (const folder of foldersToUpload) {
    const folderPath = path.join(PUBLIC_DIR, folder)
    
    if (!fs.existsSync(folderPath)) {
      console.warn(`⚠️ La carpeta "${folder}" no existe en /public. Saltando...`)
      continue
    }

    console.log(`\n📁 Procesando carpeta: ${folder}`)
    const allFiles = await getFiles(folderPath)
    
    for (const filePath of allFiles) {
      // Ignorar archivos ocultos
      if (path.basename(filePath).startsWith('.')) continue
      
      // Calcular la ruta relativa para mantener la estructura en el bucket
      // Por ejemplo: public/assets/hero/banner.png -> assets/hero/banner.png
      const relativePath = path.relative(PUBLIC_DIR, filePath)
      
      console.log(`  📤 Subiendo: ${relativePath}...`)
      const fileBuffer = fs.readFileSync(filePath)
      
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(relativePath, fileBuffer, {
          upsert: true,
          contentType: getContentType(filePath)
        })

      if (error) {
        console.error(`  ❌ Error al subir ${relativePath}:`, error.message)
      } else {
        console.log(`  ✅ ${relativePath} subido correctamente.`)
      }
    }
  }

  console.log('\n✨ Proceso de subida finalizado.')
}

uploadImages().catch(err => {
  console.error('💥 Error fatal durante la ejecución:', err)
  process.exit(1)
})
