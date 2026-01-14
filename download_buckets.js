const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = 'https://bxikxsrqphseupmgswdg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aWt4c3JxcGhzZXVwbWdzd2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NjQ3MTAsImV4cCI6MjA4MjU0MDcxMH0.39zNuNptOtn_CO8g9OiJ4MrAHSf6hlRRvOVyUlgb87s'
const supabase = createClient(supabaseUrl, supabaseKey)

const BUCKETS = ['data-models', 'video-clone']
const BASE_DIR = path.join(__dirname, 'probase_buckets')
const CONCURRENCY = 5 // Reduced concurrency
const MAX_RETRIES = 3

// Utils
async function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true })
    }
}

// 1. Collect all files first
async function collectFiles(bucket, folderPath = '', collected = []) {
    // console.log(`Scanning ${bucket}/${folderPath}...`)
    const { data, error } = await supabase.storage.from(bucket).list(folderPath, { limit: 1000 })

    if (error) {
        console.error(`Error listing ${bucket}/${folderPath}:`, error.message)
        return collected
    }

    for (const item of data) {
        const itemPath = folderPath ? `${folderPath}/${item.name}` : item.name

        if (item.id === null) {
            // Folder
            await collectFiles(bucket, itemPath, collected)
        } else {
            // File
            collected.push({ bucket, path: itemPath })
        }
    }
    return collected
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// 2. Download a single file with retry
async function downloadFile(item) {
    const { bucket, path: filePath } = item
    const localPath = path.join(BASE_DIR, bucket, filePath)

    if (fs.existsSync(localPath)) {
        // Check if size > 0 to be sure it's valid?
        const stats = fs.statSync(localPath)
        if (stats.size > 0) return // Skip existing
    }

    const dir = path.dirname(localPath)
    await ensureDir(dir)

    let attempt = 0
    while (attempt < MAX_RETRIES) {
        attempt++
        try {
            // console.log(`Downloading ${bucket}/${filePath} (Attempt ${attempt})...`)
            const { data, error } = await supabase.storage.from(bucket).download(filePath)

            if (error) throw new Error(error.message || 'Unknown error')

            const buffer = Buffer.from(await data.arrayBuffer())
            await fs.promises.writeFile(localPath, buffer)
            return // Success
        } catch (err) {
            console.error(`Error downloading ${filePath} (Attempt ${attempt}): ${err.message}`)
            if (attempt < MAX_RETRIES) await sleep(1000 * attempt) // Backoff
        }
    }
    console.error(`Failed to download ${filePath} after ${MAX_RETRIES} attempts`)
}

// 3. Process with concurrency
async function processBatch(files) {
    let index = 0
    let active = 0
    const total = files.length

    return new Promise((resolve) => {
        const next = () => {
            if (index >= total && active === 0) {
                resolve()
                return
            }

            while (active < CONCURRENCY && index < total) {
                const item = files[index++]
                active++
                if (index % 10 === 0) console.log(`Processing ${index}/${total}...`)

                downloadFile(item).then(() => {
                    active--
                    next()
                })
            }
        }
        next()
    })
}

async function main() {
    await ensureDir(BASE_DIR)

    // Clean up partial downloads? No, we check size > 0

    let allFiles = []

    console.log('Scanning buckets...')
    for (const bucket of BUCKETS) {
        // console.log(`Scanning ${bucket}...`)
        const files = await collectFiles(bucket)
        console.log(`Found ${files.length} files in ${bucket}`)
        allFiles = allFiles.concat(files)
    }

    console.log(`Total files to download: ${allFiles.length}`)
    console.log(`Starting download with concurrency: ${CONCURRENCY}`)

    const start = Date.now()
    await processBatch(allFiles)
    const duration = (Date.now() - start) / 1000

    console.log(`\nAll done! Took ${duration.toFixed(1)}s`)
}

main()
