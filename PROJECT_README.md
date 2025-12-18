# 📸 Photobooth Application

Ứng dụng Photobooth chuyên nghiệp được xây dựng bằng React + TypeScript, hỗ trợ chụp ảnh, chỉnh sửa, in ảnh và thanh toán tự động cho các máy kiosk/photobooth.

## 🎯 Tổng Quan

Đây là một ứng dụng photobooth đầy đủ chức năng, được thiết kế để chạy trên các thiết bị kiosk/màn hình cảm ứng. Ứng dụng hỗ trợ toàn bộ quy trình từ chụp ảnh, chỉnh sửa, thanh toán đến in ảnh, với giao diện thân thiện và dễ sử dụng.

## ✨ Tính Năng Chính

### 📷 **Chụp & Quét QR**
- Quét mã QR để lấy thông tin đơn hàng/sản phẩm
- Hỗ trợ nhiều thư viện QR scanner
- Tích hợp camera để chụp ảnh

### 🎨 **Chỉnh Sửa Ảnh**
- **Text Element**: Thêm văn bản với nhiều font chữ
  - Hơn 20+ font chữ tiếng Việt và Latin
  - Tùy chỉnh màu sắc, kích thước, góc xoay
  - Di chuyển, scale, rotate tự do
- **Sticker Element**: Thêm sticker/emoji
- **Background Editing**: 
  - Drag để di chuyển background
  - Zoom in/out background
  - Crop ảnh với react-image-crop
- **Layer Management**: Quản lý thứ tự lớp (z-index) các elements
- **Print Layout**: Nhiều template in (4x6, 2x6, custom)

### ⌨️ **Bàn Phím Ảo Tiếng Việt** ⭐
- Hỗ trợ **2 kiểu gõ**: Telex và VNI
- Tự động kích hoạt khi focus vào input
- Xử lý dấu thanh điệu thông minh
- Hiển thị preview text trước khi submit
- Responsive cho mọi kích thước màn hình
- Chi tiết: [VIETNAMESE_KEYBOARD_README.md](./VIETNAMESE_KEYBOARD_README.md)

### 💳 **Thanh Toán & Đơn Hàng**
- Nhập thông tin giao hàng (họ tên, địa chỉ, số điện thoại)
- Chọn tỉnh/thành phố, quận/huyện, phường/xã
- Nhập mã voucher giảm giá
- Tính toán phí ship tự động
- Tích hợp payment gateway

### 🖨️ **In Ảnh**
- Nhiều template in khác nhau
- Preview trước khi in
- Xử lý layout tự động
- Export high-quality images

### ⏱️ **Idle Detection**
- Tự động phát hiện người dùng không hoạt động
- Cảnh báo trước khi reset
- Tự động quay về trang chủ sau timeout
- Tránh lãng phí tài nguyên

## 🛠️ Tech Stack

### **Frontend Core**
- ⚛️ **React 19.2.0** - UI framework
- 📘 **TypeScript 5.9.3** - Type safety
- ⚡ **Vite 7.2.2** - Build tool & dev server
- 🎨 **Tailwind CSS 4.1.17** - Styling

### **State Management**
- 🐻 **Zustand 5.0.8** - Global state management
  - Element store (text, sticker, images)
  - UI store (modals, keyboard, layers)
  - Product store
  - Printed image store

### **Routing**
- 🚦 **React Router DOM 7.9.6** - Navigation

### **Libraries & Tools**
- ⌨️ **react-simple-keyboard 3.8.139** - Virtual keyboard
- 📸 **html2canvas 1.4.1** - Screenshot/export
- 🎨 **react-colorful 5.6.1** - Color picker
- ✂️ **react-image-crop 11.0.10** - Image cropping
- 📱 **QR Scanner** - Multiple QR libraries
- 🔔 **react-toastify 11.0.5** - Notifications

### **Development**
- 🔍 **ESLint** - Code linting
- 💅 **PostCSS** - CSS processing

## 📁 Cấu Trúc Dự Án

```
my-app/
├── public/                      # Static assets
│   ├── fonts/                   # 20+ font families
│   ├── images/                  # Images, logos, stickers
│   └── videos/                  # Video assets
│
├── src/
│   ├── components/              # Reusable components
│   │   └── custom/
│   │       ├── virtual-keyboard/   # Vietnamese keyboard
│   │       ├── AutoSizeTextField   # Auto-sizing text input
│   │       └── ...
│   │
│   ├── configs/                 # Configuration files
│   │   ├── brands/              # Brand configs
│   │   ├── fonts/               # Font configurations
│   │   ├── print-layout/        # Print layout templates
│   │   └── print-template/      # Print templates
│   │
│   ├── contexts/                # React contexts
│   │   └── global-context.ts
│   │
│   ├── hooks/                   # Custom hooks
│   │   ├── use-vietnamese-keyboard.ts  # Vietnamese input logic
│   │   ├── use-idle-detector.ts        # Idle detection
│   │   ├── use-image-crop.ts           # Image cropping
│   │   ├── use-drag-edit-background.ts # Drag background
│   │   └── ...
│   │
│   ├── pages/                   # Page components
│   │   ├── intro/               # Landing page
│   │   ├── scan-qr/             # QR scanner page
│   │   ├── edit/                # Photo editor
│   │   │   ├── customize/       # Customization tools
│   │   │   ├── elements/        # Element editors
│   │   │   │   ├── text-element/
│   │   │   │   └── sticker-element/
│   │   │   └── live-preview/    # Preview area
│   │   ├── payment/             # Payment & checkout
│   │   └── maintain/            # Maintenance page
│   │
│   ├── providers/               # Provider components
│   │   ├── GlobalKeyboardProvider.tsx  # Auto keyboard
│   │   └── RootProvider.tsx
│   │
│   ├── services/                # API services
│   │   ├── address.service.ts   # Address API
│   │   ├── order.service.ts     # Order API
│   │   ├── payment.service.ts   # Payment API
│   │   ├── product.service.ts   # Product API
│   │   └── voucher.service.ts   # Voucher API
│   │
│   ├── stores/                  # Zustand stores
│   │   ├── element/             # Element stores
│   │   ├── keyboard/            # Keyboard state
│   │   ├── printed-image/       # Printed images
│   │   ├── product/             # Product data
│   │   └── ui/                  # UI states
│   │
│   ├── styles/                  # Global styles
│   │   ├── index.css            # Main styles
│   │   ├── fonts.css            # Font definitions
│   │   ├── animations.css       # Animations
│   │   ├── virtual-keyboard.css # Keyboard styles
│   │   └── ...
│   │
│   ├── utils/                   # Utility functions
│   │   ├── helpers.ts           # Helper functions
│   │   ├── events.ts            # Event emitter
│   │   ├── types/               # TypeScript types
│   │   └── ...
│   │
│   ├── App.tsx                  # Main app component
│   └── main.tsx                 # Entry point
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md                    # This file
```

## 🚀 Cài Đặt & Chạy

### **Prerequisites**
- Node.js >= 18.x
- npm hoặc yarn

### **Installation**

```bash
# Clone repository
git clone <repository-url>
cd my-app

# Install dependencies
npm install
```

### **Development**

```bash
# Start dev server
npm run dev

# Hoặc sử dụng script tùy chỉnh
./dev.cmd

# Dev server sẽ chạy tại http://localhost:5173
```

### **Build**

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### **Linting**

```bash
# Run ESLint
npm run lint

# Hoặc sử dụng script tùy chỉnh
./check-ts.cmd
```

## 🎮 Sử Dụng

### **Query Parameters**
Ứng dụng hỗ trợ query parameters để chuyển đổi giữa các brands:

```
# Photoism brand
http://localhost:5173/?q=ptm

# FUN brand (default)
http://localhost:5173/
```

### **Routes**

| Route | Mô tả |
|-------|-------|
| `/` | Trang giới thiệu/landing |
| `/qr` | Quét mã QR |
| `/edit` | Editor chỉnh sửa ảnh |
| `/payment` | Trang thanh toán |

## 💡 Tính Năng Đặc Biệt

### **1. Bàn Phím Ảo Tiếng Việt**

Chỉ cần thêm class vào input/textarea:

```tsx
<input 
  className="NAME-virltual-keyboard-textfield"
  type="text"
  placeholder="Nhập văn bản..."
/>
```

Bàn phím sẽ tự động hiện khi focus! Hỗ trợ:
- ✅ Telex: `viets` → `việt`
- ✅ VNI: `vie65t` → `việt`
- ✅ Tự động tìm nguyên âm đặt dấu
- ✅ Chữ hoa/thường
- ✅ Caret position tracking

Chi tiết: [VIETNAMESE_KEYBOARD_README.md](./VIETNAMESE_KEYBOARD_README.md)

### **2. Idle Detection**

```tsx
import { useIdleDetector } from '@/hooks/use-idle-detector'

const { showWarning, warningCountdown, confirmActive } = useIdleDetector({
  idleTimeout: 36000,      // 36s không hoạt động
  warningTimeout: 10000,   // 10s cảnh báo
  onIdle: () => {
    // Quay về trang chủ
    navigate('/')
  }
})
```

### **3. Event System**

Sử dụng event emitter để giao tiếp giữa components:

```tsx
import { EInternalEvents, eventEmitter } from '@/utils/events'

// Emit event
eventEmitter.emit(EInternalEvents.PICK_ELEMENT, elementId, 'text')

// Listen event
eventEmitter.on(EInternalEvents.PICK_ELEMENT, handlePickElement)
eventEmitter.off(EInternalEvents.PICK_ELEMENT, handlePickElement)
```

## 🎨 Customization

### **Thêm Font Mới**

1. Thêm font files vào `public/fonts/YourFont/`
2. Cập nhật `src/configs/fonts/font-list.ts`
3. Thêm `@font-face` trong `src/styles/fonts.css`

### **Thêm Sticker**

1. Thêm sticker images vào `public/images/stickers/`
2. Import trong component cần dùng

### **Thêm Print Template**

1. Tạo template trong `src/configs/print-template/`
2. Define layout trong `src/configs/print-layout/`

## 🐛 Debugging

### **Common Issues**

**Bàn phím ảo không hiện:**
- Kiểm tra class `NAME-virltual-keyboard-textfield` đã được thêm chưa
- Kiểm tra `GlobalKeyboardProvider` đã được mount chưa
- Kiểm tra không phải mobile (bàn phím ảo tự ẩn trên mobile)

**Element không di chuyển được:**
- Kiểm tra element đã được select chưa
- Kiểm tra z-index không bị chồng lấp

**API không hoạt động:**
- Kiểm tra service files trong `src/services/`
- Kiểm tra network tab trong DevTools

## 📊 Performance

- ⚡ Fast Refresh với Vite
- 🎯 Code splitting tự động
- 📦 Tree shaking
- 🖼️ Image optimization
- 💾 LocalStorage caching

## 🔒 Security

- 🛡️ TypeScript type safety
- 🔐 Input validation
- 🚫 XSS protection
- 🔒 CORS configuration

## 📝 Scripts

| Command | Mô tả |
|---------|-------|
| `npm run dev` | Start dev server |
| `npm run build` | Build production |
| `npm run preview` | Preview build |
| `npm run lint` | Run ESLint |
| `./dev.cmd` | Dev script (Windows) |
| `./check-ts.cmd` | TypeScript check (Windows) |

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Team

- **VCN Team** - Development & Maintenance

## 📞 Support

For support, email: [your-email@example.com]

---

**Made with ❤️ by VCN Team**
