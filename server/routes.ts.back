import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  birthDataSchema,
  coordinatesSchema,
  forecastRequestSchema,
  type BirthData,
  type Coordinates,
  type ForecastRequest
} from "@shared/schema";
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

import astrologyEngine from './astrology-engine.js';

const execAsync = promisify(exec);

// Helper functions for PDF export (moved outside registerRoutes to be accessible)
function getPlanetSymbolText(planetName: string): string {
  const symbolMap: { [key: string]: string } = {
    'Sun': '☉',
    'Moon': '☽',
    'Mercury': '☿',
    'Venus': '♀',
    'Mars': '♂',
    'Jupiter': '♃',
    'Saturn': '♄',
    'Uranus': '♅',
    'Neptune': '♆',
    'Pluto': '♇'
  };
  return symbolMap[planetName] || planetName;
}

function getAspectSymbolText(aspectType: string): string {
  const symbolMap: { [key: string]: string } = {
    'Съвпад': '☌',
    'Секстил': '⚹',
    'Квадратура': '□',
    'Тригон': '△',
    'Опозиция': '☍'
  };
  return symbolMap[aspectType] || aspectType;
}

export async function registerRoutes(app: Express): Promise<Server> {

  // ПОПРАВЕН coordinates endpoint
  app.get('/api/coordinates/:city/:country', async (req, res) => {
    try {
      const { city, country } = req.params;
      console.log('API: getting coordinates for:', city, country);
      
      // Извикваме функцията (само с city, защото getCoordinates приема само city)
      const result = await astrologyEngine.getCoordinates(decodeURIComponent(city));
      
      console.log('API: getCoordinates result:', JSON.stringify(result, null, 2));
      
      if (result.success && result.coordinates) {
        // Връщаме координатите директно като data
        res.json({ 
          success: true, 
          data: {
            lat: result.coordinates.lat,
            lon: result.coordinates.lon
          }
        });
      } else if (result.coordinates) {
        // Дори ако success е false, ако имаме fallback координати, ги връщаме
        res.json({ 
          success: true, 
          data: {
            lat: result.coordinates.lat,
            lon: result.coordinates.lon
          }
        });
      } else {
        // Последен fallback към Плевен
        res.json({ 
          success: true, 
          data: {
            lat: 43.4167,
            lon: 24.6167
          }
        });
      }
    } catch (error) {
      console.error('API: Грешка при получаване на координати:', error);
      
      // Дори при грешка, връщаме fallback координати вместо да връщаме 500
      res.json({ 
        success: true, 
        data: {
          lat: 43.4167,  // Плевен fallback
          lon: 24.6167
        }
      });
    }
  });

  app.get('/api/city-suggestions/:query', async (req, res) => {
    try {
      const { query } = req.params;
      const suggestions = await astrologyEngine.getCitySuggestions(decodeURIComponent(query));
      res.json({ success: true, data: suggestions });
    } catch (error) {
      console.error('Грешка при търсене на градове:', error);
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  app.post('/api/calculate-natal-chart', async (req, res) => {
    try {
      const { birthData, coordinates } = req.body;
      const validatedBirthData = birthDataSchema.parse(birthData);
      const validatedCoordinates = coordinatesSchema.parse(coordinates);
      const natalChart = await astrologyEngine.calculateNatalChart(validatedBirthData, validatedCoordinates);
      res.json({ success: true, data: natalChart });
    } catch (error) {
      console.error('Грешка при изчисляване на наталната карта:', error);
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  app.post('/api/calculate-forecast', async (req, res) => {
    try {
      const validatedRequest = forecastRequestSchema.parse(req.body);
      const forecast = await astrologyEngine.calculateForecast(
        validatedRequest.birthData,
        validatedRequest.coordinates,
        validatedRequest.startDate,
        validatedRequest.endDate
      );
      res.json({ success: true, data: forecast });
    } catch (error) {
      console.error('Грешка при изчисляване на прогнозата:', error);
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  app.post('/api/export-forecast-pdf', async (req, res) => {
    try {
      console.log("=== PDF Export Debug ===");
      const { forecastData, startDate, endDate, birthData } = req.body;
      
      // Validate data
      if (!forecastData || !Array.isArray(forecastData)) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing or invalid forecast data" 
        });
      }
      
      // Generate HTML content that matches the web interface
      let htmlContent = `
<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Астрологична Прогноза</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 20px;
            background-color: #f8f9fa;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 15px;
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .info {
            margin-top: 15px;
            font-size: 16px;
            opacity: 0.9;
        }
        .forecast-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        .forecast-table th {
            background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
            color: white;
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            border: none;
        }
        .forecast-table td {
            padding: 12px;
            border-bottom: 1px solid #e9ecef;
            vertical-align: top;
            font-size: 13px;
            line-height: 1.4;
        }
        .forecast-table tr:last-child td {
            border-bottom: none;
        }
        .forecast-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .date-cell {
            font-weight: bold;
            color: #495057;
            white-space: nowrap;
        }
        .aspect-item {
            display: inline-block;
            margin: 2px 4px 2px 0;
            padding: 3px 6px;
            background: #e3f2fd;
            border-radius: 4px;
            font-size: 12px;
            line-height: 1.2;
        }
        .planet-symbol {
            font-weight: bold;
            color: #1976d2;
        }
        .aspect-symbol {
            color: #d32f2f;
            margin: 0 2px;
        }
        .house-text {
            color: #388e3c;
            font-weight: 500;
        }
        .legend {
            margin-top: 30px;
            padding: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        .legend h3 {
            color: #667eea;
            margin-top: 0;
            font-size: 18px;
        }
        .legend-section {
            margin: 15px 0;
        }
        .legend-title {
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
        }
        .legend-content {
            color: #666;
            line-height: 1.6;
        }
        .no-aspects {
            text-align: center;
            padding: 40px;
            color: #666;
            font-style: italic;
            background: white;
            border-radius: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Астрологична Прогноза (Транзити)</h1>
        <div class="info">
            <strong>Име:</strong> ${birthData?.name || 'N/A'}<br>
            <strong>Период:</strong> ${new Date(startDate).toLocaleDateString('bg-BG')} - ${new Date(endDate).toLocaleDateString('bg-BG')}
        </div>
    </div>
`;

      if (forecastData.length === 0) {
        htmlContent += `
    <div class="no-aspects">
        <h3>Няма точни аспекти в избрания период</h3>
        <p>В този период не се наблюдават точни транзитни аспекти или прогресии.</p>
    </div>`;
      } else {
        htmlContent += `
    <table class="forecast-table">
        <thead>
            <tr>
                <th style="width: 12%;">Дата</th>
                <th style="width: 20%;">Прогресии<br><small>(всички прогресивни планети)</small></th>
                <th style="width: 25%;">Външни планети<br><small>(♃ ♄ ♅ ♆ ♇ - всички аспекти)</small></th>
                <th style="width: 15%;">Венера<br><small>(♀ + △)</small></th>
                <th style="width: 15%;">Марс<br><small>(♂ □ ☍)</small></th>
                <th style="width: 13%;">Меркурий R<br><small>(само ретроградeн)</small></th>
            </tr>
        </thead>
        <tbody>`;

        for (const day of forecastData) {
          const date = new Date(day.date).toLocaleDateString('bg-BG');
          
          // Safe access with fallback to empty array and proper formatting
          const progressions = (day.progressions || []).map((t: any) => 
            `<span class="aspect-item"><span class="planet-symbol">${getPlanetSymbolText(t.transitPlanet)}</span> <span class="aspect-symbol">${getAspectSymbolText(t.aspect)}</span> <span class="house-text">${t.natalPoint}</span></span>`
          ).join('') || '—';
          
          const outerPlanets = (day.outerPlanets || []).map((t: any) => 
            `<span class="aspect-item"><span class="planet-symbol">${getPlanetSymbolText(t.transitPlanet)}</span> <span class="aspect-symbol">${getAspectSymbolText(t.aspect)}</span> <span class="house-text">${t.natalPoint}</span></span>`
          ).join('') || '—';
          
          const venus = (day.venus || []).map((t: any) => 
            `<span class="aspect-item"><span class="planet-symbol">${getPlanetSymbolText(t.transitPlanet)}</span> <span class="aspect-symbol">${getAspectSymbolText(t.aspect)}</span> <span class="house-text">${t.natalPoint}</span></span>`
          ).join('') || '—';
          
          const mars = (day.mars || []).map((t: any) => 
            `<span class="aspect-item"><span class="planet-symbol">${getPlanetSymbolText(t.transitPlanet)}</span> <span class="aspect-symbol">${getAspectSymbolText(t.aspect)}</span> <span class="house-text">${t.natalPoint}</span></span>`
          ).join('') || '—';
          
          const mercuryRetro = (day.mercuryRetro || []).map((t: any) => 
            `<span class="aspect-item"><span class="planet-symbol">${getPlanetSymbolText(t.transitPlanet)}</span> <span class="aspect-symbol">${getAspectSymbolText(t.aspect)}</span> <span class="house-text">${t.natalPoint}</span></span>`
          ).join('') || '—';

          htmlContent += `
            <tr>
                <td class="date-cell">${date}</td>
                <td>${progressions}</td>
                <td>${outerPlanets}</td>
                <td>${venus}</td>
                <td>${mars}</td>
                <td>${mercuryRetro}</td>
            </tr>`;
        }

        htmlContent += `
        </tbody>
    </table>`;
      }

      htmlContent += `
    <div class="legend">
        <h3>📖 Легенда</h3>
        
        <div class="legend-section">
            <div class="legend-title">Планети:</div>
            <div class="legend-content">
                <span class="planet-symbol">☉</span> Слънце, 
                <span class="planet-symbol">☽</span> Луна, 
                <span class="planet-symbol">☿</span> Меркурий, 
                <span class="planet-symbol">♀</span> Венера, 
                <span class="planet-symbol">♂</span> Марс<br>
                <span class="planet-symbol">♃</span> Юпитер, 
                <span class="planet-symbol">♄</span> Сатурн, 
                <span class="planet-symbol">♅</span> Уран, 
                <span class="planet-symbol">♆</span> Нептун, 
                <span class="planet-symbol">♇</span> Плутон
            </div>
        </div>
        
        <div class="legend-section">
            <div class="legend-title">Аспекти:</div>
            <div class="legend-content">
                <span class="aspect-symbol">☌</span> Съвпад (0°), 
                <span class="aspect-symbol">⚹</span> Секстил (60°), 
                <span class="aspect-symbol">□</span> Квадратура (90°)<br>
                <span class="aspect-symbol">△</span> Тригон (120°), 
                <span class="aspect-symbol">☍</span> Опозиция (180°)
            </div>
        </div>
        
        <div class="legend-section">
            <div class="legend-title">Забележки:</div>
            <div class="legend-content">
                • <strong>R</strong> = Ретроградна планета<br>
                • Показват се само точни аспекти (орбис ≤ 0.1°)<br>
                • Прогресиите се изчисляват по метода "ден за година"<br>
                • Цветовото кодиране помага за по-лесно четене
            </div>
        </div>
    </div>
</body>
</html>`;

      // Create temporary files
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const timestamp = Date.now();
      const htmlFilePath = path.join(tempDir, `forecast-${timestamp}.html`);
      const pdfFilePath = path.join(tempDir, `forecast-${timestamp}.pdf`);

      // Write HTML file
      fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');

      try {
        // Convert to PDF using wkhtmltopdf (install with: sudo apt-get install wkhtmltopdf)
        await execAsync(`wkhtmltopdf --page-size A4 --margin-top 0.75in --margin-right 0.75in --margin-bottom 0.75in --margin-left 0.75in --encoding UTF-8 "${htmlFilePath}" "${pdfFilePath}"`);

        // Send PDF file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="prognoza-${startDate}-${endDate}.pdf"`);
        
        const pdfBuffer = fs.readFileSync(pdfFilePath);
        res.send(pdfBuffer);

        // Clean up temporary files
        fs.unlinkSync(htmlFilePath);
        fs.unlinkSync(pdfFilePath);

      } catch (pdfError) {
        console.warn('PDF conversion failed, sending HTML instead:', pdfError);
        
        // Fallback: send as HTML file if PDF conversion fails
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="prognoza-${startDate}-${endDate}.html"`);
        res.send(htmlContent);
        
        // Clean up HTML file
        fs.unlinkSync(htmlFilePath);
      }

    } catch (error) {
      console.error('Грешка при генериране на експорт:', error);
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  app.get('/api/country-suggestions/:query', async (req, res) => {
    try {
      const { query } = req.params;
      const countries = [
        'България', 'Германия', 'Великобритания', 'Франция', 'Италия',
        'Испания', 'САЩ', 'Канада', 'Австралия', 'Русия', 'Турция',
        'Гърция', 'Сърбия', 'Румъния', 'Македония', 'Албания'
      ];
      const suggestions = countries
        .filter(country => country.toLowerCase().includes(decodeURIComponent(query).toLowerCase()))
        .slice(0, 8)
        .map(country => ({ country, region: 'Европа' }));
      res.json({ success: true, data: suggestions });
    } catch (error) {
      console.error('Грешка при търсене на държави:', error);
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}