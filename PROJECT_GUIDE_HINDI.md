# Nimad Kirana — पूरी Project Guide (हिंदी में)

**Freshness at Your Doorstep.**

यह document पूरे project को समझने के लिए है — कैसे काम करता है, कौन क्या use करेगा, और role के हिसाब से कौन सा dashboard खुलता है।

---

## 1. Project में कितने हिस्से हैं

| हिस्सा | बनता किसमें है | किसके लिए |
|---|---|---|
| Backend API | NestJS + PostgreSQL | तीनों apps इसी से data लेते हैं |
| Mobile App | React Native | सिर्फ **Customers** के लिए |
| Website | React (एक ही website) | Customer + Admin + Super Admin — सबके लिए, पर अलग-अलग URL पर |

**ज़रूरी बात:** Backend एक ही है। तीनों apps (mobile, website customer side, website admin side) उसी एक backend से बात करते हैं। अलग-अलग backend नहीं है।

---

## 2. Role-Based Login — कौन लॉगिन करने पर कौन सा Dashboard खुलता है

Project में **3 roles** हैं — हर role का अपना अलग experience है:

### 🟢 Customer (आम ग्राहक)
- **Website पर:** `/login` पर जाकर login करता है (Mobile OTP या Email/Mobile/User ID + Password से)
- **Mobile App पर:** App खोलते ही login/register screen आती है
- Login के बाद **Customer का normal shopping experience** खुलता है — Home, Categories, Cart, Orders, Profile
- **Registration:** कोई भी नया व्यक्ति खुद register कर सकता है — पर वो **हमेशा Customer ही बनेगा**। Registration से कभी Admin नहीं बन सकता — ये backend में hard-coded है (register endpoint सिर्फ CUSTOMER role assign करता है, कोई और option ही नहीं है)

### 🟡 Admin (स्टोर स्टाफ)
- **सिर्फ Website पर** — अलग login page: `/admin/login`
- Email + Password से login करता है (OTP नहीं — Admin कभी OTP से login नहीं करता)
- Login के बाद **Admin Dashboard** खुलता है (sidebar में साफ़ लिखा दिखेगा "Admin Dashboard")
- दिखता है: Dashboard (sales overview), Products, Categories, Orders, Customers, Offers & Coupons

### 🔴 Super Admin (मालिक / सबसे ऊपर का access)
- **सिर्फ Website पर** — वही `/admin/login` page (Admin वाला ही page, पर backend खुद पहचानता है role)
- Login के बाद **Super Admin Dashboard** खुलता है — Admin वाली सारी चीज़ें + कुछ extra जो सिर्फ Super Admin को दिखती हैं (sidebar में अलग से "SUPER ADMIN" section दिखेगा):
  - **Admin Users** — नए Admin/Super Admin account बनाना
  - **Roles & Permissions** — किस role को क्या access है, वो control करना
  - **Reports** — पूरा sales report, top customers
  - **Audit Logs** — किसने कब क्या change किया, उसका पूरा record

### Admin/Super Admin के account कैसे बनते हैं?

**जैसा तुमने बोला — यही exactly design है:**
- Registration से कभी Admin/Super Admin नहीं बन सकता — सिर्फ Customer बनता है
- Admin/Super Admin के account **2 तरीकों से** बनते हैं:
  1. **Database में manually डालकर** — जैसा तुम चाहते हो
  2. **या** पहले से login किया हुआ **Super Admin**, "Admin Users" section से नया Admin/Super Admin बना सकता है (ये option भी सिर्फ Super Admin के पास है)
- **पहला Super Admin account अपने-आप बन जाता है** जब तुम backend पर `npx prisma db seed` चलाते हो — default login होता है:
  - Email: `superadmin@nimadkirana.com`
  - Password: `SuperAdmin@123`
  - (चाहो तो `.env` में `SEED_SUPER_ADMIN_EMAIL` / `SEED_SUPER_ADMIN_PASSWORD` set करके अपनी values डाल सकते हो)
  - **⚠️ Production में जाते ही ये password ज़रूर बदल देना**

### एक security cheज़ जो मैंने अभी check करके ठीक की

तुमने बोला "check karo ki role-based login sahi se separate hai" — checking करते हुए एक असली gap मिला और मैंने अभी fix कर दिया:

पहले, अगर किसी Admin/Super Admin का mobile number किसी customer के OTP-login flow से match हो जाता, तो password के बिना ही वो admin account में login हो सकता था (क्योंकि OTP-login का code सिर्फ mobile number देख रहा था, role नहीं)। अब backend साफ़ check करता है — **OTP login सिर्फ Customer role के लिए काम करेगा**, अगर वो mobile number किसी staff account का है तो साफ़ error आएगा: *"This mobile number is registered to a staff account. Please use the Admin login instead."*

---

## 3. Website — पूरी Functionality (Role के हिसाब से)

### Customer Side (`/`)
- **Home** — banner, categories, popular products
- **Categories** (`/categories`) — category चुनो, उसके products दिखेंगे
- **Product Detail** — variant चुनना (जैसे 500g/1kg), price, cart में add
- **Cart** (`/cart`) — quantity बदलना, remove करना
- **Checkout** (`/checkout`) — address चुनना/नया add करना, payment method (Cash/UPI/Card), order place करना
- **Orders** (`/orders`) — order history, status
- **Offers** (`/offers`) — active discount/coupon list

### Admin Dashboard (`/admin`)
- **Dashboard** — आज की sales, इस महीने की sales, pending orders, low-stock alert
- **Products** — नया product बनाना, edit करना, **images upload करना** (browser से सीधे), **variants (price) edit करना**
- **Categories** — category बनाना/हटाना
- **Orders** — हर order देखना, status बदलना (Pending → Confirmed → ... → Delivered) — एक click में
- **Customers** — registered customers की list
- **Offers & Coupons** — discount codes बनाना

### Super Admin Dashboard (`/admin` + extra sidebar section)
Admin वाली सारी चीज़ें + ये extra:
- **Admin Users** — Admin/Super Admin accounts बनाना, हटाना
- **Roles & Permissions** — कौन से role को क्या-क्या करने का access है, वो control करना
- **Reports** — detailed sales report, top customers
- **Audit Logs** — पूरे system में हुई हर activity का record

---

## 4. Mobile App — अभी की Functionality

**⚠️ ज़रूरी बात:** Mobile app अभी **सिर्फ Customer के लिए** बना है — जैसे Blinkit, Zepto, Swiggy Instamart में सिर्फ customer app होता है, staff अलग से web panel use करते हैं। **Admin या Super Admin के लिए मोबाइल में अभी कोई dashboard नहीं बना है।**

अभी Mobile App में ये सब है:
- Splash Screen (animated, logo के साथ)
- Onboarding
- Login (Mobile OTP या Email/Mobile/UserID + Password) / Register / Forgot Password
- Home, Categories, Product Detail, Cart, Checkout, Orders, Wishlist, Profile

**अगर तुम्हें Mobile App में भी Admin/Super Admin के लिए अलग dashboard चाहिए** (जैसे स्टोर स्टाफ mobile से भी orders manage कर सके), तो ये एक **नया feature request** होगा — मुझे बताओ तो मैं बना दूंगा। अभी backend में जो APIs हैं वो सब already Admin/Super Admin के लिए ready हैं (products, orders, dashboard सब), बस mobile में screens नहीं बनी हैं।

---

## 5. Backend — कैसे काम करता है (छोटे में)

- एक ही NestJS API चलता है — पता: `http://<server>/api/v1`
- हर request के साथ एक JWT token जाता है — backend token से पहचानता है कि ये कौन है (Customer/Admin/Super Admin) और वो चीज़ करने का हक़ है या नहीं
- हर sensitive endpoint पर role check लगा है — जैसे "Products create करना" सिर्फ Admin/Super Admin कर सकते हैं, "Roles बदलना" सिर्फ Super Admin कर सकता है — customer वहाँ तक पहुँच ही नहीं सकता चाहे कुछ भी try करे
- Database एक है — 35 tables, सारा data (products, orders, users, roles — सब) यहीं है

---

## 6. Project को चलाने के Commands (छोटे में — पूरी detail `DESCRIPTION.md` में है)

```bash
# 1. Database चालू करो
cd docker && docker compose up -d

# 2. Backend
cd ../backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed          # ← ये Super Admin account भी बना देगा
npm run start:dev

# 3. Website (customer + admin दोनों इसी में हैं)
cd ../apps/web-app
npm install
npm run dev
# customer: http://localhost:5173/
# admin login: http://localhost:5173/admin/login

# 4. Mobile App
cd ../apps/NimadKirana
npm install
npm run android    # या npm run ios
```

EC2 पर backend deploy करने के पूरे commands `DESCRIPTION.md` में हैं (Nginx, PM2, SSL सब कुछ) — वो पहले ही दे चुका हूँ, वहीं है।

---

## 7. एक बार में समझने के लिए — Table

| कौन | कहाँ Login करता है | कैसे Login करता है | Register हो सकता है? | Dashboard |
|---|---|---|---|---|
| Customer | Website `/login` या Mobile App | OTP / Password (mobile, email या User ID) | ✅ हाँ, खुद से | Customer shopping experience |
| Admin | Website `/admin/login` सिर्फ | Email + Password | ❌ नहीं, सिर्फ Super Admin बना सकता है | Admin Dashboard |
| Super Admin | Website `/admin/login` सिर्फ | Email + Password | ❌ नहीं, सिर्फ DB में manually या दूसरा Super Admin बनाए | Super Admin Dashboard (Admin + extra) |

---

## 8. अभी क्या बचा हुआ है

- Mobile App में Admin/Super Admin dashboard — **अगर चाहिए तो बताओ, नया feature होगा**
- Default Super Admin का password (`SuperAdmin@123`) production में जाने से पहले बदलना — ज़रूरी
- तुम्हारे local machine पर एक बार `npx prisma generate` चलाकर backend को real database के साथ test करना (ये sandbox environment में मैं नहीं कर सका)
