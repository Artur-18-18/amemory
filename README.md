# Amemory — Luxury личный блог

Сайт на русском: витрина, галерея, музыка, плейлист, закрытые воспоминания и админ-панель. Готов к деплою на [Render](https://render.com).

## Разделы

| Раздел | URL | Описание |
|--------|-----|----------|
| Главная | `/` | Кинематографическая витрина (бегущие строки) |
| Галерея | `/gallery` | Просмотр фото и видео с витрины |
| Музыка | `/music` | Прослушивание треков |
| Плейлист | `/playlist` | Отдельная подборка треков |
| Воспоминания | `/memories` | Закрытый раздел (пароль) |
| Админ | `/admin` | Загрузка и удаление контента |

## Пароли (по умолчанию)

- **Воспоминания:** `arturzarina1818_`
- **Админ-панель:** `arturzarina1818_` (можно задать отдельный через `ADMIN_PASSWORD`)

На Render задайте переменные окружения `MEMORIES_PASSWORD` и `ADMIN_PASSWORD`.

## Хранение данных

Все **фото, видео, музыка**, журнал, лайки и избранное хранятся в **PostgreSQL** через **SQLAlchemy** (на Render). После «сна» хостинга контент **не пропадает**.

Локально используется SQLite (`amemory.db` в корне проекта).

## Локальный запуск

```bash
# Python 3.11+
pip install -r backend/requirements.txt
npm install
npm run dev
```

- Сайт: http://localhost:5173  
- API: http://localhost:3000  

## Production

```bash
npm run render:build
npm start
```

## Deploy на Render

См. [DEPLOY.md](./DEPLOY.md). Blueprint `render.yaml` создаёт Web-сервис (Python) и **PostgreSQL**.

- **Build:** `npm run render:build`
- **Start:** `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health:** `/api/health`

При первом запуске файлы из `server/uploads/` и данные из `server/data/` автоматически импортируются в базу.

## Стек

React, Vite, Tailwind, Framer Motion · **FastAPI, SQLAlchemy, PostgreSQL**
