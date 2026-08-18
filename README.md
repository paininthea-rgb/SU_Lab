# SU Lab — 3D Sketch Environment

> 🇬🇧 English | 🇻🇳 [Tiếng Việt bên dưới](#tiếng-việt)

---

## 🇬🇧 English

### Overview

**SU Lab** is a browser-based 3D sketch environment built with **Next.js**, **Three.js**, and **Firebase**.  
Sign in with Google, draw on a 3D canvas, and use intuitive CAD-like tools — all in your browser.

---

### Features

| Category | Details |
|---|---|
| 🗂 **3D Canvas** | X axis (Red), Y axis (Green), Z axis (Blue) + ground grid |
| ✏️ **Drawing Tools** | Select, Line, Circle, Rectangle, Arc |
| 🛠 **Support Tools** | Move, Group, Push/Pull, Offset, Mirror |
| 🖱 **Mouse Controls** | Left-click = select/draw · Middle-drag = orbit · Shift+Middle-drag = pan · Scroll = zoom |
| 🔐 **Authentication** | Google Sign-In via Firebase Auth, protected `/sketch` route |
| 🌐 **Bilingual UI** | English / Vietnamese toggle (🇬🇧 / 🇻🇳) |

---

### Requirements

- **Node.js** ≥ 18
- **npm** ≥ 9
- A [Firebase](https://console.firebase.google.com/) project with:
  - **Authentication** → Google provider enabled
  - **Firestore Database** created (production or test mode)

---

### Installation & Setup

**1. Clone the repository**

```bash
git clone https://github.com/paininthea-rgb/SU_Lab.git
cd SU_Lab
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure Firebase**

Copy the example environment file and fill in your Firebase project credentials:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and set each value from your Firebase project settings  
(*Firebase Console → Project Settings → Your apps → Web app → SDK setup*):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

**4. Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (hot-reload) |
| `npm run build` | Build for production |
| `npm start` | Start production server (after build) |
| `npm run lint` | Run ESLint checks |

---

### Usage Guide

#### Signing In
1. Open the app at `http://localhost:3000`.
2. Click **"Login with Google"** and complete the OAuth flow.
3. You are redirected to the `/sketch` page.

#### Drawing Tools (left sidebar)
| Icon | Tool | How to use |
|---|---|---|
| ↖ | **Select** | Left-click an object to select it; drag to box-select |
| ╱ | **Line** | Click to set start point → click to set end point |
| ○ | **Circle** | Click center → click to set radius |
| □ | **Rectangle** | Click one corner → click the opposite corner |
| ⌒ | **Arc** | Click start → click end → click a third point on the arc |
| ✥ | **Move** | Select an object, then drag it to a new position |

#### Mouse Controls
| Action | Control |
|---|---|
| Orbit (rotate view 360°) | Middle-mouse button drag |
| Pan (translate view) | Shift + Middle-mouse button drag |
| Zoom in / out | Scroll wheel |
| Select / Draw | Left-click |
| Context menu *(future)* | Right-click |

#### Language Toggle
Click the flag icon (🇻🇳 / 🇬🇧) in the top-right corner to switch between Vietnamese and English.

---

### Maintenance

#### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all packages within semver ranges
npm update

# Upgrade to latest major versions (use with caution)
npx npm-check-updates -u && npm install
```

#### Adding New Firebase Features

- **Storage**: `npm install firebase` is already included; import `getStorage` from `firebase/storage`.
- **Hosting**: Install Firebase CLI → `firebase init hosting` → `firebase deploy`.

#### Environment Variables

- **Never commit `.env.local`** — it is already in `.gitignore`.
- Use `.env.local.example` as a template for onboarding new developers.
- For production deployment (e.g., Vercel), add the same variables in the hosting platform's environment settings.

#### Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add all `NEXT_PUBLIC_FIREBASE_*` variables in the Vercel project dashboard under **Settings → Environment Variables**.

---

### Project Structure

```
SU_Lab/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (providers)
│   │   ├── page.tsx            # Login / landing page
│   │   ├── globals.css         # Global styles (Tailwind)
│   │   └── sketch/
│   │       └── page.tsx        # Protected 3D sketch page
│   ├── components/
│   │   └── SketchCanvas.tsx    # Three.js canvas component
│   ├── context/
│   │   ├── AuthContext.tsx     # Firebase auth state
│   │   └── LangContext.tsx     # EN/VN language state
│   └── lib/
│       ├── firebase.ts         # Firebase initialization
│       └── i18n.ts             # Translation strings
├── .env.local.example          # Environment variable template
├── next.config.ts
├── tailwind.config (via PostCSS)
└── package.json
```

---

---

## 🇻🇳 Tiếng Việt

### Tổng Quan

**SU Lab** là môi trường phác thảo 3D chạy trên trình duyệt, xây dựng bằng **Next.js**, **Three.js** và **Firebase**.  
Đăng nhập bằng Google, vẽ trên khung 3D và sử dụng các công cụ CAD trực quan — hoàn toàn trong trình duyệt.

---

### Tính Năng

| Nhóm | Chi tiết |
|---|---|
| 🗂 **Khung 3D** | Trục X (Đỏ), Trục Y (Xanh Lá), Trục Z (Xanh Dương) + lưới nền |
| ✏️ **Công cụ vẽ** | Chọn, Đường thẳng, Đường tròn, Hình chữ nhật, Cung tròn |
| 🛠 **Công cụ hỗ trợ** | Di chuyển, Nhóm, Đẩy/Kéo, Offset, Gương |
| 🖱 **Chuột** | Chuột trái = chọn/vẽ · Kéo giữa = xoay · Shift+Giữa = pan · Cuộn = zoom |
| 🔐 **Xác thực** | Đăng nhập Google qua Firebase Auth, bảo vệ trang `/sketch` |
| 🌐 **Song ngữ** | Chuyển đổi Anh / Việt (🇬🇧 / 🇻🇳) |

---

### Yêu Cầu Hệ Thống

- **Node.js** ≥ 18
- **npm** ≥ 9
- Dự án [Firebase](https://console.firebase.google.com/) với:
  - **Authentication** → Bật nhà cung cấp Google
  - **Firestore Database** đã tạo (chế độ production hoặc test)

---

### Cài Đặt & Cấu Hình

**1. Clone dự án**

```bash
git clone https://github.com/paininthea-rgb/SU_Lab.git
cd SU_Lab
```

**2. Cài đặt thư viện**

```bash
npm install
```

**3. Cấu hình Firebase**

Sao chép file biến môi trường mẫu và điền thông tin Firebase:

```bash
cp .env.local.example .env.local
```

Mở `.env.local` và điền từng giá trị từ cài đặt dự án Firebase  
(*Firebase Console → Cài đặt dự án → Ứng dụng của bạn → Web app → Cấu hình SDK*):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ten-du-an.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ten-du-an
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ten-du-an.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

**4. Khởi động máy chủ phát triển**

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

---

### Các Lệnh Có Sẵn

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Khởi động máy chủ phát triển (tự động cập nhật) |
| `npm run build` | Build cho môi trường production |
| `npm start` | Khởi động máy chủ production (sau khi build) |
| `npm run lint` | Chạy kiểm tra ESLint |

---

### Hướng Dẫn Sử Dụng

#### Đăng Nhập
1. Mở ứng dụng tại `http://localhost:3000`.
2. Nhấn **"Đăng nhập với Google"** và hoàn tất xác thực.
3. Bạn sẽ được chuyển đến trang `/sketch`.

#### Công Cụ Vẽ (thanh công cụ bên trái)
| Biểu tượng | Công cụ | Cách dùng |
|---|---|---|
| ↖ | **Chọn** | Nhấp chuột trái để chọn; kéo để chọn vùng |
| ╱ | **Đường thẳng** | Nhấp để đặt điểm đầu → nhấp để đặt điểm cuối |
| ○ | **Đường tròn** | Nhấp tâm → nhấp để đặt bán kính |
| □ | **Hình chữ nhật** | Nhấp một góc → nhấp góc đối diện |
| ⌒ | **Cung tròn** | Nhấp điểm đầu → điểm cuối → điểm thứ ba trên cung |
| ✥ | **Di chuyển** | Chọn đối tượng, sau đó kéo đến vị trí mới |

#### Điều Khiển Chuột
| Thao tác | Phím/Chuột |
|---|---|
| Xoay góc nhìn 360° | Kéo chuột giữa |
| Pan (tịnh tiến góc nhìn) | Shift + Kéo chuột giữa |
| Phóng to / Thu nhỏ | Cuộn con lăn chuột |
| Chọn / Vẽ | Nhấp chuột trái |
| Menu ngữ cảnh *(sẽ bổ sung)* | Nhấp chuột phải |

#### Chuyển Đổi Ngôn Ngữ
Nhấn biểu tượng cờ (🇻🇳 / 🇬🇧) ở góc trên bên phải để chuyển đổi giữa Tiếng Việt và Tiếng Anh.

---

### Bảo Trì

#### Cập Nhật Thư Viện

```bash
# Kiểm tra các gói lỗi thời
npm outdated

# Cập nhật tất cả trong phạm vi semver
npm update

# Nâng cấp lên phiên bản lớn mới nhất (cẩn thận khi dùng)
npx npm-check-updates -u && npm install
```

#### Thêm Tính Năng Firebase Mới

- **Storage**: `firebase` đã được cài đặt, chỉ cần import `getStorage` từ `firebase/storage`.
- **Hosting**: Cài Firebase CLI → `firebase init hosting` → `firebase deploy`.

#### Biến Môi Trường

- **Không bao giờ commit `.env.local`** — file này đã có trong `.gitignore`.
- Dùng `.env.local.example` làm mẫu khi giới thiệu thành viên mới.
- Khi triển khai production (ví dụ Vercel), thêm các biến tương tự trong phần cài đặt môi trường của nền tảng.

#### Triển Khai Lên Vercel

```bash
# Cài Vercel CLI
npm i -g vercel

# Triển khai
vercel --prod
```

Thêm tất cả biến `NEXT_PUBLIC_FIREBASE_*` trong dashboard Vercel tại **Settings → Environment Variables**.

---

### Cấu Trúc Dự Án

```
SU_Lab/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Layout gốc (providers)
│   │   ├── page.tsx            # Trang đăng nhập / trang chủ
│   │   ├── globals.css         # CSS toàn cục (Tailwind)
│   │   └── sketch/
│   │       └── page.tsx        # Trang phác thảo 3D (bảo vệ)
│   ├── components/
│   │   └── SketchCanvas.tsx    # Component canvas Three.js
│   ├── context/
│   │   ├── AuthContext.tsx     # Trạng thái xác thực Firebase
│   │   └── LangContext.tsx     # Trạng thái ngôn ngữ Anh/Việt
│   └── lib/
│       ├── firebase.ts         # Khởi tạo Firebase
│       └── i18n.ts             # Chuỗi dịch thuật
├── .env.local.example          # Mẫu biến môi trường
├── next.config.ts
└── package.json
```

---

*Made with ❤️ · SU Lab © 2025*
