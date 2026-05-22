# Stealth Talk

Анонімний зашифрований чат з наскрізним шифруванням (E2E). Без реєстрації, без логів. Текстовий чат, голосові та відеодзвінки. 

## Технології

**Backend:** Node.js, Express, Socket.io

**Frontend:** React, Vite, Socket.io-client, WebRTC, Web Crypto API

**Шифрування:** ECDH P-256 + AES-GCM 256

## Структура проекту

```
Stealth-Talk-Chat/
├── test-server/           # Backend (Node.js + Socket.io)
│   ├── index.js           # Головний серверний файл
│   └── structures/
│       └── queue.js       # Черга для пошуку співрозмовників
├── react/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # UI компоненти
│   │   ├── context/       # React контексти (Socket, Theme, Language)
│   │   ├── hooks/         # Кастомні хуки
│   │   ├── locales/       # Переклади (EN/UK)
│   │   ├── pages/         # Сторінки (Home, Chat, Search, Privacy, Guidelines)
│   │   ├── services/      # Сервіси (socket, crypto, webrtc)
│   │   └── styles/        # Глобальні стилі
│   └── .env.example       # Приклад змінних оточення
├── package.json           # Backend залежності
└── .gitignore
```

## Локальний запуск

### 1. Встановлення залежностей

```bash
npm install
cd react && npm install
```

### 2. Запуск сервера (Термінал 1)

```bash
npm run dev
```

Сервер запуститься на `http://localhost:3000`

### 3. Запуск клієнта (Термінал 2)

```bash
cd react
npm run dev
```

Клієнт запуститься на `http://localhost:5173`

### 4. Тестування

Відкрийте `http://localhost:5173` у двох вкладках (або в звичайному + інкогніто режимі) та натисніть "Почати спілкування" на обох.

## Деплой (безкоштовно)

Фронтенд і бекенд деплояться окремо.

### Backend → Render.com

1. Зайдіть на [render.com](https://render.com) та зареєструйтесь через GitHub
2. Натисніть **New** → **Web Service**
3. Підключіть репозиторій `Stealth-Talk-Chat`
4. Налаштування:
   - **Name:** `stealth-talk-server`
   - **Region:** Frankfurt (EU Central)
   - **Branch:** `main`
   - **Root Directory:** залиште порожнім
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Натисніть **Deploy Web Service**
6. Після деплою скопіюйте URL сервера (наприклад `https://stealth-talk-server.onrender.com`)

### Frontend → Vercel

1. Зайдіть на [vercel.com](https://vercel.com) та зареєструйтесь через GitHub
2. Натисніть **Add New** → **Project**
3. Імпортуйте репозиторій `Stealth-Talk-Chat`
4. Налаштування:
   - **Framework Preset:** Vite
   - **Root Directory:** `react`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Додайте змінну оточення:
   - **Key:** `VITE_SERVER_URL`
   - **Value:** `https://stealth-talk-server.onrender.com` (URL з Render)
6. Натисніть **Deploy**

### Frontend → Netlify (альтернатива)

1. Зайдіть на [netlify.com](https://netlify.com) та зареєструйтесь через GitHub
2. Натисніть **Add new site** → **Import an existing project**
3. Підключіть репозиторій `Stealth-Talk-Chat`
4. Налаштування:
   - **Base directory:** `react`
   - **Build command:** `npm run build`
   - **Publish directory:** `react/dist`
5. Додайте змінну оточення:
   - **Key:** `VITE_SERVER_URL`
   - **Value:** `https://stealth-talk-server.onrender.com`
6. Натисніть **Deploy site**
7. Додайте файл `react/public/_redirects` з вмістом:
   ```
   /*    /index.html   200
   ```
   (для підтримки клієнтського роутингу React Router)

### Після деплою

Відкрийте URL фронтенду у двох різних браузерах або вкладках та перевірте роботу чату.

Безкоштовний tier Render може "засинати" після 15 хвилин без трафіку. Перший запит після сну може зайняти до 30 секунд.
