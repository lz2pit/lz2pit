// server/ingress-calculator.js
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const swisseph = require('swisseph');

/**
 * Модул за изчисляване на астрологични ингресии
 * Ингресия = когато планета влиза в нов знак
 */
class IngressCalculator {
  constructor() {
    console.log("Ingress Calculator инициализиран");
    
    // Дефиниции на планетарните индекси - ВКЛЮЧИТЕЛНО Слънце и Луна
    this.planetIndices = {
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

    // Символи на планетите
    this.planetSymbols = {
      "Слънце": "?",
      "Луна": "?", 
      "Меркурий": "?",
      "Венера": "+",
      "Марс": ">",
      "Юпитер": "?",
      "Сатурн": "?",
      "Уран": "?",
      "Нептун": "?",
      "Плутон": "?"
    };

    // Зодиакални знаци
    this.zodiacSigns = [
      { name: "Овен", symbol: "?" },
      { name: "Телец", symbol: "?" },
      { name: "Близнаци", symbol: "?" },
      { name: "Рак", symbol: "?" },
      { name: "Лъв", symbol: "?" },
      { name: "Дева", symbol: "?" },
      { name: "Везни", symbol: "?" },
      { name: "Скорпион", symbol: "?" },
      { name: "Стрелец", symbol: "?" },
      { name: "Козирог", symbol: "?" },
      { name: "Водолей", symbol: "?" },
      { name: "Риби", symbol: "?" }
    ];
  }

  /**
   * Определя зодиакалния знак по долгота
   * @param {number} longitude - Долгота в градуси
   * @returns {Object} Обект със име и символ на знака
   */
  getZodiacSign(longitude) {
    const normalizedLongitude = ((longitude % 360) + 360) % 360;
    const signIndex = Math.floor(normalizedLongitude / 30);
    return this.zodiacSigns[signIndex];
  }

  /**
   * Инициализира знаците на планетите за определена дата
   * @param {Date} date - Дата за инициализация
   * @returns {Object} Обект с планети и техните знаци
   */
  initializePlanetSigns(date) {
    const planetSigns = {};
    const julianDay = swisseph.swe_julday(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      12.0,
      swisseph.SE_GREG_CAL
    );

    // Включваме ВСИЧКИ планети, включително Слънце и Луна
    for (const [planetName, planetIndex] of Object.entries(this.planetIndices)) {
      try {
        const result = swisseph.swe_calc_ut(julianDay, planetIndex, swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED);
        if (!result.error) {
          const sign = this.getZodiacSign(result.longitude);
          planetSigns[planetName] = {
            sign: sign.name,
            longitude: result.longitude,
            isRetrograde: result.longitudeSpeed < 0
          };
          
          // Debug log за инициализация
          console.log(`Initialized ${planetName}: ${sign.name} (${result.longitude.toFixed(2)}°) ${result.longitudeSpeed < 0 ? 'R' : 'D'}`);
        }
      } catch (error) {
        console.error(`Error initializing sign for ${planetName}:`, error);
      }
    }

    return planetSigns;
  }

  /**
   * Проверява за ингресии на определена дата
   * @param {Date} currentDate - Текущата дата
   * @param {Object} previousSigns - Предишните знаци на планетите
   * @returns {Object} Обект с намерени ингресии и обновени знаци
   */
  checkIngressesForDate(currentDate, previousSigns) {
    const ingresses = [];
    const updatedSigns = { ...previousSigns };
    
    const julianDay = swisseph.swe_julday(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      currentDate.getDate(),
      12.0,
      swisseph.SE_GREG_CAL
    );

    console.log(`?? Checking ingresses for: ${currentDate.toISOString().split('T')[0]}`);

    // Проверяваме ВСИЧКИ планети, включително Слънце и Луна
    for (const [planetName, planetIndex] of Object.entries(this.planetIndices)) {
      try {
        const result = swisseph.swe_calc_ut(julianDay, planetIndex, swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED);
        if (!result.error) {
          const currentSign = this.getZodiacSign(result.longitude);
          const isRetrograde = result.longitudeSpeed < 0;
          
          // Проверяваме дали има промяна в знака
          const previousSign = previousSigns[planetName]?.sign;
          if (previousSign && previousSign !== currentSign.name) {
            const ingress = {
              planet: planetName,
              sign: currentSign.name,
              isRetrograde: isRetrograde,
              type: 'transit',
              longitude: result.longitude,
              date: currentDate.toISOString().split('T')[0]
            };
            
            ingresses.push(ingress);
            
            console.log(`? INGRESS FOUND: ${planetName} ${previousSign} > ${currentSign.name} (${isRetrograde ? 'R' : 'D'})`);
          }
          
          // Обновяваме знака
          updatedSigns[planetName] = {
            sign: currentSign.name,
            longitude: result.longitude,
            isRetrograde: isRetrograde
          };
        }
      } catch (error) {
        console.error(`Error calculating ${planetName} for ingress:`, error);
      }
    }

    if (ingresses.length === 0) {
      console.log(`? No ingresses found for ${currentDate.toISOString().split('T')[0]}`);
    }

    return {
      ingresses: ingresses,
      updatedSigns: updatedSigns
    };
  }

  /**
   * Изчислява всички ингресии за период
   * @param {Date} startDate - Начална дата
   * @param {Date} endDate - Крайна дата
   * @returns {Object} Обект с ингресии по дати
   */
  calculateIngressesForPeriod(startDate, endDate) {
    console.log(`=== CALCULATING INGRESSES FOR PERIOD ===`);
    console.log(`From: ${startDate.toISOString().split('T')[0]}`);
    console.log(`To: ${endDate.toISOString().split('T')[0]}`);
    
    const ingressesByDate = {};
    
    // Инициализираме знаците за деня преди началото
    const initDate = new Date(startDate);
    initDate.setDate(initDate.getDate() - 1);
    let planetSigns = this.initializePlanetSigns(initDate);
    
    console.log(`Initial planet signs:`, Object.entries(planetSigns).map(([planet, data]) => 
      `${planet}: ${data.sign} (${data.isRetrograde ? 'R' : 'D'})`
    ).join(', '));

    // Итерираме през всеки ден
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      
      const result = this.checkIngressesForDate(currentDate, planetSigns);
      
      if (result.ingresses.length > 0) {
        ingressesByDate[dateString] = result.ingresses;
      }
      
      // Обновяваме знаците за следващия ден
      planetSigns = result.updatedSigns;
      
      // Преминаваме към следващия ден
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const totalIngresses = Object.values(ingressesByDate).reduce((sum, ingresses) => sum + ingresses.length, 0);
    console.log(`=== INGRESSES CALCULATION COMPLETED ===`);
    console.log(`Total ingresses found: ${totalIngresses}`);
    console.log(`Days with ingresses: ${Object.keys(ingressesByDate).length}`);
    
    return ingressesByDate;
  }

  /**
   * Тестова функция за конкретна дата
   * @param {string} testDate - Дата във формат YYYY-MM-DD
   * @returns {Array} Ингресии за тестваната дата
   */
  testIngressForDate(testDate) {
    console.log(`\n?? TESTING INGRESSES FOR: ${testDate}`);
    
    const currentDate = new Date(testDate);
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);
    
    // Инициализираме знаците за предишния ден
    const previousSigns = this.initializePlanetSigns(previousDate);
    
    // Проверяваме за ингресии
    const result = this.checkIngressesForDate(currentDate, previousSigns);
    
    if (result.ingresses.length > 0) {
      console.log(`? Found ${result.ingresses.length} ingresses:`);
      result.ingresses.forEach(ingress => {
        console.log(`   ${ingress.planet} > ${ingress.sign} ${ingress.isRetrograde ? '(R)' : '(D)'}`);
      });
    } else {
      console.log(`? No ingresses found for this date`);
    }
    
    return result.ingresses;
  }

  /**
   * Форматира ингресия за показване във frontend
   * @param {Object} ingress - Обект с ингресия
   * @returns {Object} Форматирана ингресия
   */
  formatIngress(ingress) {
    return {
      planet: ingress.planet,
      planetSymbol: this.planetSymbols[ingress.planet] || ingress.planet,
      sign: ingress.sign,
      signSymbol: this.zodiacSigns.find(sign => sign.name === ingress.sign)?.symbol || ingress.sign,
      isRetrograde: ingress.isRetrograde,
      type: ingress.type || 'transit',
      formatted: `${this.planetSymbols[ingress.planet] || ingress.planet}>${this.zodiacSigns.find(sign => sign.name === ingress.sign)?.symbol || ingress.sign}`
    };
  }
}

export default IngressCalculator;