# Деплой Amemory на Render

## Шаг 1 — GitHub

```bash
cd c:\Users\matka\Desktop\Amemory
git init
git add .
git commit -m "Amemory: luxury blog ready for Render"
```

Создайте репозиторий на GitHub (например `amemory`) и выполните:

```bash
git remote add origin https://github.com/ВАШ_ЛОГИН/amemory.git
git branch -M main
git push -u origin main
```

## Шаг 2 — Render

1. Откройте [dashboard.render.com](https://dashboard.render.com)
2. **New +** → **Blueprint** (если есть `render.yaml` в репо)  
   или **Web Service** → подключите GitHub-репозиторий
3. Настройки (если без Blueprint):

| Поле | Значение |
|------|----------|
| Build Command | `npm run render:build` |
| Start Command | `npm start` |
| Health Check | `/api/health` |

4. **Environment** (обязательно задайте вручную):

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `MEMORIES_PASSWORD` | ваш пароль для «Воспоминания» |
| `ADMIN_PASSWORD` | ваш пароль для админки |

5. **Create Web Service** → дождитесь зелёного статуса **Live**

> **Диск для uploads:** на Free-плане файлы сбрасываются при перезапуске. Для постоянного хранения подключите **Disk** (платный план) с Mount Path: `/opt/render/project/src/server`

Сайт будет по адресу: `https://amemory.onrender.com` (или ваше имя сервиса).

## После деплоя

- Загружайте контент через `/admin`
- На бесплатном плане сервер «засыпает» — первый заход может занять 30–60 сек
