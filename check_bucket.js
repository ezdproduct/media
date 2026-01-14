const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bxikxsrqphseupmgswdg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aWt4c3JxcGhzZXVwbWdzd2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NjQ3MTAsImV4cCI6MjA4MjU0MDcxMH0.39zNuNptOtn_CO8g9OiJ4MrAHSf6hlRRvOVyUlgb87s'
const supabase = createClient(supabaseUrl, supabaseKey)

async function listFiles(bucketName) {
    console.log(`Checking bucket: ${bucketName}`)
    const { data, error } = await supabase.storage.from(bucketName).list()
    if (error) {
        console.log(`Error accessing ${bucketName}:`, error.message)
    } else {
        console.log(`Files in ${bucketName}:`, data.length)
        if (data.length > 0) console.log(JSON.stringify(data.slice(0, 5), null, 2))
    }
}

async function check() {
    await listFiles('probase')
    await listFiles('media')
    await listFiles('images')
    await listFiles('worker') // sometimes named after repo
    await listFiles('public') // common public bucket
}

check()
