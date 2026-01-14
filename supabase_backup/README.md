# Supabase Backup - 2026-01-14

Backup đầy đủ dữ liệu từ 2 Supabase projects để migrate sang tài khoản mới.

## 📁 Cấu trúc thư mục

```
supabase_backup/
├── cap/                          # Project: cap (yvsbrspvwovaocbbkmqg)
│   ├── migrations.json           # Danh sách 26 migrations
│   ├── edge_functions/           # Edge Functions
│   │   └── sync-wp-users/
│   │       └── index.ts
│   └── data/                     # Dữ liệu các bảng
│       ├── ld_course_pages.json
│       ├── site_settings.json
│       ├── user_wp.json
│       ├── homepage_clients.json
│       ├── homepage_hero.json
│       ├── homepage_stats.json
│       ├── homepage_features.json
│       ├── ld_team.json
│       ├── ld_vision_mission.json
│       ├── ld_resources.json
│       ├── ld_homepage_insights.json
│       ├── ld_homepage_footer.json
│       └── services.json
│
└── probase/                      # Project: probase (bxikxsrqphseupmgswdg)
    ├── migrations.json           # Danh sách 60 migrations
    ├── edge_functions/           # Edge Functions
    │   ├── balance/
    │   │   └── index.ts
    │   ├── generate/
    │   │   └── index.ts
    │   ├── beauty-update/
    │   │   └── index.ts
    │   └── beauty-get/
    │       └── index.ts
    └── data/                     # Dữ liệu các bảng
        ├── profiles.json
        ├── beauty_models_sample.json
        └── ...
```

## 🔧 Hướng dẫn Restore

### Bước 1: Tạo Project mới trên Supabase

1. Truy cập [Supabase Dashboard](https://supabase.com/dashboard)
2. Tạo project mới với các thông tin:
   - Project name: `cap` hoặc `probase`
   - Database Password: (nhớ lưu lại)
   - Region: `ap-southeast-1` (Singapore) cho cap, `ap-south-1` (Mumbai) cho probase

### Bước 2: Import Schema (Migrations)

Sử dụng Supabase CLI hoặc SQL Editor để chạy các migrations theo thứ tự:

```bash
# Cài đặt Supabase CLI
npm install -g supabase

# Link project
supabase link --project-ref <new-project-id>

# Chạy migrations
supabase db push
```

Hoặc copy nội dung từ SQL migrations và chạy trong SQL Editor của Supabase Dashboard.

### Bước 3: Import Data

Sử dụng SQL Editor hoặc API để import dữ liệu từ các file JSON:

```javascript
// Ví dụ sử dụng supabase-js
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-service-role-key'
)

// Import data
const data = require('./data/ld_course_pages.json')
const { error } = await supabase
  .from('ld_course_pages')
  .insert(data)
```

### Bước 4: Deploy Edge Functions

```bash
cd edge_functions/sync-wp-users
supabase functions deploy sync-wp-users
```

### Bước 5: Cấu hình

1. Copy environment variables từ project cũ sang project mới
2. Cập nhật các API keys và secrets
3. Cập nhật URLs trong các file cấu hình

## 📊 Thống kê dữ liệu

### Project CAP
| Bảng | Số records |
|------|------------|
| ld_course_pages | 3 |
| user_wp | 4 |
| homepage_clients | 5 |
| homepage_hero | 1 |
| homepage_stats | 3 |
| homepage_features | 4 |
| ld_team | 3 |
| ld_vision_mission | 1 |
| ld_resources | 4 |
| services | 7 |
| site_settings | 2 |

### Project PROBASE
| Bảng | Số records |
|------|------------|
| profiles | 2 |
| beauty_models | 110 |
| model_providers | ~750 |
| raw_models | ~200 |
| video_models | ~50 |
| assets_manager | ~150 |
| auth.users | 71 |

## ⚠️ Lưu ý quan trọng

1. **Auth Users**: Users trong `auth.users` không thể migrate trực tiếp. Người dùng cần đăng ký lại hoặc sử dụng Admin API để tạo users mới.

2. **Storage**: Files trong Storage cần được migrate riêng. URLs trong các file JSON trỏ đến storage của project cũ cần được cập nhật.

3. **RLS Policies**: Cần tạo lại các Row Level Security policies.

4. **Environment Variables**: Đừng quên cập nhật:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

5. **Edge Functions Secrets**: Cấu hình lại secrets cho Edge Functions.

## 📅 Backup Info

- **Ngày backup**: 2026-01-14
- **Backup bởi**: Antigravity AI Assistant
- **Version**: 1.0
