# Деплой Amemory на Render

## Сохранение фото, видео и музыки

На **бесплатном** плане Render файлы **удаляются** при перезапуске.

Чтобы всё сохранялось после «сна» и деплоя:

1. План **Starter** ($7/мес) или выше
2. **Persistent Disk** 1 GB (уже в `render.yaml`)
3. Переменная `PERSISTENT_PATH=/opt/render/project/src/persistent`

Все загрузки идут в диск: `uploads/` (медиа) и `data/` (журнал, лайки, визиты).

### Если сервис уже создан на Free

1. Render Dashboard → ваш сервис → **Settings**
2. **Instance Type** → **Starter**
3. **Disks** → Add Disk:
   - Name: `amemory-persistent`
   - Mount Path: `/opt/render/project/src/persistent`
   - Size: 1 GB
4. **Environment** → добавьте:
   - `PERSISTENT_PATH` = `/opt/render/project/src/persistent`
5. **Save** → **Manual Deploy**

---

## GitHub + Render

```bash
git add .
git commit -m "Persistent disk for uploads"
git push origin main
```

**Build Command:** `npm run render:build`  
**Start Command:** `npm start`  
**Health Check:** `/api/health`

### Environment

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `NPM_CONFIG_PRODUCTION` | `false` |
| `PERSISTENT_PATH` | `/opt/render/project/src/persistent` |
| `MEMORIES_PASSWORD` | ваш пароль |
| `ADMIN_PASSWORD` | ваш пароль |
