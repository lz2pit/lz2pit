// Астрологични константи и данни
const ZODIAC_SIGNS = [
    { name: 'Овен', symbol: '♈', degrees: 0 },
    { name: 'Телец', symbol: '♉', degrees: 30 },
    { name: 'Близнаци', symbol: '♊', degrees: 60 },
    { name: 'Рак', symbol: '♋', degrees: 90 },
    { name: 'Лъв', symbol: '♌', degrees: 120 },
    { name: 'Дева', symbol: '♍', degrees: 150 },
    { name: 'Везни', symbol: '♎', degrees: 180 },
    { name: 'Скорпион', symbol: '♏', degrees: 210 },
    { name: 'Стрелец', symbol: '♐', degrees: 240 },
    { name: 'Козирог', symbol: '♑', degrees: 270 },
    { name: 'Водолей', symbol: '♒', degrees: 300 },
    { name: 'Риби', symbol: '♓', degrees: 330 }
];

const PLANETS = [
    { name: 'Слънце', symbol: '☉', color: '#FFD700' },
    { name: 'Луна', symbol: '☽', color: '#C0C0C0' },
    { name: 'Меркурий', symbol: '☿', color: '#FFA500' },
    { name: 'Венера', symbol: '♀', color: '#FF69B4' },
    { name: 'Марс', symbol: '♂', color: '#FF4500' },
    { name: 'Юпитер', symbol: '♃', color: '#4169E1' },
    { name: 'Сатурн', symbol: '♄', color: '#8B4513' },
    { name: 'Уран', symbol: '♅', color: '#00CED1' },
    { name: 'Нептун', symbol: '♆', color: '#4682B4' },
    { name: 'Плутон', symbol: '♇', color: '#8B0000' }
];

const ASPECTS = [
    { name: 'Съвпад', degrees: 0, orb: 3, symbol: '☌', color: '#ff6b6b' },
    { name: 'Секстил', degrees: 60, orb: 3, symbol: '⚹', color: '#4ecdc4' },
    { name: 'Квадрат', degrees: 90, orb: 3, symbol: '□', color: '#ff9f43' },
    { name: 'Трин', degrees: 120, orb: 3, symbol: '△', color: '#26de81' },
    { name: 'Опозиция', degrees: 180, orb: 3, symbol: '☍', color: '#fd79a8' }
];

// Глобални променливи
let natalData = null;
let currentLocation = null;

// Инициализация на приложението
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Content Loaded!");
    initializeApp();
    const testChartContainer = document.getElementById("natal-chart");
    console.log("Test chartContainer element on DOMContentLoaded:", testChartContainer);
});

function initializeApp() {
    setupEventListeners();
    setupAutocomplete();
    setDefaultDates();
}

function setupEventListeners() {
    const birthForm = document.getElementById('birth-form');
    const calculateForecast = document.getElementById('calculate-forecast');

    birthForm.addEventListener('submit', handleBirthFormSubmit);
    calculateForecast.addEventListener('click', handleForecastCalculation);
}

function setupAutocomplete() {
    const cityInput = document.getElementById('city');
    const countryInput = document.getElementById('country');

    cityInput.addEventListener('input', debounce(handleCityInput, 300));
    countryInput.addEventListener('input', debounce(handleCountryInput, 300));
}

function setDefaultDates() {
    const today = new Date();
    const startDate = document.getElementById('start-date');
    const endDate = document.getElementById('end-date');
    
    startDate.value = today.toISOString().split('T')[0];
    
    const futureDate = new Date(today);
    futureDate.setMonth(futureDate.getMonth() + 1);
    endDate.value = futureDate.toISOString().split('T')[0];
}

// Обработка на формата за раждане
async function handleBirthFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const birthData = {
        name: formData.get('name'),
        gender: formData.get('gender'),
        year: parseInt(formData.get('year')),
        month: parseInt(formData.get('month')),
        day: parseInt(formData.get('day')),
        hour: parseInt(formData.get('hour')),
        minute: parseInt(formData.get('minute')),
        second: parseInt(formData.get('second')) || 0,
        city: formData.get('city'),
        country: formData.get('country')
    };

    try {
        showLoading('Изчисляване на наталната карта...');
        
        // Получаване на координати за града
        const coordinatesResponse = await fetch(`/api/coordinates/${encodeURIComponent(birthData.city)}/${encodeURIComponent(birthData.country)}`);
        const coordinatesResult = await coordinatesResponse.json();
        
        if (!coordinatesResult.success) {
            throw new Error('Не могат да се получат координатите за града');
        }
        
        currentLocation = coordinatesResult.data;
        
        // Изчисляване на наталните данни
        const natalResponse = await fetch('/api/calculate-natal-chart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                birthData: birthData,
                coordinates: currentLocation
            })
        });
        
        const natalResult = await natalResponse.json();
        
        if (!natalResult.success) {
            throw new Error(natalResult.error || 'Грешка при изчисляване на наталната карта');
        }
        
        natalData = natalResult.data;
        
        // Показване на резултатите
        displayResults(natalData);
        
    } catch (error) {
        console.error('Грешка при изчисляване:', error);
        alert('Възникна грешка при изчисляването. Моля, проверете данните и опитайте отново.');
    } finally {
        hideLoading();
    }
}

// Показване на резултатите
function displayResults(data) {
    const resultsSection = document.getElementById('results-section');
    resultsSection.style.display = 'block';
    
    drawNatalChart(data);
    displayAspectsTable(data.aspects);
    displayPlanetTable(data.planets, data.houses);
    
    // Скролиране до резултатите
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Показване на таблица с планети
function displayPlanetTable(planets, houses) {
    const aspectsContainer = document.getElementById('aspects-table');
    
    let html = `
        <h3>Позиции на планетите</h3>
        <table class="aspects-table">
            <thead>
                <tr>
                    <th>Планета</th>
                    <th>Знак</th>
                    <th>Градус</th>
                    <th>Дом</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    Object.entries(planets).forEach(([planetName, planetData]) => {
        const planet = PLANETS.find(p => p.name === planetName);
        html += `
            <tr>
                <td><span class="planet-symbol" style="color: ${planet.color}">${planet.symbol}</span> ${planetName}</td>
                <td><span class="symbol">${planetData.sign.symbol}</span> ${planetData.sign.name}</td>
                <td>${planetData.degree}°${planetData.signMinute}'${planetData.signSecond}"</td>
                <td>Дом ${planetData.house}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table><br>';
    
    // Добавяне на таблицата с аспекти
    html += `
        <h3>Аспекти</h3>
        <table class="aspects-table">
            <thead>
                <tr>
                    <th>Тип</th>
                    <th>Елементи</th>
                    <th>Аспект</th>
                    <th>Орбис</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    aspectsContainer.innerHTML = html;
}

// Рисуване на наталната карта
function drawNatalChart(data) {
    const chartContainer = document.getElementById('natal-chart');
    console.log("chartContainer елемент:", chartContainer);
    if (chartContainer) {
        chartContainer.innerHTML = '';
        
        const width = 500;
        const height = 500;
        const radius = 200;
        const center = { x: width / 2, y: height / 2 };
        
        const svg = d3.select(chartContainer)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        
        // Външен кръг
        svg.append('circle')
            .attr('cx', center.x)
            .attr('cy', center.y)
            .attr('r', radius)
            .attr('class', 'chart-circle');
        
        // Вътрешен кръг
        svg.append('circle')
            .attr('cx', center.x)
            .attr('cy', center.y)
            .attr('r', radius * 0.7)
            .attr('class', 'chart-circle');
        
        // Линии на домовете
        for (let i = 1; i <= 12; i++) {
            if (data.houses[i]) {
                const angle = (data.houses[i].cusp - 90) * Math.PI / 180;
                const x1 = center.x + Math.cos(angle) * radius * 0.7;
                const y1 = center.y + Math.sin(angle) * radius * 0.7;
                const x2 = center.x + Math.cos(angle) * radius;
                const y2 = center.y + Math.sin(angle) * radius;
                
                svg.append('line')
                    .attr('x1', x1)
                    .attr('y1', y1)
                    .attr('x2', x2)
                    .attr('y2', y2)
                    .attr('class', 'house-line');
                
                // Номера на домовете
                const labelX = center.x + Math.cos(angle + Math.PI / 12) * radius * 0.85;
                const labelY = center.y + Math.sin(angle + Math.PI / 12) * radius * 0.85;
                
                svg.append('text')
                    .attr('x', labelX)
                    .attr('y', labelY)
                    .attr('class', 'house-label')
                    .text(i);
            }
        }
        
        // Знаци на зодиака
        ZODIAC_SIGNS.forEach((sign, index) => {
            const angle = (sign.degrees - 90) * Math.PI / 180;
            const x = center.x + Math.cos(angle + Math.PI / 12) * radius * 0.9;
            const y = center.y + Math.sin(angle + Math.PI / 12) * radius * 0.9;
            
            svg.append('text')
                .attr('x', x)
                .attr('y', y)
                .attr('class', 'planet-label')
                .attr('font-size', '16px')
                .text(sign.symbol);
        });
        
        // Планети
        Object.entries(data.planets).forEach(([planetName, planetData]) => {
            const planet = PLANETS.find(p => p.name === planetName);
            const angle = (planetData.longitude - 90) * Math.PI / 180;
            const x = center.x + Math.cos(angle) * radius * 0.8;
            const y = center.y + Math.sin(angle) * radius * 0.8;
            
            svg.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 8)
                .attr('fill', planet.color)
                .attr('class', 'planet-marker');
            
            svg.append('text')
                .attr('x', x)
                .attr('y', y + 4)
                .attr('class', 'planet-label')
                .attr('font-size', '12px')
                .attr('fill', 'white')
                .text(planet.symbol);
        });
        
        // Аспектни линии
        data.aspects.forEach(aspect => {
            if (aspect.type === 'planet-planet') {
                const planet1Data = data.planets[aspect.planet1];
                const planet2Data = data.planets[aspect.planet2];
                
                const angle1 = (planet1Data.longitude - 90) * Math.PI / 180;
                const angle2 = (planet2Data.longitude - 90) * Math.PI / 180;
                
                const x1 = center.x + Math.cos(angle1) * radius * 0.6;
                const y1 = center.y + Math.sin(angle1) * radius * 0.6;
                const x2 = center.x + Math.cos(angle2) * radius * 0.6;
                const y2 = center.y + Math.sin(angle2) * radius * 0.6;
                
                svg.append('line')
                    .attr('x1', x1)
                    .attr('y1', y1)
                    .attr('x2', x2)
                    .attr('y2', y2)
                    .attr('stroke', aspect.color)
                    .attr('class', 'aspect-line');
            }
        });
    } else {
        console.error("Error: natal-chart element not found when trying to draw chart.");
    }
}

// Показване на таблицата с аспекти
function displayAspectsTable(aspects) {
    const container = document.getElementById('aspects-table');
    
    let html = `
        <table class="aspects-table">
            <thead>
                <tr>
                    <th>Тип</th>
                    <th>Елементи</th>
                    <th>Аспект</th>
                    <th>Орбис</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    aspects.forEach(aspect => {
        let elements = '';
        if (aspect.type === 'planet-planet') {
            elements = `${aspect.planet1} - ${aspect.planet2}`;
        } else {
            elements = `${aspect.planet} - Дом ${aspect.house}`;
        }
        
        html += `
            <tr>
                <td>${aspect.type === 'planet-planet' ? 'Планета-Планета' : 'Планета-Дом'}</td>
                <td>${elements}</td>
                <td><span class="aspect-symbol" style="color: ${aspect.color}">${aspect.symbol}</span> ${aspect.aspect}</td>
                <td><span class="orb">${aspect.orb.toFixed(2)}°</span></td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Обработка на прогнозата
async function handleForecastCalculation() {
    if (!natalData) {
        alert('Първо трябва да изчислите наталната карта.');
        return;
    }
    
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    if (!startDate || !endDate) {
        alert('Моля, въведете начална и крайна дата.');
        return;
    }
    
    try {
        showLoading('Изчисляване на прогнозата...');
        
        const response = await fetch('/api/calculate-transits', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                natalData: natalData,
                startDate: startDate,
                endDate: endDate
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Грешка при изчисляване на прогнозата');
        }
        
        displayForecastTable(result.data);
        
    } catch (error) {
        console.error('Грешка при изчисляване на прогнозата:', error);
        alert('Възникна грешка при изчисляването на прогнозата.');
    } finally {
        hideLoading();
    }
}

// Показване на таблицата с прогнозата
function displayForecastTable(forecast) {
    const container = document.getElementById('forecast-table');
    
    let html = `
        <table class="forecast-table">
            <thead>
                <tr>
                    <th>Дата</th>
                    <th>Транзитна планета</th>
                    <th>Натална планета</th>
                    <th>Аспект</th>
                    <th>Орбис</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    forecast.forEach(item => {
        html += `
            <tr>
                <td>${new Date(item.date).toLocaleDateString('bg-BG')}</td>
                <td>${item.transitPlanet}</td>
                <td>${item.natalPlanet}</td>
                <td><span class="aspect-symbol" style="color: ${item.color}">${item.symbol}</span> ${item.aspect}</td>
                <td><span class="orb">${item.orb.toFixed(2)}°</span></td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Помощни функции
async function handleCityInput(event) {
    const query = event.target.value;
    if (query.length < 2) return;
    
    try {
        const response = await fetch(`/api/city-suggestions/${encodeURIComponent(query)}`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            const suggestions = result.data.map(item => `${item.city}, ${item.country}`);
            showSuggestions('city-suggestions', suggestions, (suggestion) => {
                const parts = suggestion.split(',');
                document.getElementById('city').value = parts[0].trim();
                document.getElementById('country').value = parts[1].trim();
            });
        }
    } catch (error) {
        console.error('Грешка при търсене на градове:', error);
    }
}

function handleCountryInput(event) {
    const query = event.target.value;
    if (query.length < 2) return;
    
    // Симулация на автоматично довършване
    const suggestions = [
        'България',
        'Германия',
        'Франция',
        'Италия',
        'Испания',
        'Великобритания',
        'САЩ'
    ].filter(country => country.toLowerCase().includes(query.toLowerCase()));
    
    showSuggestions('country-suggestions', suggestions, (
        suggestion) => {
        document.getElementById('country').value = suggestion;
    });
}

function showSuggestions(elementId, suggestions, onSelect) {
    const suggestionsDiv = document.getElementById(elementId);
    suggestionsDiv.innerHTML = '';
    if (suggestions.length > 0) {
        suggestionsDiv.style.display = 'block';
        suggestions.forEach(suggestion => {
            const div = document.createElement('div');
            div.classList.add('suggestion-item');
            div.textContent = suggestion;
            div.addEventListener('click', () => {
                onSelect(suggestion);
                suggestionsDiv.style.display = 'none';
            });
            suggestionsDiv.appendChild(div);
        });
    } else {
        suggestionsDiv.style.display = 'none';
    }
}

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

function showLoading(message) {
    let loadingOverlay = document.getElementById('loading-overlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
            <p id="loading-message"></p>
        `;
        document.body.appendChild(loadingOverlay);
    }
    document.getElementById('loading-message').textContent = message;
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

