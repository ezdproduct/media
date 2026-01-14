/**
 * Supabase Data Restore Script
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

// Danh sách bảng cần restore (theo thứ tự để tránh foreign key conflicts)
const TABLES_TO_RESTORE = [
    'site_settings',
    'homepage_hero',
    'homepage_stats',
    'homepage_features',
    'homepage_clients',
    'services',
    'ld_vision_mission',
    'ld_team',
    'ld_resources',
    'ld_homepage_footer',
    'ld_homepage_insights',
    'ld_course_pages',
    'user_wp'
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

    const { error } = await supabase
        .from(tableName)
        .upsert(data, { onConflict: 'id' });

    if (error) {
        console.error(`❌ Error restoring ${tableName}:`, error.message);
    } else {
        console.log(`✅ Successfully restored ${tableName}`);
    }
}

async function main() {
    console.log('🚀 Starting Supabase data restore...\n');
    console.log(`📍 Target: ${SUPABASE_URL}\n`);

    for (const table of TABLES_TO_RESTORE) {
        await restoreTable(table);
    }

    console.log('\n✨ Restore completed!');
}

main().catch(console.error);
