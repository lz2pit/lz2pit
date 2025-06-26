// server/astrology-engine.js
import swisseph from "swisseph";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EPHE_PATH = process.env.EPHE_PATH || path.join(__dirname, "../swisseph-master/ephe");
swisseph.swe_set_ephe_path(EPHE_PATH);

export class AstrologyCalculator {
  constructor() {
    console.log("Астрологичен калкулатор инициализиран (Swiss Ephemeris)");
    console.log("Ephemeris path:", EPHE_PATH);
  }

  async getCoordinates(city, country) {
    const cityCoordinates = {
      "плевен": { lat: 43.4167, lng: 24.6167 },
      "софия": { lat: 42.6977, lng: 23.3219 },
      "пловдив": { lat: 42.1354, lng: 24.7453 },
      "варна": { lat: 43.2141, lng: 27.9147 },
      "бургас": { lat: 42.5048, lng: 27.4626 },
      "русе": { lat: 43.8564, lng: 25.9704 },
      "стара загора": { lat: 42.4258, lng: 25.6342 },
      "сливен": { lat: 42.6824, lng: 26.3151 },
      "добрич": { lat: 43.5736, lng: 27.8278 },
      "шумен": { lat: 43.2706, lng: 26.9247 },
      "перник": { lat: 42.6000, lng: 23.0333 }
    };
    const lowerCity = city.toLowerCase();
    if (cityCoordinates[lowerCity]) {
      return { lat: cityCoordinates[lowerCity].lat, lon: cityCoordinates[lowerCity].lng, city, country };
    }
    return { lat: 42.6977, lon: 23.3219, city, country };
  }

  async getCitySuggestions(query) {
    const cities = [
      "София", "Пловдив", "Варна", "Бургас", "Русе",
      "Стара Загора", "Плевен", "Сливен", "Добрич", "Шумен",
      "Перник", "Хасково", "Ямбол", "Пазарджик", "Благоевград",
      "Велико Търново", "Враца", "Габрово", "Асеновград", "Видин",
      "Казанлък", "Кюстендил"
    ];
    return cities
      .filter((c) => c.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8)
      .map((c) => ({ city: c, country: "България" }));
  }

  async calculateNatalChart(birthData, coordinates) {
    try {
      console.log("Calculating natal chart for:", JSON.stringify(birthData), JSON.stringify(coordinates));
      
      // Парсваме датата и времето от формата
      let year, month, day, hour, minute, second;
      
      if (birthData.date && birthData.time) {
        // Нов формат: date: "1982-02-13", time: "17:13:00"
        const [y, m, d] = birthData.date.split('-').map(Number);
        const [h, min, s] = birthData.time.split(':').map(Number);
        year = y;
        month = m;
        day = d;
        hour = h;
        minute = min;
        second = s || 0;
      } else {
        // Стар формат със separate полета
        year = birthData.year;
        month = birthData.month;
        day = birthData.day;
        hour = birthData.hour;
        minute = birthData.minute;
        second = birthData.second || 0;
      }
      
      console.log("Parsed date/time:", { year, month, day, hour, minute, second });

      // България е UTC+2 (EET) или UTC+3 (EEST за лятно време)
      // За февруари 1982 е било зимно време (UTC+2)
      const timezone = 2; // EET
      const utHour = hour - timezone + minute / 60 + second / 3600;
      
      // Изчисляваме Юлианската дата
      const jd = swisseph.swe_julday(year, month, day, utHour, swisseph.SE_GREG_CAL);
      console.log("Julian Day:", jd);
      
      // Добавяме делта-T корекция за по-точни резултати
      const deltaT = swisseph.swe_deltat(jd);
      console.log("Delta-T correction:", deltaT * 86400, "seconds");

      // Изчисляваме позициите на планетите
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

      // Изчисляваме домовете с Placidus система
      const lat = coordinates.lat || coordinates.latitude || 43.4167;
      const lon = coordinates.lon || coordinates.longitude || 24.6167;
      
      console.log("Using coordinates:", { lat, lon });
      
      // Изчисляваме домовете
      const houses = swisseph.swe_houses(jd, lat, lon, 'P'); // 'P' за Placidus
      console.log("Houses calculated:", houses);
      
      const houseData = {};
      if (houses && houses.house) {
        for (let i = 0; i < 12; i++) {
          const houseCusp = houses.house[i];
          const sign = this.getZodiacSign(houseCusp);
          const degree = Math.floor(houseCusp % 30);
          const minutes = Math.floor((houseCusp % 1) * 60);
          const seconds = Math.round((((houseCusp % 1) * 60) % 1) * 60);
          
          houseData[`Дом ${i + 1}`] = {
            longitude: houseCusp,
            sign,
            degree,
            minutes,
            seconds
          };
        }
      }

      // Изчисляваме планетите
      for (const [name, index] of Object.entries(planetIndices)) {
        try {
          const result = swisseph.swe_calc_ut(jd, index, swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED);
          if (result.error) {
            console.error(`Error calculating ${name}:`, result.error);
            continue;
          }
          
          const longitude = result.longitude;
          const speed = result.longitudeSpeed || 0;
          const sign = this.getZodiacSign(longitude);
          const degree = Math.floor(longitude % 30);
          const minutes = Math.floor((longitude % 1) * 60);
          const seconds = Math.round((((longitude % 1) * 60) % 1) * 60);
          
          // Определяме дали планетата е ретроградна, директна или стационарна
          let motionType = 'D'; // Direct (директна)
          if (Math.abs(speed) < 0.02) {
            motionType = 'S'; // Stationary (стационарна)
          } else if (speed < 0) {
            motionType = 'R'; // Retrograde (ретроградна)
          }
          
          // Изчисляваме магнитуда (приблизителни стойности)
          let magnitude = 'X'; // За невидими планети
          const visiblePlanets = {
            'Слънце': -26.7,
            'Луна': -12.6,
            'Меркурий': -1.9,
            'Венера': -4.4,
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
            magnitude
          };
          
          console.log(`${name}: ${sign.name} ${degree}° ${minutes}' ${seconds}" в ${house} дом, ${motionType}, mag: ${magnitude}`);
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
          house: 1
        };
        
        planets["MC"] = {
          longitude: mc,
          sign: this.getZodiacSign(mc),
          degree: Math.floor(mc % 30),
          minutes: Math.floor((mc % 1) * 60),
          seconds: Math.round((((mc % 1) * 60) % 1) * 60),
          house: 10
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
    
    // Сортираме аспектите по орбис (по-точните първи)
    aspects.sort((a, b) => a.orb - b.orb);
    
    return aspects;
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
          natalPoints[`Дом ${i + 1}`] = houses.house[i];
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
          mercuryRetro: []       // Меркурий (само ретрограден) - всички мажорни
        };
        
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
              if (angle > 180) angle = 360 - angle;
              
              for (const aspect of majorAspects) {
                const diff = Math.abs(angle - aspect.angle);
                if (diff <= aspect.orb) {
                  dayTransits.outerPlanets.push({
                    transitPlanet,
                    aspect: aspect.name,
                    symbol: aspect.symbol,
                    natalPoint,
                    orb: diff.toFixed(2)
                  });
                  break;
                }
              }
            }
          }
        }
        
        // Колона 2: Венера (съвпад, секстил, тригон)
        const venusAspects = [
          { name: "Съвпад", angle: 0, orb: 2, symbol: "☌" },
          { name: "Секстил", angle: 60, orb: 2, symbol: "⚹" },
          { name: "Тригон", angle: 120, orb: 2, symbol: "△" }
        ];
        
        const venusResult = swisseph.swe_calc_ut(transitJD, planetIndices["Венера"], swisseph.SEFLG_SWIEPH);
        if (!venusResult.error) {
          const venusLongitude = venusResult.longitude;
          
          for (const [natalPoint, natalLongitude] of Object.entries(natalPoints)) {
            let angle = Math.abs(venusLongitude - natalLongitude);
            if (angle > 180) angle = 360 - angle;
            
            for (const aspect of venusAspects) {
              const diff = Math.abs(angle - aspect.angle);
              if (diff <= aspect.orb) {
                dayTransits.venus.push({
                  transitPlanet: "Венера",
                  aspect: aspect.name,
                  symbol: aspect.symbol,
                  natalPoint,
                  orb: diff.toFixed(2)
                });
                break;
              }
            }
          }
        }
        
        // Колона 3: Марс (съвпад, квадрат, опозиция)
        const marsAspects = [
          { name: "Съвпад", angle: 0, orb: 2, symbol: "☌" },
          { name: "Квадратура", angle: 90, orb: 2, symbol: "□" },
          { name: "Опозиция", angle: 180, orb: 2, symbol: "☍" }
        ];
        
        const marsResult = swisseph.swe_calc_ut(transitJD, planetIndices["Марс"], swisseph.SEFLG_SWIEPH);
        if (!marsResult.error) {
          const marsLongitude = marsResult.longitude;
          
          for (const [natalPoint, natalLongitude] of Object.entries(natalPoints)) {
            let angle = Math.abs(marsLongitude - natalLongitude);
            if (angle > 180) angle = 360 - angle;
            
            for (const aspect of marsAspects) {
              const diff = Math.abs(angle - aspect.angle);
              if (diff <= aspect.orb) {
                dayTransits.mars.push({
                  transitPlanet: "Марс",
                  aspect: aspect.name,
                  symbol: aspect.symbol,
                  natalPoint,
                  orb: diff.toFixed(2)
                });
                break;
              }
            }
          }
        }
        
        // Колона 4: Меркурий (само ако е ретрограден)
        const mercuryResult = swisseph.swe_calc_ut(transitJD, planetIndices["Меркурий"], swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED);
        if (!mercuryResult.error && mercuryResult.longitudeSpeed < 0) { // Ретрограден
          const mercuryLongitude = mercuryResult.longitude;
          
          for (const [natalPoint, natalLongitude] of Object.entries(natalPoints)) {
            let angle = Math.abs(mercuryLongitude - natalLongitude);
            if (angle > 180) angle = 360 - angle;
            
            for (const aspect of majorAspects) {
              const diff = Math.abs(angle - aspect.angle);
              if (diff <= aspect.orb) {
                dayTransits.mercuryRetro.push({
                  transitPlanet: "Меркурий",
                  aspect: aspect.name,
                  symbol: aspect.symbol,
                  natalPoint,
                  orb: diff.toFixed(2),
                  isRetrograde: true
                });
                break;
              }
            }
          }
        }
        
        // Добавяме деня само ако има поне един аспект
        if (dayTransits.outerPlanets.length > 0 || 
            dayTransits.venus.length > 0 || 
            dayTransits.mars.length > 0 || 
            dayTransits.mercuryRetro.length > 0) {
          forecastByDate[dateStr] = dayTransits;
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Конвертираме в масив за frontend-а
      const forecastArray = Object.values(forecastByDate);
      
      console.log(`Found transits for ${forecastArray.length} days`);
      return forecastArray;
      
    } catch (error) {
      console.error("Грешка при изчисляване на прогноза:", error);
      throw error;
    }
  }
  
  getAspectColor(aspect) {
    const colors = {
      "Съвпад": "#ff0000",      // червено
      "Опозиция": "#ff6600",    // оранжево
      "Квадратура": "#ff9900",  // жълто-оранжево
      "Тригон": "#0066ff",      // синьо
      "Секстил": "#00cc00"      // зелено
    };
    return colors[aspect] || "#666666";
  }
  
  formatDegree(longitude) {
    const sign = this.getZodiacSign(longitude);
    const degree = Math.floor(longitude % 30);
    const minutes = Math.floor((longitude % 1) * 60);
    return `${sign.symbol} ${degree}°${minutes}'`;
  }
  
  getTransitDescription(transitPlanet, aspect, natalPlanet) {
    const descriptions = {
      "Юпитер": {
        "Съвпад": "Нови възможности и разширяване",
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