const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bxikxsrqphseupmgswdg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aWt4c3JxcGhzZXVwbWdzd2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NjQ3MTAsImV4cCI6MjA4MjU0MDcxMH0.39zNuNptOtn_CO8g9OiJ4MrAHSf6hlRRvOVyUlgb87s'
const supabase = createClient(supabaseUrl, supabaseKey)

async function listBuckets() {
  const { data, error } = await supabase.storage.listBuckets()
  if (error) {
    console.error('Error listing buckets:', error)
  } else {
    console.log('Buckets:', JSON.stringify(data, null, 2))
  }
}

listBuckets()
