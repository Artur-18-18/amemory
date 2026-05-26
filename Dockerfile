# Сборка фронтенда (Node) + бэкенд (Python) — для Render Docker runtime
FROM node:20-bookworm-slim AS client-build
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/
RUN npm ci --include=dev && npm ci --prefix client --include=dev
COPY client ./client
RUN npm run build --prefix client

FROM python:3.11-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1

COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/app ./backend/app
COPY --from=client-build /app/client/dist ./client/dist

WORKDIR /app/backend
EXPOSE 10000

CMD ["sh", "-c", "exec python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000} --timeout-keep-alive 75"]
