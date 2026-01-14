const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = 'https://bxikxsrqphseupmgswdg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aWt4c3JxcGhzZXVwbWdzd2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NjQ3MTAsImV4cCI6MjA4MjU0MDcxMH0.39zNuNptOtn_CO8g9OiJ4MrAHSf6hlRRvOVyUlgb87s'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testList(bucket) {
    const { data, error } = await supabase.storage.from(bucket).list('', { limit: 100 })
    console.log(`--- Root of ${bucket} ---`)
    if (error) console.error(error)
    else console.log(JSON.stringify(data, null, 2))
}

async function run() {
    await testList('data-models')
    await testList('video-clone')
}

run()
