// server/astrology-engine.js
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const swisseph = require('swisseph');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EPHE_PATH = process.env.EPHE_PATH || path.join(__dirname, "../swisseph-master/ephe");

// Настройваме Swiss Ephemeris пътя
swisseph.swe_set_ephe_path(EPHE_PATH);

class AstrologyCalculator {
  constructor() {
    // Инициализация
  }

  // Функция за получаване на координати (ПОПРАВЕНА!)
  async getCoordinates(city, country = "България") {
    console.log(`getCoordinates called with city: ${city}`);
    
    try {
      console.log(`Looking for city: ${city}`);
      
      // Координати на основни български градове
      const bulgarianCities = {
        'софия': { lat: 42.6977, lon: 23.3219 },
        'пловдив': { lat: 42.1354, lon: 24.7453 },
        'варна': { lat: 43.2141, lon: 27.9147 },
        'бургас': { lat: 42.5048, lon: 27.4626 },
        'русе': { lat: 43.8564, lon: 25.9570 },
        'стара загора': { lat: 42.4258, lon: 25.6342 },
        'плевен': { lat: 43.4167, lon: 24.6167 },
        'сливен': { lat: 42.6824, lon: 26.3157 },
        'добрич': { lat: 43.5714, lon: 27.8272 },
        'шумен': { lat: 43.2706, lon: 26.9225 },
        'перник': { lat: 42.6092, lon: 23.0309 },
        'ямбол': { lat: 42.4841, lon: 26.5106 },
        'хасково': { lat: 41.9344, lon: 25.5553 },
        'пазарджик': { lat: 42.1887, lon: 24.3319 },
        'благоевград': { lat: 42.0116, lon: 23.0905 },
        'велико търново': { lat: 43.0757, lon: 25.6172 },
        'враца': { lat: 43.2030, lon: 23.5489 },
        'габрово': { lat: 42.8741, lon: 25.3188 },
        'кърджали': { lat: 41.6303, lon: 25.3732 },
        'кюстендил': { lat: 42.2858, lon: 22.6952 },
        'ловеч': { lat: 43.1340, lon: 24.7151 },
        'монтана': { lat: 43.4091, lon: 23.2276 },
        'разград': { lat: 43.5258, lon: 26.5156 },
        'силистра': { lat: 44.1194, lon: 27.2614 },
        'смолян': { lat: 41.5741, lon: 24.7016 },
        'търговище': { lat: 43.2468, lon: 26.5694 },
        'видин': { lat: 43.9859, lon: 22.8777 }
      };
      
      const cityKey = city.toLowerCase().trim();
      
      if (bulgarianCities[cityKey]) {
        const coordinates = bulgarianCities[cityKey];
        console.log(`Found coordinates: ${JSON.stringify(coordinates)}`);
        
        const result = {
          success: true,
          coordinates: {
            lat: coordinates.lat,
            lon: coordinates.lon
          }
        };
        
        console.log(`Returning success result: ${JSON.stringify(result)}`);
        return result;
      }
      
      // Fallback към Плевен
      const fallbackCoords = { lat: 43.4167, lon: 24.6167 };
      console.log(`City not found, using fallback: ${JSON.stringify(fallbackCoords)}`);
      
      return {
        success: true,
        coordinates: fallbackCoords
      };
    } catch (error) {
      console.error("Error in getCoordinates:", error);
      
      // Fallback към Плевен при грешка
      return {
        success: true,
        coordinates: { lat: 43.4167, lon: 24.6167 }
      };
    }
  }

  // Функция за автодопълване на градове
  async getCitySuggestions(query) {
    const cities = [
      'София', 'Пловдив', 'Варна', 'Бургас', 'Русе', 'Стара Загора', 'Плевен',
      'Сливен', 'Добрич', 'Шумен', 'Перник', 'Ямбол', 'Хасково', 'Пазарджик',
      'Благоевград', 'Велико Търново', 'Враца', 'Габрово', 'Кърджали', 'Кюстендил',
      'Ловеч', 'Монтана', 'Разград', 'Силистра', 'Смолян', 'Търговище', 'Видин'
    ];
    
    const filtered = cities.filter(city => 
      city.toLowerCase().includes(query.toLowerCase())
    );
    
    return filtered.slice(0, 10);
  }

  // Основна функция за изчисляване на натална карта
  async calculateNatalChart(birthData, coordinates) {
    try {
      console.log("Calculating natal chart with data:", birthData);
      console.log("Using coordinates:", coordinates);
      
      // Парсваме датата на раждане
      let year, month, day, hour, minute, second;
      
      if (birthData.date && birthData.time) {
        const [y, m, d] = birthData.date.split('-').map(Number);
        const [h, min, s] = birthData.time.split(':').map(Number);
        year = y; month = m; day = d; hour = h; minute = min; second = s || 0;
      } else {
        year = birthData.year; month = birthData.month; day = birthData.day;
        hour = birthData.hour; minute = birthData.minute; second = birthData.second || 0;
      }
      
      // Изчисляваме UTC времето
      const timezone = 2; // EET for Bulgaria
      const utHour = hour - timezone + minute / 60 + second / 3600;
      const julianDay = swisseph.swe_julday(year, month, day, utHour, swisseph.SE_GREG_CAL);
      
      console.log("Julian Day:", julianDay);
      
      // Координати
      const lat = coordinates.lat || coordinates.latitude || 43.4167;
      const lon = coordinates.lon || coordinates.longitude || 24.6167;
      
      console.log("Using lat/lon:", lat, lon);
      
      // Изчисляваме домовете
      const houses = swisseph.swe_houses(julianDay, lat, lon, 'P');
      console.log("Houses calculated:", houses);
      
      // Форматираме данните за домовете
      const houseData = {};
      if (houses && houses.house) {
        for (let i = 0; i < 12; i++) {
          const houseNumber = i + 1;
          let houseName;
          
          // Специални имена за ъглови домове
          if (houseNumber === 1) houseName = "ASC";
          else if (houseNumber === 4) houseName = "IC";
          else if (houseNumber === 7) houseName = "DSC";
          else if (houseNumber === 10) houseName = "MC";
          else houseName = houseNumber.toString();
          
          const longitude = houses.house[i];
          const sign = this.getZodiacSign(longitude);
          const degree = Math.floor(longitude % 30);
          const minutes = Math.floor((longitude % 1) * 60);
          const seconds = Math.round((((longitude % 1) * 60) % 1) * 60);
          
          houseData[`Дом ${houseNumber}`] = {
            longitude,
            sign,
            degree,
            minutes,
            seconds,
            name: houseName
          };
        }
      }
      
      // Изчисляваме планетите
      const planets = {};
      const planetIndices = {
        "Слънце": swisseph.SE_SUN,
        "Луна": swisseph.SE_MOON,
        "Меркурий": swisseph.SE_MERCURY,
        "Венера": swisseph.SE_VENUS,
        "Марс": swisseph.SE_MARS,
        "Юпитер": swisseph.SE_JUPITER,
        "Сатурн": swisseph.SE_SATURN,
        "Уран": swisseph.SE_URANUS,
        "Нептун": swisseph.SE_NEPTUNE,
        "Плутон": swisseph.SE_PLUTO
      };
      
      // Планетни символи
      const planetSymbols = {
        "Слънце": "☉",
        "Луна": "☽", 
        "Меркурий": "☿",
        "Венера": "♀",
        "Марс": "♂",
        "Юпитер": "♃",
        "Сатурн": "♄",
        "Уран": "♅",
        "Нептун": "♆",
        "Плутон": "♇"
      };

      for (const [name, index] of Object.entries(planetIndices)) {
        try {
          const result = swisseph.swe_calc_ut(julianDay, index, swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED);
          
          if (!result.error) {
            const longitude = result.longitude;
            const speed = result.longitudeSpeed;
            const sign = this.getZodiacSign(longitude);
            const degree = Math.floor(longitude % 30);
            const minutes = Math.floor((longitude % 1) * 60);
            const seconds = Math.round((((longitude % 1) * 60) % 1) * 60);
            
            // Определяме движението
            let motionType = 'D'; // Direct
            if (speed < 0) {
              motionType = 'R'; // Retrograde
            } else if (Math.abs(speed) < 0.01) {
              motionType = 'S'; // Stationary
            }
            
            // Симулирани магнитуди за видимите планети
            let magnitude = "—";
            const visiblePlanets = {
              'Венера': -4.2,
              'Марс': -2.9,
              'Юпитер': -2.7,
              'Сатурн': -0.5
            };
            
            if (name in visiblePlanets) {
              magnitude = visiblePlanets[name].toFixed(1);
            }
            
            // Определяме в кой дом е планетата
            let house = 1;
            if (houses && houses.house) {
              for (let i = 0; i < 12; i++) {
                const nextHouse = (i + 1) % 12;
                const cusp1 = houses.house[i];
                const cusp2 = houses.house[nextHouse];
                
                if (this.isPlanetInHouse(longitude, cusp1, cusp2)) {
                  house = i + 1;
                  break;
                }
              }
            }
            
            planets[name] = {
              longitude,
              sign,
              degree,
              minutes,
              seconds,
              house,
              speed,
              motionType,
              magnitude,
              symbol: planetSymbols[name]
            };
            
            console.log(`${name}: ${sign.name} ${degree}° ${minutes}' ${seconds}" в ${house} дом, ${motionType}, mag: ${magnitude}`);
          }
        } catch (error) {
          console.error(`Error calculating ${name}:`, error);
        }
      }

      // Добавяме Асцендент и MC
      if (houses) {
        const ascendant = houses.ascendant || 0;
        const mc = houses.mc || 0;
        
        planets["Асцендент"] = {
          longitude: ascendant,
          sign: this.getZodiacSign(ascendant),
          degree: Math.floor(ascendant % 30),
          minutes: Math.floor((ascendant % 1) * 60),
          seconds: Math.round((((ascendant % 1) * 60) % 1) * 60),
          house: 1,
          symbol: "ASC"
        };
        
        planets["MC"] = {
          longitude: mc,
          sign: this.getZodiacSign(mc),
          degree: Math.floor(mc % 30),
          minutes: Math.floor((mc % 1) * 60),
          seconds: Math.round((((mc % 1) * 60) % 1) * 60),
          house: 10,
          symbol: "MC"
        };
      }

      return {
        birthData: {
          ...birthData,
          year,
          month,
          day,
          hour,
          minute,
          second
        },
        coordinates,
        planets,
        houses: houseData,
        aspects: this.calculateAspects(planets, houseData)
      };
    } catch (error) {
      console.error("Грешка при изчисляване на натална карта:", error);
      throw error;
    }
  }

  isPlanetInHouse(planetLong, cusp1, cusp2) {
    // Нормализираме всички ъгли между 0 и 360
    planetLong = planetLong % 360;
    cusp1 = cusp1 % 360;
    cusp2 = cusp2 % 360;
    
    if (cusp1 < cusp2) {
      return planetLong >= cusp1 && planetLong < cusp2;
    } else {
      // Когато преминаваме през 0° (между Риби и Овен)
      return planetLong >= cusp1 || planetLong < cusp2;
    }
  }

  getZodiacSign(degree) {
    const signs = [
      { name: "Овен", symbol: "♈" }, { name: "Телец", symbol: "♉" },
      { name: "Близнаци", symbol: "♊" }, { name: "Рак", symbol: "♋" },
      { name: "Лъв", symbol: "♌" }, { name: "Дева", symbol: "♍" },
      { name: "Везни", symbol: "♎" }, { name: "Скорпион", symbol: "♏" },
      { name: "Стрелец", symbol: "♐" }, { name: "Козирог", symbol: "♑" },
      { name: "Водолей", symbol: "♒" }, { name: "Риби", symbol: "♓" }
    ];
    const normalizedDegree = ((degree % 360) + 360) % 360;
    return signs[Math.floor(normalizedDegree / 30)];
  }

  calculateAspects(planets, houses) {
    const aspects = [];
    const aspectTypes = [
      { name: "Съвпад", angle: 0, orb: 8, symbol: "☌" },
      { name: "Секстил", angle: 60, orb: 6, symbol: "⚹" },
      { name: "Квадратура", angle: 90, orb: 8, symbol: "□" },
      { name: "Тригон", angle: 120, orb: 8, symbol: "△" },
      { name: "Опозиция", angle: 180, orb: 8, symbol: "☍" }
    ];
    
    // Мажорни аспекти за домовете (по-малък орбис)
    const houseAspectTypes = [
      { name: "Съвпад", angle: 0, orb: 3, symbol: "☌" },
      { name: "Секстил", angle: 60, orb: 3, symbol: "⚹" },
      { name: "Квадратура", angle: 90, orb: 3, symbol: "□" },
      { name: "Тригон", angle: 120, orb: 3, symbol: "△" },
      { name: "Опозиция", angle: 180, orb: 3, symbol: "☍" }
    ];
    
    const planetNames = Object.keys(planets).filter(name => 
      !["Асцендент", "MC"].includes(name)
    );
    
    // Аспекти между планети
    for (let i = 0; i < planetNames.length; i++) {
      for (let j = i + 1; j < planetNames.length; j++) {
        const planet1 = planetNames[i];
        const planet2 = planetNames[j];
        const angle = Math.abs(planets[planet1].longitude - planets[planet2].longitude);
        const normalizedAngle = angle > 180 ? 360 - angle : angle;
        
        for (const aspect of aspectTypes) {
          const diff = Math.abs(normalizedAngle - aspect.angle);
          if (diff <= aspect.orb) {
            aspects.push({
              planet1,
              planet2,
              type: aspect.name,
              symbol: aspect.symbol,
              angle: normalizedAngle,
              orb: diff,
              category: "planet-planet"
            });
            break;
          }
        }
      }
    }
    
    // Аспекти между планети и върхове на домове
    if (houses) {
      // Важни върхове на домове (Ъглови домове: 1, 4, 7, 10)
      const importantHouses = ["Дом 1", "Дом 4", "Дом 7", "Дом 10"];
      
      for (const planetName of planetNames) {
        const planetLongitude = planets[planetName].longitude;
        
        // Проверяваме аспекти към всички домове
        for (const [houseName, houseData] of Object.entries(houses)) {
          if (houseData && houseData.longitude !== undefined) {
            const houseLongitude = houseData.longitude;
            const angle = Math.abs(planetLongitude - houseLongitude);
            const normalizedAngle = angle > 180 ? 360 - angle : angle;
            
            for (const aspect of houseAspectTypes) {
              const diff = Math.abs(normalizedAngle - aspect.angle);
              if (diff <= aspect.orb) {
                // Добавяме само мажорни аспекти към ъглови домове
                // или много точни аспекти (орбис < 1°) към други домове
                if (importantHouses.includes(houseName) || diff < 1) {
                  aspects.push({
                    planet1: planetName,
                    planet2: houseName,
                    type: aspect.name,
                    symbol: aspect.symbol,
                    angle: normalizedAngle,
                    orb: diff,
                    category: "planet-house"
                  });
                  break;
                }
              }
            }
          }
        }
      }
      
      // Аспекти между Асцендент/MC и планети
      const specialPoints = ["Асцендент", "MC"];
      for (const point of specialPoints) {
        if (planets[point]) {
          const pointLongitude = planets[point].longitude;
          
          for (const planetName of planetNames) {
            const planetLongitude = planets[planetName].longitude;
            const angle = Math.abs(pointLongitude - planetLongitude);
            const normalizedAngle = angle > 180 ? 360 - angle : angle;
            
            for (const aspect of houseAspectTypes) {
              const diff = Math.abs(normalizedAngle - aspect.angle);
              if (diff <= aspect.orb) {
                aspects.push({
                  planet1: planetName,
                  planet2: point,
                  type: aspect.name,
                  symbol: aspect.symbol,
                  angle: normalizedAngle,
                  orb: diff,
                  category: "planet-angle"
                });
                break;
              }
            }
          }
        }
      }
    }
    
    // Сортираме аспектите по орбис (най-точните първи)
    aspects.sort((a, b) => a.orb - b.orb);
    
    return aspects;
  }

  // ФУНКЦИЯ ЗА ПРОГРЕСИИ (ПОПРАВЕНА!)
  calculateProgressions(birthData, coordinates, forecastDate) {
    try {
      console.log("=== CALCULATING PROGRESSIONS ===");
      console.log("Birth data:", birthData);
      console.log("Forecast date:", forecastDate);
      
      // Парсваме датата на раждане
      let year, month, day, hour, minute, second;
      
      if (birthData.date && birthData.time) {
        const [y, m, d] = birthData.date.split('-').map(Number);
        const [h, min, s] = birthData.time.split(':').map(Number);
        year = y; month = m; day = d; hour = h; minute = min; second = s || 0;
      } else {
        year = birthData.year; month = birthData.month; day = birthData.day;
        hour = birthData.hour; minute = birthData.minute; second = birthData.second || 0;
      }
      
      // Изчисляваме наталния Julian Day
      const timezone = 2;
      const utHour = hour - timezone + minute / 60 + second / 3600;
      const natalJD = swisseph.swe_julday(year, month, day, utHour, swisseph.SE_GREG_CAL);
      
      // Парсваме датата на прогнозата
      const [fy, fm, fd] = forecastDate.split('-').map(Number);
      const forecastJD = swisseph.swe_julday(fy, fm, fd, 12, swisseph.SE_GREG_CAL);
      
      // КРИТИЧНО: Изчисляваме разликата в дни от раждането до прогнозната дата
      const daysDifference = forecastJD - natalJD;
      
      // ПРОГРЕСИИ: Ден за година - добавяме дните като дни, НЕ като години!
      const progressedJD = natalJD + daysDifference / 365.25;
      
      console.log(`Birth JD: ${natalJD}`);
      console.log(`Forecast JD: ${forecastJD}`);
      console.log(`Days difference: ${daysDifference}`);
      console.log(`Progressed JD: ${progressedJD}`);
      
      // Координати
      const lat = coordinates.lat || coordinates.latitude || 43.4167;
      const lon = coordinates.lon || coordinates.longitude || 24.6167;
      
      // Изчисляваме наталните позиции
      const natalPositions = {};
      const planetIndices = {
        "Слънце": swisseph.SE_SUN,
        "Луна": swisseph.SE_MOON,
        "Меркурий": swisseph.SE_MERCURY,
        "Венера": swisseph.SE_VENUS,
        "Марс": swisseph.SE_MARS,
        "Юпитер": swisseph.SE_JUPITER,
        "Сатурн": swisseph.SE_SATURN,
        "Уран": swisseph.SE_URANUS,
        "Нептун": swisseph.SE_NEPTUNE,
        "Плутон": swisseph.SE_PLUTO
      };
      
      // Планетни символи
      const planetSymbols = {
        "Слънце": "☉",
        "Луна": "☽", 
        "Меркурий": "☿",
        "Венера": "♀",
        "Марс": "♂",
        "Юпитер": "♃",
        "Сатурн": "♄",
        "Уран": "♅",
        "Нептун": "♆",
        "Плутон": "♇"
      };
      
      // Изчисляваме наталните планети
      for (const [name, index] of Object.entries(planetIndices)) {
        const result = swisseph.swe_calc_ut(natalJD, index, swisseph.SEFLG_SWIEPH);
        if (!result.error) {
          natalPositions[name] = result.longitude;
        }
      }
      
      // Изчисляваме наталните домове
      const natalHouses = swisseph.swe_houses(natalJD, lat, lon, 'P');
      if (natalHouses && natalHouses.house) {
        for (let i = 0; i < 12; i++) {
          let houseName;
          if (i === 0) houseName = "ASC";
          else if (i === 3) houseName = "IC";
          else if (i === 6) houseName = "DSC";
          else if (i === 9) houseName = "MC";
          else houseName = (i + 1).toString();
          
          natalPositions[houseName] = natalHouses.house[i];
        }
      }
      
      // Добавяме Асцендент и MC
      if (natalHouses) {
        natalPositions["ASC"] = natalHouses.ascendant || 0;
        natalPositions["MC"] = natalHouses.mc || 0;
      }
      
      // Изчисляваме прогресивните планети
      const progressedPlanets = {};
      const progressedHouses = swisseph.swe_houses(progressedJD, lat, lon, 'P');
      
      for (const [name, index] of Object.entries(planetIndices)) {
        const result = swisseph.swe_calc_ut(progressedJD, index, swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED);
        if (!result.error) {
          const speed = result.longitudeSpeed;
          let motionType = '';
          if (speed < 0) {
            motionType = 'R'; // Retrograde
          }
          
          // Намираме в кой дом е прогресивната планета
          let house = 1;
          if (progressedHouses && progressedHouses.house) {
            const planetLong = result.longitude;
            for (let i = 0; i < 12; i++) {
              const nextHouse = (i + 1) % 12;
              const cusp1 = progressedHouses.house[i];
              const cusp2 = progressedHouses.house[nextHouse];
              
              if (this.isPlanetInHouse(planetLong, cusp1, cusp2)) {
                house = i + 1;
                break;
              }
            }
          }
          
          const sign = this.getZodiacSign(result.longitude);
          
          progressedPlanets[name] = {
            longitude: result.longitude,
            sign: sign,
            house: house,
            speed: speed,
            motionType: motionType,
            symbol: planetSymbols[name]
          };
          
          console.log(`Progressed ${name}: ${sign.name} in house ${house} ${motionType}`);
        }
      }
      
      // Търсим аспекти с орбис 1°
      const progressionAspects = [];
      const aspectTypes = [
        { name: "Съвпад", angle: 0, orb: 1, symbol: "☌" },
        { name: "Секстил", angle: 60, orb: 1, symbol: "⚹" },
        { name: "Квадратура", angle: 90, orb: 1, symbol: "□" },
        { name: "Тригон", angle: 120, orb: 1, symbol: "△" },
        { name: "Опозиция", angle: 180, orb: 1, symbol: "☍" }
      ];
      
      // Проверяваме аспекти между прогресивни планети и натални позиции
      for (const [progPlanet, progData] of Object.entries(progressedPlanets)) {
        const progLongitude = progData.longitude;
        
        for (const [natalPoint, natalLongitude] of Object.entries(natalPositions)) {
          let angle = Math.abs(progLongitude - natalLongitude);
          angle = angle > 180 ? 360 - angle : angle;
          
          for (const aspect of aspectTypes) {
            const diff = Math.abs(angle - aspect.angle);
            if (diff <= aspect.orb) {
              // Форматираме наталната точка
              let natalDisplay = natalPoint;
              if (natalPoint.match(/^\d+$/)) {
                natalDisplay = natalPoint;
              } else if (["ASC", "IC", "DSC", "MC"].includes(natalPoint)) {
                natalDisplay = natalPoint;
              } else if (planetSymbols[natalPoint]) {
                natalDisplay = planetSymbols[natalPoint];
              } else if (natalPoint.startsWith("Дом ")) {
                // Конвертираме "Дом X" в правилния формат
                const houseNum = parseInt(natalPoint.replace("Дом ", ""));
                if (houseNum === 1) natalDisplay = "ASC";
                else if (houseNum === 4) natalDisplay = "IC";
                else if (houseNum === 7) natalDisplay = "DSC";
                else if (houseNum === 10) natalDisplay = "MC";
                else natalDisplay = houseNum.toString();
              }
              
              // Форматираме прогресивната планета
              const progDisplay = progData.symbol + (progData.motionType || '');
              
              // Намираме дома на наталната позиция
              let natalHouse = 1;
              if (natalHouses && natalHouses.house && planetSymbols[natalPoint]) {
                for (let i = 0; i < 12; i++) {
                  const nextHouse = (i + 1) % 12;
                  const cusp1 = natalHouses.house[i];
                  const cusp2 = natalHouses.house[nextHouse];
                  
                  if (this.isPlanetInHouse(natalLongitude, cusp1, cusp2)) {
                    natalHouse = i + 1;
                    break;
                  }
                }
              }
              
              progressionAspects.push({
                progressed: progDisplay,
                progressedHouse: progData.house,
                progressedSign: progData.sign.name,
                aspect: aspect.symbol,
                natal: natalDisplay,
                natalHouse: natalHouse,
                orb: diff,
                description: `${progDisplay} ${progData.house} ${progData.sign.name} ${aspect.symbol} ${natalDisplay} ${natalHouse}`
              });
              
              console.log(`PROGRESSION: ${progDisplay} from ${progData.house} ${progData.sign.name} ${aspect.name} natal ${natalDisplay} from ${natalHouse}`);
              break;
            }
          }
        }
      }
      
      // Сортираме по орбис (най-точните първи)
      progressionAspects.sort((a, b) => a.orb - b.orb);
      
      console.log("=== PROGRESSION ASPECTS FOUND ===");
      progressionAspects.forEach(aspect => {
        console.log(aspect.description);
      });
      
      return progressionAspects;
      
    } catch (error) {
      console.error("Error calculating progressions:", error);
      return [];
    }
  }

  async calculateForecast(birthData, coordinates, startDate, endDate) {
    try {
      console.log("Calculating forecast for period:", startDate, "to", endDate);
      
      // Парсваме раждащите данни
      let year, month, day, hour, minute, second;
      
      if (birthData.date && birthData.time) {
        const [y, m, d] = birthData.date.split('-').map(Number);
        const [h, min, s] = birthData.time.split(':').map(Number);
        year = y; month = m; day = d; hour = h; minute = min; second = s || 0;
      } else {
        year = birthData.year; month = birthData.month; day = birthData.day;
        hour = birthData.hour; minute = birthData.minute; second = birthData.second || 0;
      }
      
      // Изчисляваме наталните позиции
      const timezone = 2; // EET
      const utHour = hour - timezone + minute / 60 + second / 3600;
      const natalJD = swisseph.swe_julday(year, month, day, utHour, swisseph.SE_GREG_CAL);
      
      // Изчисляваме домовете за наталната карта
      const lat = coordinates.lat || coordinates.latitude || 43.4167;
      const lon = coordinates.lon || coordinates.longitude || 24.6167;
      const houses = swisseph.swe_houses(natalJD, lat, lon, 'P');
      
      // Изчисляваме наталните планети и домове
      const natalPoints = {};
      const planetIndices = {
        "Слънце": swisseph.SE_SUN,
        "Луна": swisseph.SE_MOON,
        "Меркурий": swisseph.SE_MERCURY,
        "Венера": swisseph.SE_VENUS,
        "Марс": swisseph.SE_MARS,
        "Юпитер": swisseph.SE_JUPITER,
        "Сатурн": swisseph.SE_SATURN,
        "Уран": swisseph.SE_URANUS,
        "Нептун": swisseph.SE_NEPTUNE,
        "Плутон": swisseph.SE_PLUTO
      };
      
      // Добавяме планетите
      for (const [name, index] of Object.entries(planetIndices)) {
        const result = swisseph.swe_calc_ut(natalJD, index, swisseph.SEFLG_SWIEPH);
        if (!result.error) {
          natalPoints[name] = result.longitude;
        }
      }
      
      // Добавяме върховете на домовете
      if (houses && houses.house) {
        for (let i = 0; i < 12; i++) {
          const houseNumber = i + 1;
          let houseName;
          
          // Специални имена за ъглови домове според изискванията
          if (houseNumber === 1) houseName = "ASC";
          else if (houseNumber === 4) houseName = "IC";
          else if (houseNumber === 7) houseName = "DSC";
          else if (houseNumber === 10) houseName = "MC";
          else houseName = houseNumber.toString();
          
          natalPoints[houseName] = houses.house[i];
        }
      }
      
      // Добавяме Асцендент и MC
      if (houses) {
        natalPoints["Асцендент"] = houses.ascendant || 0;
        natalPoints["MC"] = houses.mc || 0;
      }
      
      // Парсваме датите на прогнозата
      const start = new Date(startDate || new Date());
      const end = new Date(endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
      
      const forecastByDate = {};
      
      // Проверяваме транзитите за всеки ден в периода
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const [cy, cm, cd] = [
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          currentDate.getDate()
        ];
        
        const transitJD = swisseph.swe_julday(cy, cm, cd, 12, swisseph.SE_GREG_CAL);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const dayTransits = {
          date: dateStr,
          outerPlanets: [],      // Юпитер, Сатурн, Уран, Нептун, Плутон
          venus: [],             // Венера - съвпад, секстил, тригон
          mars: [],              // Марс - съвпад, квадрат, опозиция
          mercuryRetro: [],      // Меркурий (само ретрограден) - всички мажорни
          progressions: []       // ДОБАВЯМЕ ПРОГРЕСИИТЕ
        };
        
        // ИЗЧИСЛЯВАМЕ ПРОГРЕСИИТЕ ЗА ТОЗИ ден
        const progressions = this.calculateProgressions(birthData, coordinates, dateStr);
        dayTransits.progressions = progressions;
        
        // Колона 1: Външните планети (всички мажорни аспекти)
        const outerPlanets = ["Юпитер", "Сатурн", "Уран", "Нептун", "Плутон"];
        const majorAspects = [
          { name: "Съвпад", angle: 0, orb: 2, symbol: "☌" },
          { name: "Секстил", angle: 60, orb: 2, symbol: "⚹" },
          { name: "Квадратура", angle: 90, orb: 2, symbol: "□" },
          { name: "Тригон", angle: 120, orb: 2, symbol: "△" },
          { name: "Опозиция", angle: 180, orb: 2, symbol: "☍" }
        ];
        
        for (const transitPlanet of outerPlanets) {
          const transitIndex = planetIndices[transitPlanet];
          const transitResult = swisseph.swe_calc_ut(transitJD, transitIndex, swisseph.SEFLG_SWIEPH);
          
          if (!transitResult.error) {
            const transitLongitude = transitResult.longitude;
            
            for (const [natalPoint, natalLongitude] of Object.entries(natalPoints)) {
              let angle = Math.abs(transitLongitude - natalLongitude);
              angle = angle > 180 ? 360 - angle : angle;
              
              for (const aspect of majorAspects) {
                const diff = Math.abs(angle - aspect.angle);
                if (diff <= aspect.orb) {
                  dayTransits.outerPlanets.push({
                    transitPlanet: transitPlanet,
                    aspect: aspect.symbol,
                    natalPoint: natalPoint,
                    orb: diff.toFixed(2),
                    description: this.getTransitDescription(transitPlanet, aspect.name, natalPoint)
                  });
                  break;
                }
              }
            }
          }
        }
        
        // Колона 2: Венера (съвпад, секстил, тригон)
        const venusAspects = [
          { name: "Съвпад", angle: 0, orb: 1, symbol: "☌" },
          { name: "Секстил", angle: 60, orb: 1, symbol: "⚹" },
          { name: "Тригон", angle: 120, orb: 1, symbol: "△" }
        ];
        
        const venusResult = swisseph.swe_calc_ut(transitJD, swisseph.SE_VENUS, swisseph.SEFLG_SWIEPH);
        if (!venusResult.error) {
          const venusLongitude = venusResult.longitude;
          
          for (const [natalPoint, natalLongitude] of Object.entries(natalPoints)) {
            let angle = Math.abs(venusLongitude - natalLongitude);
            angle = angle > 180 ? 360 - angle : angle;
            
            for (const aspect of venusAspects) {
              const diff = Math.abs(angle - aspect.angle);
              if (diff <= aspect.orb) {
                dayTransits.venus.push({
                  transitPlanet: "Венера",
                  aspect: aspect.symbol,
                  natalPoint: natalPoint,
                  orb: diff.toFixed(2),
                  description: this.getTransitDescription("Венера", aspect.name, natalPoint)
                });
                break;
              }
            }
          }
        }
        
        // Колона 3: Марс (съвпад, квадрат, опозиция)
        const marsAspects = [
          { name: "Съвпад", angle: 0, orb: 1, symbol: "☌" },
          { name: "Квадратура", angle: 90, orb: 1, symbol: "□" },
          { name: "Опозиция", angle: 180, orb: 1, symbol: "☍" }
        ];
        
        const marsResult = swisseph.swe_calc_ut(transitJD, swisseph.SE_MARS, swisseph.SEFLG_SWIEPH);
        if (!marsResult.error) {
          const marsLongitude = marsResult.longitude;
          
          for (const [natalPoint, natalLongitude] of Object.entries(natalPoints)) {
            let angle = Math.abs(marsLongitude - natalLongitude);
            angle = angle > 180 ? 360 - angle : angle;
            
            for (const aspect of marsAspects) {
              const diff = Math.abs(angle - aspect.angle);
              if (diff <= aspect.orb) {
                dayTransits.mars.push({
                  transitPlanet: "Марс",
                  aspect: aspect.symbol,
                  natalPoint: natalPoint,
                  orb: diff.toFixed(2),
                  description: this.getTransitDescription("Марс", aspect.name, natalPoint)
                });
                break;
              }
            }
          }
        }
        
        // Колона 4: Меркурий ретрограден (всички мажорни аспекти)
        const mercuryResult = swisseph.swe_calc_ut(transitJD, swisseph.SE_MERCURY, swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED);
        if (!mercuryResult.error && mercuryResult.longitudeSpeed < 0) { // само ретрограден
          const mercuryLongitude = mercuryResult.longitude;
          
          for (const [natalPoint, natalLongitude] of Object.entries(natalPoints)) {
            let angle = Math.abs(mercuryLongitude - natalLongitude);
            angle = angle > 180 ? 360 - angle : angle;
            
            for (const aspect of majorAspects) {
              const diff = Math.abs(angle - aspect.angle);
              if (diff <= aspect.orb) {
                dayTransits.mercuryRetro.push({
                  transitPlanet: "Меркурий",
                  aspect: aspect.symbol,
                  natalPoint: natalPoint,
                  orb: diff.toFixed(2),
                  description: this.getTransitDescription("Меркурий", aspect.name, natalPoint),
                  isRetrograde: true
                });
                break;
              }
            }
          }
        }
        
        forecastByDate[dateStr] = dayTransits;
        
        // Преминаваме към следващия ден
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Конвертираме обекта в масив за клиента
      const forecastArray = Object.values(forecastByDate);
      
      console.log("=== FORECAST RESULT ===");
      console.log(`Total days processed: ${forecastArray.length}`);
      forecastArray.forEach(day => {
        if (day.progressions.length > 0) {
          console.log(`${day.date}: ${day.progressions.length} progressions`);
        }
      });
      
      return forecastArray;
      
    } catch (error) {
      console.error("Error calculating forecast:", error);
      return {};
    }
  }

  getTransitDescription(transitPlanet, aspect, natalPlanet) {
    const descriptions = {
      "Юпитер": {
        "Съвпад": "Разширяване и възможности",
        "Тригон": "Благоприятен период за растеж",
        "Секстил": "Добри възможности",
        "Квадратура": "Предизвикателства за растеж",
        "Опозиция": "Баланс между амбиции и реалност"
      },
      "Сатурн": {
        "Съвпад": "Важен период на зрялост и отговорност",
        "Тригон": "Стабилизиране и постижения",
        "Секстил": "Практични възможности",
        "Квадратура": "Тестове и предизвикателства",
        "Опозиция": "Кулминация на отговорности"
      },
      "Уран": {
        "Съвпад": "Внезапни промени и освобождаване",
        "Тригон": "Позитивни промени и иновации",
        "Секстил": "Възможности за промяна",
        "Квадратура": "Напрежение и необходимост от промяна",
        "Опозиция": "Радикални промени в живота"
      },
      "Нептун": {
        "Съвпад": "Духовно пробуждане или объркване",
        "Тригон": "Вдъхновение и интуиция",
        "Секстил": "Творчески възможности",
        "Квадратура": "Илюзии и заблуди",
        "Опозиция": "Необходимост от яснота"
      },
      "Плутон": {
        "Съвпад": "Дълбока трансформация",
        "Тригон": "Позитивна трансформация",
        "Секстил": "Възможности за промяна",
        "Квадратура": "Интензивни предизвикателства",
        "Опозиция": "Радикална трансформация"
      },
      "Марс": {
        "Съвпад": "Енергия и инициатива",
        "Тригон": "Добра енергия за действие",
        "Секстил": "Възможности за действие",
        "Квадратура": "Конфликти и напрежение",
        "Опозиция": "Конфронтация"
      },
      "Слънце": {
        "Съвпад": "Фокус върху тази сфера",
        "Тригон": "Хармония и виталност",
        "Секстил": "Позитивна енергия",
        "Квадратура": "Предизвикателства",
        "Опозиция": "Необходимост от баланс"
      }
    };
    
    const planetDesc = descriptions[transitPlanet];
    if (planetDesc && planetDesc[aspect]) {
      return `${planetDesc[aspect]} в сферата на ${natalPlanet}`;
    }
    
    return `${transitPlanet} ${aspect} ${natalPlanet}`;
  }
}

// Създаваме инстанция и я експортираме като default
const astrologyCalculator = new AstrologyCalculator();

export default astrologyCalculator;