# Деплой Amemory на Render

## Почему Docker

На Render **Python runtime не содержит Node.js** — команда `npm run build` падает с `npm: command not found`.

Поэтому используется **Docker**: в одном образе собирается React и запускается FastAPI.

## Хранение данных

Фото, видео, музыка, журнал и лайки — в **PostgreSQL** (SQLAlchemy). После «сна» Render данные **не пропадают**.

## Новый деплой (Blueprint)

1. Push на GitHub
2. Render → **New → Blueprint** → репозиторий `Artur-18-18/amemory`
3. При создании задать `MEMORIES_PASSWORD` и `ADMIN_PASSWORD`
4. Deploy

`DATABASE_URL` подставится из PostgreSQL автоматически.

> Если Blueprint ругается на бесплатную БД — создайте PostgreSQL вручную в Render или используйте [Neon](https://neon.tech) (бесплатно) и вставьте `DATABASE_URL` в Environment.

## Уже есть сервис на Render (ошибка `No module named uvicorn`)

Сейчас Render запускает `npm start`, но **не ставит Python-пакеты** на этапе build.

### Вариант A — Node runtime (быстрый фикс)

**Settings → Build & Deploy:**

| Поле | Значение |
|------|----------|
| **Build Command** | `npm install && npm run render:build` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/health` |

`npm start` теперь сам ставит `uvicorn` и слушает порт **`$PORT`** (не 3000).

### Вариант B — Docker (рекомендуется)

| Поле | Значение |
|------|----------|
| **Runtime** | `Docker` |
| **Dockerfile Path** | `./Dockerfile` |
| **Build / Start Command** | *(пусто)* |
| **Health Check Path** | `/api/health` |

Убедитесь, что есть переменная **`DATABASE_URL`** (из PostgreSQL или Neon).

Сохраните → **Manual Deploy → Deploy latest commit**.

## Локально

```bash
pip install -r backend/requirements.txt
npm install
npm run dev
```

Проверка Docker-сборки как на Render:

```bash
docker build -t amemory .
docker run -p 10000:10000 -e PORT=10000 -e DATABASE_URL=sqlite:////tmp/test.db amemory
```

## Частые ошибки

| Ошибка в логах | Решение |
|----------------|---------|
| `npm: command not found` | Переключите Runtime на **Docker** |
| `Could not resolve host: github.com` | Проблема интернета/DNS на ПК, не Render |
| `ModuleNotFoundError: app` | Start: пусто (Docker CMD) или `cd backend && uvicorn...` |
| Health check failed | Проверьте `DATABASE_URL`, логи при старте |
| Blueprint: database plan | Уберите `plan: free` у БД или подключите Neon |
