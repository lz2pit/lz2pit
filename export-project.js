#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Create export directory if it doesn't exist
const exportDir = path.join(__dirname, 'export');
if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
}

// Create a file write stream
const output = fs.createWriteStream(path.join(exportDir, 'astrology-app.zip'));
const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
});

// Listen for all archive data to be written
output.on('close', function() {
    console.log('✅ Проектът е експортиран успешно!');
    console.log(`📦 Размер на архива: ${archive.pointer()} bytes`);
    console.log(`📁 Локация: ${path.join(exportDir, 'astrology-app.zip')}`);
    console.log('\n🚀 За деплойване на Raspberry Pi:');
    console.log('1. Изтеглете astrology-app.zip файла');
    console.log('2. Прехвърлете го на Raspberry Pi');
    console.log('3. Разархивирайте: unzip astrology-app.zip');
    console.log('4. Следвайте инструкциите в DEPLOYMENT.md');
});

// Good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
        console.warn('Warning:', err);
    } else {
        throw err;
    }
});

// Good practice to catch this error explicitly
archive.on('error', function(err) {
    throw err;
});

// Pipe archive data to the file
archive.pipe(output);

console.log('📦 Създаване на експорт архив...');

// Add files and directories to archive
const filesToExport = [
    // Core application files
    { src: 'package.json', dest: 'package.json' },
    { src: 'package-lock.json', dest: 'package-lock.json' },
    { src: 'tsconfig.json', dest: 'tsconfig.json' },
    { src: 'vite.config.ts', dest: 'vite.config.ts' },
    { src: 'tailwind.config.ts', dest: 'tailwind.config.ts' },
    { src: 'postcss.config.js', dest: 'postcss.config.js' },
    { src: 'components.json', dest: 'components.json' },
    { src: 'drizzle.config.ts', dest: 'drizzle.config.ts' },
    
    // Documentation
    { src: 'DEPLOYMENT.md', dest: 'DEPLOYMENT.md' },
    { src: 'replit.md', dest: 'README.md' },
];

const directoriesToExport = [
    'client',
    'server', 
    'shared'
];

// Add individual files
filesToExport.forEach(file => {
    if (fs.existsSync(file.src)) {
        archive.file(file.src, { name: file.dest });
        console.log(`✓ Добавен файл: ${file.src}`);
    } else {
        console.log(`⚠️  Файлът не съществува: ${file.src}`);
    }
});

// Add directories
directoriesToExport.forEach(dir => {
    if (fs.existsSync(dir)) {
        archive.directory(dir, dir);
        console.log(`✓ Добавена директория: ${dir}`);
    } else {
        console.log(`⚠️  Директорията не съществува: ${dir}`);
    }
});

// Create production start script
const startScript = `#!/bin/bash
# Production start script for Astrology App

echo "🚀 Стартиране на Астрологичния Софтуер..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не е инсталиран. Моля инсталирайте Node.js 18+ първо."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm не е инсталиран. Моля инсталирайте npm първо."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Инсталиране на зависимости..."
    npm install
fi

# Build the application
echo "🔨 Билдване на приложението..."
npm run build

# Start the application
echo "✅ Стартиране на сървъра..."
echo "🌐 Приложението ще бъде достъпно на: http://localhost:3000"
echo "📍 За достъп от други устройства: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "За спиране натиснете Ctrl+C"
echo ""

NODE_ENV=production npm start
`;

archive.append(startScript, { name: 'start.sh' });
console.log('✓ Създаден start.sh скрипт');

// Create installation script
const installScript = `#!/bin/bash
# Installation script for Raspberry Pi

echo "🍓 Инсталиране на Астрологичния Софтуер на Raspberry Pi"
echo "=================================================="

# Update system
echo "📦 Актуализиране на системата..."
sudo apt update && sudo apt upgrade -y

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "📥 Инсталиране на Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "✅ Node.js версия: $(node --version)"
echo "✅ npm версия: $(npm --version)"

# Install dependencies
echo "📦 Инсталиране на зависимости..."
npm install

# Build application
echo "🔨 Билдване на приложението..."
npm run build

# Make scripts executable
chmod +x start.sh

echo ""
echo "🎉 Инсталацията завърши успешно!"
echo ""
echo "За стартиране на приложението:"
echo "  ./start.sh"
echo ""
echo "За системна услуга (автоматично стартиране):"
echo "  Вижте инструкциите в DEPLOYMENT.md"
echo ""
`;

archive.append(installScript, { name: 'install.sh' });
console.log('✓ Създаден install.sh скрипт');

// Create systemd service file
const serviceFile = `[Unit]
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
`;

archive.append(serviceFile, { name: 'astrology-app.service' });
console.log('✓ Създаден systemd service файл');

// Finalize the archive
archive.finalize();