// test-progressions.js
// Тестов файл за проверка на прогресиите
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const swisseph = require('swisseph');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EPHE_PATH = process.env.EPHE_PATH || path.join(__dirname, "./swisseph-master/ephe");
swisseph.swe_set_ephe_path(EPHE_PATH);

console.log("=== TESTING PROGRESSIONS ACCURACY ===\n");

// Входни данни
const birthData = {
  year: 1982,
  month: 2,
  day: 13,
  hour: 17,
  minute: 13,
  second: 0,
  city: "Плевен",
  country: "България"
};

// За България през февруари 1982 - UTC+2 (EET)
const timezoneOffset = 2;
const utHour = birthData.hour - timezoneOffset + birthData.minute/60 + birthData.second/3600;

console.log("Birth data:");
console.log(`Date: ${birthData.year}-${birthData.month}-${birthData.day}`);
console.log(`Time: ${birthData.hour}:${birthData.minute}:${birthData.second} EET (UTC+${timezoneOffset})`);
console.log(`UT hour: ${utHour.toFixed(6)}`);

// Изчисляваме натална юлианска дата
const natalJD = swisseph.swe_julday(
  birthData.year,
  birthData.month,
  birthData.day,
  utHour,
  swisseph.SE_GREG_CAL
);

console.log(`\nNatal Julian Day: ${natalJD.toFixed(10)}`);

// Изчисляваме наталните позиции
const natalPlanets = {};
const planetNames = {
  "Sun": swisseph.SE_SUN,
  "Moon": swisseph.SE_MOON,
  "Mercury": swisseph.SE_MERCURY,
  "Venus": swisseph.SE_VENUS,
  "Mars": swisseph.SE_MARS
};

console.log("\nNatal positions:");
for (const [name, index] of Object.entries(planetNames)) {
  const result = swisseph.swe_calc_ut(natalJD, index, swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED);
  if (!result.error) {
    natalPlanets[name] = result.longitude;
    const sign = Math.floor(result.longitude / 30);
    const degrees = result.longitude % 30;
    console.log(`${name}: ${result.longitude.toFixed(6)}° (Sign ${sign}, ${degrees.toFixed(2)}°)`);
  }
}

// Тестваме различни дати и часове за 10.12.2025
console.log("\n=== TESTING DIFFERENT TIMES FOR 2025-12-10 ===");

const testTimes = [
  { hour: 0, minute: 0, label: "midnight" },
  { hour: 10, minute: 0, label: "10:00 AM" },
  { hour: 12, minute: 0, label: "noon" },
];

for (const testTime of testTimes) {
  console.log(`\n--- Testing ${testTime.label} ---`);
  
  // За 10.12.2025 в България трябва да проверим дали е лятно или зимно време
  // През декември е зимно време (UTC+2)
  const targetUtHour = testTime.hour - 2 + testTime.minute/60;
  
  const targetJD = swisseph.swe_julday(2025, 12, 10, targetUtHour, swisseph.SE_GREG_CAL);
  
  const daysDiff = targetJD - natalJD;
  const yearsDiff = daysDiff / 365.25;
  const yearsAge = daysDiff / 365.2425; // По-точна стойност
  
  console.log(`Target JD: ${targetJD.toFixed(10)}`);
  console.log(`Days difference: ${daysDiff.toFixed(6)}`);
  console.log(`Years (365.25): ${yearsDiff.toFixed(6)}`);
  console.log(`Years (365.2425): ${yearsAge.toFixed(6)}`);
  
  // Изчисляваме прогресивната дата
  const progressedJD = natalJD + yearsDiff;
  console.log(`Progressed JD: ${progressedJD.toFixed(10)}`);
  
  // Изчисляваме прогресивната Луна
  const moonResult = swisseph.swe_calc_ut(progressedJD, swisseph.SE_MOON, swisseph.SEFLG_SWIEPH);
  if (!moonResult.error) {
    const moonLong = moonResult.longitude;
    const moonSign = Math.floor(moonLong / 30);
    const moonDegrees = moonLong % 30;
    const moonMinutes = (moonDegrees % 1) * 60;
    
    console.log(`Progressed Moon: ${moonLong.toFixed(6)}°`);
    console.log(`  = Sign ${moonSign} (${getSignName(moonSign)}) ${Math.floor(moonDegrees)}° ${moonMinutes.toFixed(0)}'`);
    
    // Проверяваме тригон към Меркурий във Водолей 2°56'
    // Водолей започва от 300°, така че Меркурий е на 302°56' = 302.933°
    const mercuryNatal = 302.933;
    
    // Тригон = 120° разлика
    const aspectAngle = Math.abs(moonLong - mercuryNatal);
    const normalizedAngle = aspectAngle > 180 ? 360 - aspectAngle : aspectAngle;
    const orbFromTrine = Math.abs(normalizedAngle - 120);
    
    console.log(`\nAspect to Mercury at 302.933° (Aquarius 2°56'):`);
    console.log(`  Angle: ${normalizedAngle.toFixed(2)}°`);
    console.log(`  Orb from trine (120°): ${orbFromTrine.toFixed(2)}°`);
    
    if (orbFromTrine <= 1.0) {
      console.log(`  ✓ TRINE ASPECT FOUND! Orb: ${orbFromTrine.toFixed(2)}°`);
    }
  }
}

function getSignName(index) {
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                 "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  return signs[index] || "Unknown";
}

console.log("\n=== END OF TEST ===");