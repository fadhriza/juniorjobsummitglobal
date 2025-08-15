# Product Dashboard - Summit Global Teknologi

Technical Test untuk posisi Junior Frontend Developer menggunakan Next.js 14, TypeScript, Ant Design, dan Firebase Authentication.
Link untuk akses di web https://juniorjobsummitglobal.vercel.app/

## Features

### Core Features
- ✅ **Authentication**: Firebase Authentication dengan email/password
- ✅ **Product Management**: CRUD operations untuk products
- ✅ **Dashboard Statistik**: Visual statistics tanpa backend changes
- ✅ **Search & Pagination**: Real-time search dengan debounce 300ms
- ✅ **Expandable Table Rows**: Dropdown detail untuk setiap product
- ✅ **Responsive Design**: Mobile-friendly menggunakan Ant Design

### Technical Implementation
- ✅ **Next.js 14** dengan App Router
- ✅ **TypeScript** untuk type safety
- ✅ **Ant Design** untuk UI components
- ✅ **Axios** untuk HTTP client
- ✅ **API Architecture**: Frontend → Next.js API Routes → External Backend
- ✅ **Firebase Integration** untuk authentication

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
# atau
yarn install
```

### 2. Environment Variables

#### Backend URL Configuration
Ada 3 cara untuk mengatur backend URL:

**Option 1: Automatic Detection (Recommended)**
File `.env.local` sudah disediakan dengan `BACKEND_URL=` kosong. Aplikasi akan otomatis detect:
- `http://localhost:8001` (untuk backend lokal)
- `https://technical-test-be-production.up.railway.app` (untuk railway)

**Option 2: Manual Override**
Set `BACKEND_URL` di `.env.local`:
```bash
# Untuk backend lokal
BACKEND_URL=http://localhost:8001 {Silahkan Ganti Portnya}

# Atau untuk railway backend
BACKEND_URL=https://technical-test-be-production.up.railway.app
```

**Option 3: Development File**
Copy `.env.development` untuk development environment yang lebih spesifik.

#### Firebase Configuration
Firebase config sudah disediakan di environment files.

### 3. Backend Setup

#### Railway Backend (Production Ready)
```
URL: https://technical-test-be-production.up.railway.app
Status: Always available
Authentication: Firebase tokens
```

#### Local Backend (Development)
```
URL: http://localhost:8001
Requirements: Download dan jalankan backend secara lokal
Authentication: Firebase tokens
```

**Cara Menjalankan Backend Lokal:**
1. Download backend dari zip yang disediakan
2. Install dependencies backend
3. Jalankan dengan: `npm run dev` atau `yarn dev`
4. Backend akan berjalan di `http://localhost:8001`

### 4. Development
```bash
# Tanpa Firebase (basic development)
npm run dev

# Dengan Firebase (full features)
npm run dev:firebase
```

### 5. Production Build
```bash
npm run build
npm start
```

## API Architecture

### Flow Diagram
```
Frontend (Axios) → Next.js API Routes → External Backend → Response
```

### Endpoints
- `GET /api/products` - List products dengan pagination & search
- `GET /api/product?product_id=xxx` - Get single product
- `POST /api/product` - Create new product  
- `PUT /api/product` - Update existing product

### Backend Integration
**Railway Backend (Production)**: `https://technical-test-be-production.up.railway.app`  
**Local Backend (Development)**: `http://localhost:8001`

Backend URL otomatis terdeteksi berdasarkan environment:
- Development → Local backend (HTTP)
- Production → Railway backend (HTTPS)
- Manual override via `BACKEND_URL` environment variable

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── products/route.ts     # Products list API proxy
│   │   └── product/route.ts      # Single product CRUD API proxy
│   ├── login/page.tsx            # Login page
│   ├── products/page.tsx         # Main dashboard page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── contexts/
│   └── AuthContext.tsx           # Firebase auth context
├── lib/
│   ├── api.ts                    # API service layer
│   └── firebase.ts               # Firebase configuration
└── types/
    └── index.ts                  # TypeScript interfaces
```

## Key Features Detail

### 1. Dashboard Statistics
- **Total Products**: Menampilkan jumlah total products
- **Average Price**: Rata-rata harga products
- **Categories**: Jumlah kategori unik
- **Total Value**: Total value dari semua products

### 2. Product Table with Expandable Rows
- **Columns**: Title, Price, Category, Description (truncated), Actions
- **Expandable Details**: Product ID, Full Description, Image, Created/Updated dates
- **Sorting**: Price column dapat di-sort
- **Edit Button**: Quick edit access untuk setiap row

### 3. Real-time Search
- **Debounce**: 300ms delay untuk optimize API calls
- **Multi-field Search**: Mencari di title, description, dan category
- **Auto-reset Pagination**: Kembali ke page 1 saat search berubah

### 4. Modal Forms
- **Single Modal**: Untuk create dan edit operations
- **Form Validation**: Required fields dan input validation
- **Currency Formatting**: Price input dengan format currency

### 5. Authentication Flow
- **Login/Signup**: Email/password authentication
- **Protected Routes**: Auto redirect ke login jika tidak authenticated
- **Token Management**: Automatic token handling untuk API calls
- **Session Persistence**: Maintain user session dengan Firebase

## Authentication

### Login Credentials
Gunakan Firebase Authentication. Buat account baru atau gunakan existing account.

### Protected Routes
- `/products` - Requires authentication
- `/login` - Public route
- `/` - Redirects based on auth status

## Technical Highlights

### 1. API Proxy Pattern
```typescript
// Frontend call
const response = await axios.get('/api/products')

// API Route (Proxy)
export async function GET() {
  const response = await axios.get('https://external-api.com/api/web/v1/products')
  return NextResponse.json(response.data)
}
```

### 2. Debounced Search
```typescript
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}
```

### 3. Auth Token Integration
```typescript
const token = await getToken();
ApiService.setAuthToken(token);
```

## Performance Optimizations

- ✅ Debounced search queries
- ✅ Pagination untuk large datasets
- ✅ Image lazy loading
- ✅ Memoized statistics calculations
- ✅ Optimized re-renders dengan useCallback

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Dependencies

### Production
- `next`: 14.2.31
- `react`: ^18
- `antd`: ^5.12.8
- `axios`: ^1.6.2
- `firebase`: ^10.7.1

### Development
- `typescript`: ^5
- `tailwindcss`: ^4.0.6
- Various @types packages

---

## Developer Notes

Project ini dibuat sesuai dengan technical test requirements dari Summit Global Teknologi untuk posisi Junior Frontend Developer. Semua requirements telah diimplementasi dengan best practices dan modern web development standards.
