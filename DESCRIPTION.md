# Nimad Kirana — Complete Project Documentation

**Freshness at Your Doorstep.**

Nimad Kirana is a full grocery e-commerce platform built for Zelvix Technologies, made up of three
applications that share one backend:

| App | Tech | Folder |
|---|---|---|
| Backend API | NestJS 11 + Prisma 7 + PostgreSQL | `backend/` |
| Customer Mobile App | React Native 0.86 | `apps/NimadKirana/` |
| Website (Customer + Admin + Super Admin) | React 19 + Vite + MUI | `apps/web-app/` |

---

## 1. How the whole system fits together

```
                         ┌─────────────────────┐
                         │   PostgreSQL (DB)    │
                         └──────────▲───────────┘
                                    │ Prisma ORM
                         ┌──────────┴───────────┐
                         │   Backend API (NestJS) │  ← one API, port 3000
                         │   /api/v1/...          │
                         └──┬─────────────┬──────┘
              REST + JWT    │             │   REST + JWT
        ┌────────────────────┘             └────────────────────┐
┌───────▼────────┐                                    ┌──────────▼─────────┐
│  Mobile App      │                                    │   Website            │
│  (React Native)  │                                    │   (React + Vite)     │
│  Customers only  │                                    │  /            → storefront (customers) │
└──────────────────┘                                    │  /admin/*     → Admin & Super Admin     │
                                                          └──────────────────────┘
```

Everything — mobile app, customer website, and the admin back-office — talks to the **same** NestJS
API. There's only one backend to deploy and one database.

---

## 2. Tech stack

**Backend**
- NestJS 11 (TypeScript), REST API under `/api/v1`
- PostgreSQL via Prisma ORM (35 models — see `backend/prisma/schema.prisma`)
- JWT access + refresh tokens, role-based guards (`CUSTOMER`, `ADMIN`, `SUPER_ADMIN`)
- Swagger docs auto-generated at `/docs`
- Razorpay (payments), MSG91 (SMS/OTP), AWS S3 (file storage), Nodemailer (email) — all optional,
  wired via env vars

**Mobile app**
- React Native 0.86, React Navigation (stack + bottom tabs)
- Zustand for state (auth, cart, wishlist) with AsyncStorage persistence
- Axios for API calls

**Website**
- React 19 + Vite, MUI (Material UI) component library + theme
- React Router for navigation
- Zustand for state (persisted to localStorage)

---

## 3. Functionality — how each part works

### 3.1 Authentication (all three login methods)

The customer app supports **three ways to log in**, all backed by the same `User` record:

1. **Mobile + OTP** (passwordless) — `POST /auth/otp/send` → `POST /auth/otp/login`
   First-time numbers are **auto-registered** on successful OTP verify — no separate signup needed.
2. **Email or Mobile or User ID + Password** — `POST /auth/login` with a single `identifier` field
   that matches against the account's mobile, email, or **User ID**.
   - The **User ID** is auto-generated at signup (e.g. `NK1A2B3C4D`) — it's the same code shown as
     the customer's referral code, reused so no schema change was needed for a third login method.
   - This path requires the account to have a password — set during **Registration** below.
3. **Registration (name + mobile + email + password)** — `POST /auth/register` → OTP sent →
   `POST /auth/register/verify-otp` activates the account.

**Forgot / Reset Password** — works with any of the three identifiers:
`POST /auth/forgot-password { identifier }` → OTP sent to the account's registered mobile →
`POST /auth/reset-password { identifier, otpCode, newPassword }`.

**Admin / Super Admin** login is separate and always email + password:
`POST /auth/login/admin`. Admins never use OTP.

### 3.2 Customer mobile app & website (storefront)

Both apps offer the same customer journey, wired to the same endpoints:

- **Splash → Onboarding → Login/Register** (first launch)
- **Home** — banners, categories, popular products (`GET /categories`, `GET /banners`, `GET /products`)
- **Product listing / detail** — variants (e.g. "500g", "1kg"), pricing, stock (`GET /products/:id`)
- **Cart** — add/update/remove items; cart lives server-side per customer (`/cart/items`)
- **Wishlist** — save products for later (`/wishlist`)
- **Checkout** — pick/add a delivery address (`/customers/me/addresses`), choose payment method
  (Cash / UPI / Card), place order (`POST /orders` — built from the server-side cart)
- **Orders** — order history + live status timeline (Pending → Confirmed → Processing → Packed →
  Out for Delivery → Delivered)
- **Profile** — account info, addresses, wallet, User ID, log out

### 3.3 Admin panel (website, `/admin/*`)

Sidebar-based back office, separate login/session from the customer storefront:

- **Dashboard** — today's/monthly sales, order counts, low-stock alerts, recent orders
- **Products** — create/edit products, manage **variants** (add/edit price/delete) and **images**
  (upload straight from the browser, set a primary image)
- **Categories** — create/delete
- **Orders** — see every order, change status with one click (triggers the timeline customers see)
- **Customers** — view registered shoppers
- **Offers & Coupons** — create percentage/flat discount codes with validity windows

### 3.4 Super Admin extras (same panel, extra sidebar section)

Only visible when the logged-in admin's role is `SUPER_ADMIN`:

- **Admin Users** — create/remove Admin or Super Admin accounts, assign their role
- **Roles & Permissions** — a permission matrix (grouped by module) per role; click a permission
  chip to grant/revoke it, then save
- **Reports** — sales summary (revenue, orders, average order value, cancellations), top customers
- **Audit Logs** — a running log of who did what (every create/update/delete across the panel)

### 3.5 What ties it all together in the database

Key relationships (see `backend/prisma/schema.prisma` for the full picture):

- `User` → has one `role` (`CUSTOMER` / `ADMIN` / `SUPER_ADMIN`), and either a `Customer` or
  `Admin` profile attached to it
- `Product` → belongs to a `Category`/`SubCategory`/`Brand`, has many `ProductVariant` (the actual
  sellable SKUs with price/stock) and `ProductImage`
- `Cart` → belongs to a `Customer`, has many `CartItem` (each pointing at a `ProductVariant`)
- `Order` → created from a `Cart` at checkout, has many `OrderItem` (price-frozen at order time)
  and an `OrderStatusHistory` trail
- `Role` ↔ `Permission` → many-to-many via `RolePermission`, checked on every guarded endpoint

---

## 4. Running the project locally

### 4.1 Prerequisites

- Node.js ≥ 22
- PostgreSQL (local install, or use the provided `docker/docker-compose.yml`)
- For the mobile app: a working React Native environment (Android Studio / Xcode) —
  see https://reactnative.dev/docs/set-up-your-environment

### 4.2 Backend

```bash
# 1. Start Postgres (and Redis, reserved for future use) via Docker
cd docker
docker compose up -d

# 2. Configure environment
cd ../backend
cp .env.example .env        # or just edit the existing .env — set DATABASE_URL, JWT secrets

# 3. Install dependencies
npm install

# 4. Generate Prisma client + run migrations
npx prisma generate
npx prisma migrate dev --name init

# 5. Seed initial data (roles, permissions, a super admin, product units, etc.)
npx prisma db seed

# 6. Start the API in watch mode
npm run start:dev
```

The API runs at `http://localhost:3000/api/v1`, Swagger docs at `http://localhost:3000/docs`.

### 4.3 Website (customer + admin)

```bash
cd apps/web-app
npm install
npm run dev
```

Opens at `http://localhost:5173`. Storefront at `/`, admin panel at `/admin` (login at `/admin/login`).
By default it calls the API at `http://localhost:3000/api/v1` — override with a `.env` file:
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 4.4 Mobile app

```bash
cd apps/NimadKirana
npm install

# iOS only, one-time:
cd ios && pod install && cd ..

# Run on Android emulator/device
npm run android

# Run on iOS simulator (Mac only)
npm run ios
```

The mobile app points at `http://10.0.2.2:3000/api/v1` in dev (Android emulator's alias for your
machine's `localhost`) — see `src/config/env.js`. For a physical device, change this to your
computer's LAN IP (e.g. `http://192.168.1.5:3000/api/v1`).

---

## 5. Deploying the backend to an EC2 instance

This uses **PM2** to run the Node process (matches how Zelvix already runs its other Node
services) and **Docker Compose** just for Postgres, so you don't have to hand-install a database.
Nginx sits in front as a reverse proxy with a free SSL cert from Let's Encrypt.

### 5.1 One-time server setup

SSH into your EC2 instance (Ubuntu 22.04/24.04 recommended), then:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Docker + Docker Compose (for Postgres/Redis)
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker   # or log out and back in

# Install Nginx
sudo apt install -y nginx

# Install git
sudo apt install -y git
```

### 5.2 Get the code onto the server

```bash
cd ~
git clone <your-repo-url> nimad-kirana
cd nimad-kirana
```
(If you're not using git yet, `scp -r` the project folder to the instance instead.)

### 5.3 Start the database

```bash
cd docker
POSTGRES_PASSWORD=<set-a-strong-password> docker compose up -d
docker compose ps        # confirm postgres is healthy
```

### 5.4 Configure and build the backend

```bash
cd ../backend
cp .env.example .env
nano .env
```
Set at minimum:
```
DATABASE_URL="postgresql://postgres:<same-password-as-above>@localhost:5432/nimad_kirana"
NODE_ENV=production
PORT=3000
JWT_ACCESS_SECRET="<generate a long random string>"
JWT_REFRESH_SECRET="<a different long random string>"
```
Generate strong secrets with: `openssl rand -base64 48`

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed        # first deploy only — creates roles/permissions/super admin
npm run build
```

### 5.5 Start the API with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup            # follow the printed command to enable PM2 on server reboot
```
Useful commands:
```bash
pm2 status                 # is it running?
pm2 logs nimad-api         # tail logs
pm2 restart nimad-api      # restart after a manual change
```

### 5.6 Put Nginx in front (reverse proxy + SSL)

```bash
sudo nano /etc/nginx/sites-available/nimad-api
```
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/nimad-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Free SSL certificate
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

Your API is now live at `https://api.yourdomain.com/api/v1`, with Swagger docs at
`https://api.yourdomain.com/docs`. Point the website's `VITE_API_BASE_URL` and the mobile app's
`API_BASE_URL` at this URL for production builds.

### 5.7 Redeploying after code changes

Every time you push new backend code:
```bash
cd ~/nimad-kirana
bash scripts/deploy/ec2-deploy.sh
```
This pulls latest code, reinstalls deps, re-generates Prisma, runs new migrations, rebuilds, and
reloads PM2 with zero manual steps.

### 5.8 EC2 security group checklist

Open these inbound ports on the instance's security group:
- `22` (SSH) — your IP only
- `80` / `443` (HTTP/HTTPS) — public, for Nginx
- Do **not** open `3000` or `5432` publicly — Nginx proxies to 3000 internally, and Postgres
  should only be reachable from the instance itself (Docker Compose already only binds it to
  `localhost` by default in this setup unless you change it).

---

## 6. Environment variables reference (`backend/.env`)

| Variable | Purpose | Required |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | ✅ |
| `PORT`, `API_PREFIX` | API port and route prefix | defaults provided |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Token signing — **change in production** | ✅ |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Token lifetimes | defaults provided |
| `OTP_LENGTH`, `OTP_EXPIRES_IN_MINUTES`, `OTP_RESEND_SECONDS`, `OTP_MAX_ATTEMPTS` | OTP behaviour | defaults provided |
| `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`, `MSG91_SENDER_ID` | SMS/OTP delivery — without this, OTPs are logged not sent | for real SMS |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Online payments | for UPI/Card |
| `SMTP_*` | Transactional email | optional |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_S3_PUBLIC_BASE_URL` | Product image uploads | for image upload |
| `BCRYPT_SALT_ROUNDS` | Password hashing cost | default provided |

Without MSG91 configured, the backend still works end-to-end in development — OTPs are written to
the server logs instead of being texted, so you can test the full flow without an SMS bill.

---

## 7. Where things live (quick reference)

```
smart-grocery/
├── backend/                    NestJS API — the single source of truth
│   ├── prisma/schema.prisma    Database schema (35 models)
│   ├── src/modules/            One folder per feature (auth, products, orders, ...)
│   └── ecosystem.config.js     PM2 config for deployment
├── apps/
│   ├── NimadKirana/            React Native customer app
│   │   └── src/screens/        auth/ common/ customer/
│   └── web-app/                React website — storefront + admin panel
│       └── src/pages/          auth/ customer/ admin/
├── docker/
│   └── docker-compose.yml      Postgres + Redis for local/EC2
└── scripts/deploy/
    └── ec2-deploy.sh           One-command redeploy script
```

---

## 8. Known gaps / next steps

- Redis is provisioned (`docker-compose.yml`, and `ioredis`/`bull`/`bullmq` are installed) but not
  yet wired into any backend module — reserved for future caching/queues (e.g. notification jobs).
- Product images upload through the backend's convenience endpoint (`POST /upload/image`); the
  presigned-direct-to-S3 path (`POST /upload/presign`) exists too but isn't used by the admin UI yet.
- The mobile app's newest auth screens (Register, Forgot/Reset Password) haven't been run on a real
  device/emulator yet — please test with `npm run android` / `npm run ios` before shipping.
- `npx prisma generate` and a full backend build haven't been run against a live Postgres instance
  in this environment — do that first thing after cloning, as shown in section 4.2.
