# Деплойване на Астрологичния Софтуер

## Експортиране на проекта от Replit

### Метод 1: Git Clone (Препоръчителен)
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### Метод 2: Изтегляне като ZIP
1. Отидете в Replit проекта
2. Кликнете на менюто с трите точки (...)
3. Изберете "Download as ZIP"
4. Разархивирайте файла на вашия компютър

### Метод 3: Ръчно копиране (ако другите не работят)
Създайте следната файлова структура:

```
astrology-app/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   └── index.html
├── server/
│   ├── astrology-engine.js
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   └── vite.ts
├── shared/
│   └── schema.ts
├── package.json
├── package-lock.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json
├── postcss.config.js
└── drizzle.config.ts
```

## Деплойване на Raspberry Pi 2011.12

### Системни изисквания
- Raspberry Pi OS (32-bit)
- Node.js 18+ (препоръчва се най-новата LTS версия)
- Git
- 1GB+ свободно място

### Стъпки за инсталация

#### 1. Актуализирайте системата
```bash
sudo apt update
sudo apt upgrade -y
```

#### 2. Инсталирайте Node.js
```bash
# Добавете NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Инсталирайте Node.js
sudo apt-get install -y nodejs

# Проверете версията
node --version
npm --version
```

#### 3. Клонирайте проекта
```bash
cd /home/pi
git clone https://github.com/your-username/astrology-app.git
cd astrology-app
```

#### 4. Инсталирайте зависимостите
```bash
npm install
```

#### 5. Билдвайте проекта
```bash
npm run build
```

#### 6. Стартирайте приложението в production режим
```bash
npm run start
```

### Конфигуриране като системна услуга

Създайте systemd service за автоматично стартиране:

```bash
sudo nano /etc/systemd/system/astrology-app.service
```

Добавете следното съдържание:
```ini
[Unit]
Description=Astrology Application
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/astrology-app
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Активирайте услугата:
```bash
sudo systemctl daemon-reload
sudo systemctl enable astrology-app
sudo systemctl start astrology-app
sudo systemctl status astrology-app
```

### Конфигуриране на мрежата

#### За локален достъп:
Приложението ще бъде достъпно на:
```
http://RASPBERRY_PI_IP:3000
```

#### За външен достъп (опционално):
1. Конфигурирайте port forwarding на рутера за порт 3000
2. Или използвайте nginx като reverse proxy:

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/astrology-app
```

Добавете:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Активирайте конфигурацията:
```bash
sudo ln -s /etc/nginx/sites-available/astrology-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Тестване на инсталацията

1. Отворете браузър и отидете на `http://RASPBERRY_PI_IP:3000`
2. Въведете тестовите данни:
   - Име: Тест Тестов
   - Пол: Мъж
   - Дата: 1990-05-15
   - Час: 14:30
   - Град: София
   - Държава: България
3. Проверете дали се зарежда наталната карта и таблиците

### Мониториране и логове

```bash
# Проверка на статуса на услугата
sudo systemctl status astrology-app

# Преглед на логовете
sudo journalctl -u astrology-app -f

# Рестартиране при нужда
sudo systemctl restart astrology-app
```

### Възможни проблеми и решения

#### Недостатъчна памет:
```bash
# Добавете swap file ако няма достатъчно RAM
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

#### Проблеми с Node.js версията:
```bash
# Използвайте nvm за управление на версии
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### Актуализиране на приложението

```bash
cd /home/pi/astrology-app
git pull origin main
npm install
npm run build
sudo systemctl restart astrology-app
```

### Бекъп на данните

```bash
# Създаване на бекъп скрипт
cat > /home/pi/backup-astrology.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /home/pi/backups/astrology-app-$DATE.tar.gz /home/pi/astrology-app
find /home/pi/backups -name "astrology-app-*.tar.gz" -mtime +7 -delete
EOF

chmod +x /home/pi/backup-astrology.sh

# Добавете в crontab за автоматичен бекъп
(crontab -l 2>/dev/null; echo "0 2 * * * /home/pi/backup-astrology.sh") | crontab -
```

## Контакт и поддръжка

При проблеми с деплоймънта, проверете:
1. Логовете на приложението
2. Статуса на системната услуга
3. Мрежовите настройки
4. Наличната памет и дисково пространство