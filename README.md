# AngloClub Astana — Языковая школа

Современный веб-сайт для языковой школы с мини-CRM системой управления заявками.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)
![Prisma](https://img.shields.io/badge/Prisma-SQLite-2D3748)

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка окружения

Скопируйте `env.template` в `.env` и заполните переменные:

```bash
cp env.template .env
```

Основные переменные:
- `DATABASE_URL` — путь к SQLite базе (по умолчанию `file:./dev.db`)
- `ADMIN_PASSWORD` — пароль для админ-панели
- `EXPORT_SECRET` — секретный ключ для экспорта данных
- `TELEGRAM_BOT_TOKEN` — токен Telegram бота (опционально)
- `TELEGRAM_ADMIN_CHAT_ID` — ID чата для уведомлений (опционально)

### 3. Инициализация базы данных

```bash
npx prisma generate
npx prisma db push
```

### 4. Запуск

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## 📁 Структура проекта

```
src/
├── app/
│   ├── api/
│   │   ├── lead/          # POST /api/lead
│   │   ├── leads/         # GET /api/leads, PATCH /api/leads/:id/status
│   │   └── export/        # GET /api/export
│   ├── admin/             # Админ-панель
│   ├── globals.css        # Дизайн-система
│   ├── layout.tsx         # Root layout с SEO
│   └── page.tsx           # Главная страница
├── components/
│   ├── ui/                # Button, Input, Card, Accordion...
│   ├── layout/            # Header, Footer, CTABar
│   └── sections/          # Hero, Features, Stats, CourseCards...
├── lib/
│   ├── prisma.ts          # Prisma client
│   ├── telegram.ts        # Telegram уведомления
│   └── email.ts           # Email сервис
└── types/                 # TypeScript типы
```

## 🎨 Функциональность

### Сайт
- ✅ Адаптивный дизайн (mobile-first)
- ✅ Темная/светлая тема
- ✅ Мультиязычность (ru/kz/en)
- ✅ Анимированные счётчики
- ✅ Слайдер отзывов
- ✅ Форма записи с WhatsApp интеграцией
- ✅ Фиксированный мобильный CTA-бар
- ✅ SEO оптимизация (meta, OpenGraph)
- ✅ PWA поддержка

### Админ-панель (/admin)
- ✅ Авторизация по паролю
- ✅ Таблица заявок с пагинацией
- ✅ Фильтрация по статусу
- ✅ Поиск по имени/телефону/курсу
- ✅ Изменение статусов
- ✅ Экспорт в CSV/Excel

### API
- `POST /api/lead` — создание заявки
- `GET /api/leads` — список заявок (с авторизацией)
- `PATCH /api/leads/:id/status` — смена статуса
- `GET /api/export?secret=...&format=csv` — экспорт данных

## 🔐 Безопасность

- Пароли и токены хранятся в `.env` (не в репозитории)
- Админ-эндпоинты защищены Basic Auth
- Экспорт защищён секретным ключом
- Валидация входящих данных

## 🌐 Telegram уведомления

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен и chat_id
3. Добавьте в `.env`:
   ```
   TELEGRAM_BOT_TOKEN=your_token
   TELEGRAM_ADMIN_CHAT_ID=your_chat_id
   ```

## 📧 Email уведомления

Настройте SMTP в `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## 🚢 Деплой

### Vercel
```bash
npm i -g vercel
vercel
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate
RUN npm run build
CMD ["npm", "start"]
```

## 📝 Лицензия

MIT © AngloClub Astana
