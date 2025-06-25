const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const AstrologyCalculator = require('./astrology-engine');

const app = express();
const port = 3000;

const calculator = new AstrologyCalculator();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Обслужване на index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API за изчисляване на натална карта
app.post('/api/calculate-natal-chart', async (req, res) => {
    try {
        const { birthData, coordinates } = req.body;
        const natalChart = await calculator.calculateNatalChart(birthData, coordinates);
        res.json({ success: true, data: natalChart });
    } catch (error) {
        console.error('Грешка при изчисляване на наталната карта:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API за получаване на координати
app.get('/api/coordinates/:city/:country', async (req, res) => {
    try {
        const { city, country } = req.params;
        const coordinates = await calculator.getCoordinates(city, country);
        res.json({ success: true, data: coordinates });
    } catch (error) {
        console.error('Грешка при получаване на координати:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API за предложения за градове (за autocomplete)
app.get('/api/city-suggestions/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const suggestions = await calculator.getCitySuggestions(query);
        res.json({ success: true, data: suggestions });
    } catch (error) {
        console.error('Грешка при търсене на градове:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API за изчисляване на транзити
app.post('/api/calculate-transits', async (req, res) => {
    try {
        const { natalData, startDate, endDate } = req.body;
        const forecast = await calculator.calculateForecast(natalData, new Date(startDate), new Date(endDate));
        res.json({ success: true, data: forecast });
    } catch (error) {
        console.error('Грешка при изчисляване на прогнозата:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Астрологичният сървър работи на http://localhost:${port}`  );
});

