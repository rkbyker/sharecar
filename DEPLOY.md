# 🚀 Sharecar — Деплой на Vercel + Supabase

## ✅ Что уже настроено

- Supabase URL и ключ вшиты в `js/supabase.js`
- `vercel.json` — роутинг и заголовки
- `manifest.json` + `sw.js` — PWA
- `index.html` — точка входа с авторизацией

---

## 📋 Шаг 1: Настройка Supabase

### 1.1 Создать таблицы

1. Зайди на [supabase.com/dashboard](https://supabase.com/dashboard)
2. Открой проект → **SQL Editor** → **New query**
3. Вставь содержимое файла `schema.sql` и нажми **Run**

### 1.2 Создать Storage Buckets

1. Слева → **Storage** → **New bucket**
2. Создай два бакета:
   - `avatars` (Public: ✅ YES)
   - `car-photos` (Public: ✅ YES)

### 1.3 Настроить Email (для подтверждения регистрации)

1. **Authentication** → **Settings** → **Email**
2. Включи **"Confirm email"** или выключи для тестирования
3. Укажи redirect URL: `https://твой-сайт.vercel.app/app/auth.html`

### 1.4 Настроить Google OAuth (необязательно)

1. **Authentication** → **Providers** → **Google**
2. Вставь Google Client ID и Secret из Google Cloud Console
3. Redirect URL: `https://ktqiyywdgokktiwavgbq.supabase.co/auth/v1/callback`

---

## 📋 Шаг 2: Деплой на Vercel

### Вариант A: через GitHub (рекомендуется)

1. Загрузи файлы на GitHub (корень репозитория — без лишних папок)
2. Зайди на [vercel.com](https://vercel.com)
3. **Add New** → **Project** → выбери репозиторий `sharecar`
4. Framework: **Other** (или оставь по умолчанию)
5. **Deploy** → жди ~30 секунд
6. Получи URL вида `sharecar.vercel.app`

### Вариант B: Vercel CLI

```bash
npm install -g vercel
cd /путь/к/папке/sharecar
vercel --prod
```

---

## 📋 Шаг 3: После деплоя

### Обновить Supabase Redirect URLs

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. **Site URL**: `https://sharecar.vercel.app` (или ваш домен)
3. **Redirect URLs** добавь:
   - `https://sharecar.vercel.app/app/auth.html`
   - `https://sharecar.vercel.app/app/index.html`

---

## 📱 Установка как приложение

### Android Chrome
1. Открой `https://sharecar.vercel.app` в Chrome
2. Нажми **⋮** → **Добавить на главный экран**
3. Или дождись автоматического баннера «Установить Sharecar»

### iPhone Safari
1. Открой `https://sharecar.vercel.app` в Safari
2. Нажми **↑ Поделиться** → **На экран "Домой"**

---

## 🗄 Структура базы данных

| Таблица | Описание |
|---------|----------|
| `profiles` | Профили пользователей (создаётся авто при регистрации) |
| `cars` | Объявления машин |
| `requests` | Заявки на поездки |
| `messages` | Сообщения в чатах (realtime) |
| `reviews` | Отзывы после поездок |
| `likes` | Лайки машин |
| `racing_tracks` | Треки и трассы |
| `racing_results` | Гоночные результаты |
| `boosts` | Бусты объявлений |

---

## 🔑 Переменные (уже вшиты в код)

```
SUPABASE_URL = https://ktqiyywdgokktiwavgbq.supabase.co
SUPABASE_KEY = sb_publishable_UqkqWGlqU0Slw7a4azOoGg_l8E3vUYP
```

---

## 🐛 Частые проблемы

| Проблема | Решение |
|----------|---------|
| 404 на Vercel | Убедись что `index.html` в корне репо (не в подпапке) |
| Ошибка регистрации | Проверь Email redirect URL в Supabase |
| Нет фото в ленте | Создай Storage buckets `avatars` и `car-photos` |
| RLS ошибки | Прогони schema.sql полностью в SQL Editor |
