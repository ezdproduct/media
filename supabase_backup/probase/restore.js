/**
 * Supabase Data Restore Script - Probase
 * Sử dụng script này để restore dữ liệu vào project Supabase mới
 * 
 * Cách sử dụng:
 * 1. npm install @supabase/supabase-js
 * 2. Cập nhật SUPABASE_URL và SERVICE_ROLE_KEY
 * 3. node restore.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ⚠️ CẬP NHẬT THÔNG TIN PROJECT MỚI
const SUPABASE_URL = 'https://your-new-project.supabase.co';
const SERVICE_ROLE_KEY = 'your-service-role-key';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Danh sách bảng cần restore
const TABLES_TO_RESTORE = [
    'profiles',
    'beauty_models',
    'model_providers',
    'raw_models',
    'video_models',
    'assets_manager'
];

async function restoreTable(tableName) {
    const filePath = path.join(__dirname, 'data', `${tableName}.json`);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (!Array.isArray(data) || data.length === 0) {
        console.log(`⚠️  No data in ${tableName}`);
        return;
    }

    console.log(`📥 Restoring ${tableName} (${data.length} records)...`);

    // Batch insert để xử lý dữ liệu lớn
    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const { error } = await supabase
            .from(tableName)
            .upsert(batch);

        if (error) {
            console.error(`❌ Error restoring ${tableName} batch ${i}:`, error.message);
        }
    }

    console.log(`✅ Successfully restored ${tableName}`);
}

async function main() {
    console.log('🚀 Starting Supabase data restore (Probase)...\n');
    console.log(`📍 Target: ${SUPABASE_URL}\n`);

    for (const table of TABLES_TO_RESTORE) {
        await restoreTable(table);
    }

    console.log('\n✨ Restore completed!');
}

main().catch(console.error);
