const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const SOURCE_DIR = path.join(__dirname, 'probase_buckets')
const TARGET_IMAGES = path.join(__dirname, 'images', 'data-models')
const TARGET_VIDEOS = path.join(__dirname, 'videos')

function moveRecursive(src, dest) {
    if (!fs.existsSync(src)) return

    const stats = fs.statSync(src)
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })

        const items = fs.readdirSync(src)
        items.forEach(item => {
            moveRecursive(path.join(src, item), path.join(dest, item))
        })
    } else {
        // Only move if dest doesn't exist or overwriting is desired (using rename for speed)
        // Ensure parent dir exists
        const parent = path.dirname(dest)
        if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true })

        fs.renameSync(src, dest)
    }
}

async function run() {
    console.log('Organizing files...')

    // Move data-models to images/data-models
    const sourceModels = path.join(SOURCE_DIR, 'data-models')
    if (fs.existsSync(sourceModels)) {
        console.log(`Moving ${sourceModels} to ${TARGET_IMAGES}...`)
        moveRecursive(sourceModels, TARGET_IMAGES)
    }

    // Move video-clone to videos/
    const sourceVideos = path.join(SOURCE_DIR, 'video-clone')
    if (fs.existsSync(sourceVideos)) {
        console.log(`Moving ${sourceVideos} to ${TARGET_VIDEOS}...`)
        moveRecursive(sourceVideos, TARGET_VIDEOS) // This puts contents of video-clone directly into videos? 
        // No, I want videos/video-clone probably, or just videos/
        // The bucket 'video-clone' contains structure like 'beauty/videos/...'. 
        // So if moveRecursive(sourceVideos, TARGET_VIDEOS), we get videos/beauty/videos/...
        // That seems fine.
    }

    console.log('Cleaning up...')
    // fs.rmSync(SOURCE_DIR, { recursive: true, force: true })

    console.log('Git operations...')
    try {
        execSync('git add .', { stdio: 'inherit' })
        execSync('git commit -m "Add assets from Probase buckets"', { stdio: 'inherit' })
        execSync('git push origin main', { stdio: 'inherit' })
    } catch (e) {
        console.error('Git execution failed:', e.message)
    }
}

run()
