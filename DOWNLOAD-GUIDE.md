# Ръководство за изтегляне на проекта от Replit

## Метод 1: Директно изтегляне като ZIP (Най-лесен)

1. **В Replit проекта:**
   - Отворете менюто с трите точки (⋯) в горния ляв ъгъл
   - Изберете "Download as zip"
   - Файлът ще се изтегли като `Repl.zip`

2. **Разархивиране:**
   ```bash
   unzip Repl.zip
   cd astrology-app
   ```

## Метод 2: Git Clone (Ако имате Git настроен)

1. **Създайте Git repository в Replit:**
   - Отидете в Shell таба в Replit
   - Изпълнете: `git init`
   - Добавете файловете: `git add .`
   - Направете commit: `git commit -m "Initial commit"`

2. **Клонирайте на вашата машина:**
   ```bash
   git clone YOUR_REPLIT_GIT_URL
   ```

## Метод 3: Копиране на файловете ръчно

Ако другите методи не работят, можете да копирате файловете ръчно:

### Основни файлове (в root директорията):
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `vite.config.ts`
- `tailwind.config.ts`
- `postcss.config.js`
- `components.json`
- `drizzle.config.ts`

### Директории за копиране:
- `client/` - цялата директория с всички поддиректории
- `server/` - цялата директория
- `shared/` - цялата директория

## Подготовка за Raspberry Pi

### Файлове специално за Raspberry Pi:

1. **Създайте файл `start-pi.sh`:**
```bash
#!/bin/bash
echo "Стартиране на Астрологичния Софтуер..."

# Проверка за Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js не е инсталиран. Инсталиране..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Инсталиране на зависимости
if [ ! -d "node_modules" ]; then
    echo "Инсталиране на зависимости..."
    npm install
fi

# Билдване
echo "Билдване на приложението..."
npm run build

# Стартиране
echo "Стартиране на сървъра на порт 3000..."
NODE_ENV=production npm start
```

2. **Направете файла изпълним:**
```bash
chmod +x start-pi.sh
```

### Пълна инсталация на Raspberry Pi:

1. **Копирайте файловете на Pi:**
```bash
scp -r astrology-app/ pi@YOUR_PI_IP:/home/pi/
```

2. **SSH към Pi и инсталирайте:**
```bash
ssh pi@YOUR_PI_IP
cd /home/pi/astrology-app
./start-pi.sh
```

### Автоматично стартиране (systemd service):

1. **Създайте service файл:**
```bash
sudo nano /etc/systemd/system/astrology.service
```

2. **Добавете съдържанието:**
```ini
[Unit]
Description=Astrology App
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/astrology-app
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

3. **Активирайте услугата:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable astrology
sudo systemctl start astrology
```

## Проверка на инсталацията

След инсталация на Raspberry Pi:

1. **Проверете статуса:**
```bash
sudo systemctl status astrology
```

2. **Отворете в браузър:**
   - Локално: `http://localhost:3000`
   - От друга машина: `http://PI_IP_ADDRESS:3000`

3. **Тестване:**
   - Въведете данните: Иван Иванов, 1982-02-13, 17:13, Плевен, България
   - Проверете дали се показва наталната карта и таблиците

## Отстраняване на проблеми

### Ако Node.js версията е твърде стара:
```bash
# Деинсталирайте старата версия
sudo apt remove nodejs npm

# Инсталирайте новата
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Ако няма достатъчно памет:
```bash
# Добавете swap file
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Проверка на портове:
```bash
# Проверете дали порт 3000 е свободен
sudo netstat -tlnp | grep :3000

# Ако е зает, спрете процеса или сменете порта
export PORT=3001
npm start
```

## Актуализиране на приложението

За бъдещи актуализации:

1. **Изтеглете новата версия от Replit**
2. **Копирайте файловете на Pi**
3. **Рестартирайте услугата:**
```bash
sudo systemctl restart astrology
```

## Мрежови настройки

За достъп извън локалната мрежа:

1. **Конфигурирайте рутера за port forwarding на порт 3000**
2. **Или използвайте nginx като reverse proxy**

### Nginx конфигурация:
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/astrology
```

Добавете:
```nginx
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Активирайте:
```bash
sudo ln -s /etc/nginx/sites-available/astrology /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

## Поддръжка

За проблеми при деплоймънта:

1. **Проверете логовете:**
```bash
sudo journalctl -u astrology -f
```

2. **Рестартирайте услугата:**
```bash
sudo systemctl restart astrology
```

3. **Проверете свободното място:**
```bash
df -h
```

4. **Проверете използваната памет:**
```bash
free -h
```