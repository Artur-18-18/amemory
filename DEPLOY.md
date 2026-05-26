# Деплой Amemory на Render (Python + PostgreSQL)

## Хранение данных

Все **фото, видео, музыка**, журнал, лайки и визиты сохраняются в **PostgreSQL** через **SQLAlchemy**.

После «сна» и перезапуска хостинга на Render данные **не исчезают** — они в базе.

## Локальный запуск

```bash
# Python 3.11+
pip install -r backend/requirements.txt
npm install
npm run dev
```

- Сайт: http://localhost:5173  
- API: http://localhost:3000  
- Локальная БД: файл `amemory.db` (SQLite) в корне проекта

## Render

1. Push на GitHub
2. **New → Blueprint** → подключить репозиторий (`render.yaml` создаст Web + PostgreSQL)
3. Задать в Environment:
   - `MEMORIES_PASSWORD`
   - `ADMIN_PASSWORD`
4. Deploy

`DATABASE_URL` подставится автоматически из PostgreSQL.

### Build / Start (вручную)

| | |
|---|---|
| Build | `npm run render:build` |
| Start | `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Health | `/api/health` |

## Миграция со старого Node-сервера

При первом запуске Python автоматически импортирует файлы из `server/uploads/` в базу данных.
