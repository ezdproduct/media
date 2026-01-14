# 📷 EZD Media CDN

Repository lưu trữ hình ảnh sử dụng **jsDelivr CDN** để tải nhanh trên UI.

## 🚀 Cách sử dụng

### URL Format

Sử dụng jsDelivr để truy cập hình ảnh với tốc độ cao:

```
https://cdn.jsdelivr.net/gh/ezdproduct/media@main/{đường_dẫn_ảnh}
```

### Ví dụ

| Loại | URL |
|------|-----|
| Ảnh gốc | `https://cdn.jsdelivr.net/gh/ezdproduct/media@main/images/logo.png` |
| Ảnh với version | `https://cdn.jsdelivr.net/gh/ezdproduct/media@main/images/logo.png?v=1` |
| Thư mục icons | `https://cdn.jsdelivr.net/gh/ezdproduct/media@main/icons/icon-name.svg` |

### Với minify (cho SVG)

```
https://cdn.jsdelivr.net/gh/ezdproduct/media@main/icons/icon.min.svg
```

## 📁 Cấu trúc thư mục

```
media/
├── images/           # Ảnh chung (PNG, JPG, WebP)
│   ├── logos/        # Logo thương hiệu
│   ├── banners/      # Banner, hero images
│   ├── products/     # Ảnh sản phẩm
│   └── backgrounds/  # Ảnh nền
├── icons/            # Icons (SVG, PNG)
├── thumbnails/       # Ảnh thumbnail
├── avatars/          # Avatar người dùng
└── uploads/          # Ảnh upload từ user
```

## ⚡ Tính năng jsDelivr

- **Cache toàn cầu**: CDN có server ở Việt Nam và các nước châu Á
- **Miễn phí vĩnh viễn** cho open source
- **Tự động nén**: jsDelivr tự động nén và tối ưu file
- **HTTPS miễn phí**: Tất cả URL đều hỗ trợ HTTPS
- **Không giới hạn bandwidth**

## 📝 Quy tắc đặt tên file

1. Sử dụng chữ thường và dấu gạch ngang: `my-image-name.png`
2. Không dùng dấu tiếng Việt: `anh-san-pham.jpg` ✅ | `ảnh-sản-phẩm.jpg` ❌
3. Đuôi file được khuyến nghị:
   - Ảnh: `.webp` (ưu tiên), `.png`, `.jpg`
   - Icons: `.svg` (ưu tiên), `.png`
   - Animated: `.gif`, `.webp`

## 🔄 Cache Purge

Nếu cần xóa cache jsDelivr, truy cập:
```
https://purge.jsdelivr.net/gh/ezdproduct/media@main/{đường_dẫn_ảnh}
```

## 📤 Hướng dẫn upload ảnh

### Qua GitHub Web
1. Vào thư mục tương ứng
2. Click "Add file" > "Upload files"
3. Kéo thả ảnh và commit

### Qua Git CLI
```bash
# Clone repo
git clone git@github.com:ezdproduct/media.git
cd media

# Thêm ảnh
cp /path/to/image.png images/

# Commit và push
git add .
git commit -m "Add new image"
git push origin main
```

## 🛠️ Sử dụng trong code

### HTML
```html
<img src="https://cdn.jsdelivr.net/gh/ezdproduct/media@main/images/logo.png" alt="Logo">
```

### CSS
```css
.hero {
  background-image: url('https://cdn.jsdelivr.net/gh/ezdproduct/media@main/images/backgrounds/hero-bg.webp');
}
```

### JavaScript/React
```jsx
const logoUrl = 'https://cdn.jsdelivr.net/gh/ezdproduct/media@main/images/logo.png';

<Image src={logoUrl} alt="Logo" width={200} height={50} />
```

---

**Lưu ý**: File sẽ được cache từ 7 ngày đến 1 năm. Để cập nhật ngay, sử dụng purge URL hoặc thêm query string `?v=2`.
