// test-sun-progressions.js
// Тестов файл за проверка на прогресивното Слънце
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const swisseph = require('swisseph');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EPHE_PATH = process.env.EPHE_PATH || path.join(__dirname, "./swisseph-master/ephe");
swisseph.swe_set_ephe_path(EPHE_PATH);

console.log("=== TESTING SUN PROGRESSIONS ===\n");

// Входни данни
const birthData = {
  year: 1982,
  month: 2,
  day: 13,
  hour: 17,
  minute: 13,
  second: 0
};

// За България през февруари 1982 - UTC+2 (EET)
const timezoneOffset = 2;
const utHour = birthData.hour - timezoneOffset + birthData.minute/60 + birthData.second/3600;

// Изчисляваме натална юлианска дата
const natalJD = swisseph.swe_julday(
  birthData.year,
  birthData.month,
  birthData.day,
  utHour,
  swisseph.SE_GREG_CAL
);

// Изчисляваме натално Слънце
const natalSunResult = swisseph.swe_calc_ut(natalJD, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH);
const natalSunLong = natalSunResult.longitude;

console.log(`Natal Sun: ${natalSunLong.toFixed(6)}° (${getZodiacPosition(natalSunLong)})`);

// Тестваме прогресивното Слънце за различни години
const testYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

console.log("\n=== PROGRESSED SUN POSITIONS ===");
console.log("Year | Age  | Prog. Sun Position      | Movement from Natal | Daily Motion");
console.log("-".repeat(80));

for (const year of testYears) {
  // За 1 януари на всяка година
  const targetJD = swisseph.swe_julday(year, 1, 1, 12, swisseph.SE_GREG_CAL);
  
  const daysDiff = targetJD - natalJD;
  const yearsDiff = daysDiff / 365.25;
  
  // Прогресивна дата
  const progressedJD = natalJD + yearsDiff;
  
  // Изчисляваме прогресивното Слънце
  const progSunResult = swisseph.swe_calc_ut(progressedJD, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED);
  const progSunLong = progSunResult.longitude;
  const progSunSpeed = progSunResult.longitudeSpeed;
  
  const movement = progSunLong - natalSunLong;
  
  console.log(`${year} | ${yearsDiff.toFixed(1)} | ${progSunLong.toFixed(6)}° ${getZodiacPosition(progSunLong).padEnd(15)} | ${movement > 0 ? '+' : ''}${movement.toFixed(2)}° | ${progSunSpeed.toFixed(6)}°/day`);
}

// Намираме кога прогресивното Слънце ще направи важни аспекти
console.log("\n=== SEARCHING FOR SUN ASPECTS IN 2025-2026 ===");

// Изчисляваме всички натални позиции
const natalPositions = {};

// Натални планети
const planets = {
  "Sun": swisseph.SE_SUN,
  "Moon": swisseph.SE_MOON,
  "Mercury": swisseph.SE_MERCURY,
  "Venus": swisseph.SE_VENUS,
  "Mars": swisseph.SE_MARS,
  "Jupiter": swisseph.SE_JUPITER,
  "Saturn": swisseph.SE_SATURN,
  "Uranus": swisseph.SE_URANUS,
  "Neptune": swisseph.SE_NEPTUNE,
  "Pluto": swisseph.SE_PLUTO
};

for (const [name, index] of Object.entries(planets)) {
  const result = swisseph.swe_calc_ut(natalJD, index, swisseph.SEFLG_SWIEPH);
  if (!result.error) {
    natalPositions[name] = result.longitude;
  }
}

// Натални домове за Плевен
const houses = swisseph.swe_houses(natalJD, 43.4167, 24.6167, 'P');
if (houses && houses.ascendant) {
  natalPositions["ASC"] = houses.ascendant;
  natalPositions["MC"] = houses.mc;
  natalPositions["IC"] = (houses.mc + 180) % 360;
  natalPositions["DSC"] = (houses.ascendant + 180) % 360;
}

console.log("\nNatal positions to check:");
for (const [name, long] of Object.entries(natalPositions)) {
  console.log(`${name}: ${long.toFixed(2)}° (${getZodiacPosition(long)})`);
}

// Проверяваме за аспекти през 2025-2026
console.log("\n=== SUN ASPECTS FOUND ===");

const aspects = [
  { name: "Conjunction", symbol: "☌", angle: 0, orb: 1.1 },
  { name: "Sextile", symbol: "⚹", angle: 60, orb: 1.1 },
  { name: "Square", symbol: "□", angle: 90, orb: 1.1 },
  { name: "Trine", symbol: "△", angle: 120, orb: 1.1 },
  { name: "Opposition", symbol: "☍", angle: 180, orb: 1.1 }
];

// Проверяваме всеки месец през 2025-2026
for (let year = 2025; year <= 2026; year++) {
  for (let month = 1; month <= 12; month++) {
    const testJD = swisseph.swe_julday(year, month, 15, 12, swisseph.SE_GREG_CAL);
    const yearsDiff = (testJD - natalJD) / 365.25;
    const progressedJD = natalJD + yearsDiff;
    
    const progSunResult = swisseph.swe_calc_ut(progressedJD, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH);
    const progSunLong = progSunResult.longitude;
    
    // Проверяваме аспекти към всички натални точки
    for (const [natalPoint, natalLong] of Object.entries(natalPositions)) {
      let angle = Math.abs(progSunLong - natalLong);
      if (angle > 180) angle = 360 - angle;
      
      for (const aspect of aspects) {
        const orb = Math.abs(angle - aspect.angle);
        if (orb <= aspect.orb) {
          console.log(`${year}-${String(month).padStart(2, '0')}: Prog. Sun ${aspect.symbol} Natal ${natalPoint} (orb: ${orb.toFixed(2)}°)`);
          console.log(`  Prog. Sun: ${progSunLong.toFixed(2)}° (${getZodiacPosition(progSunLong)})`);
          console.log(`  Natal ${natalPoint}: ${natalLong.toFixed(2)}° (${getZodiacPosition(natalLong)})`);
          console.log("");
        }
      }
    }
  }
}

function getZodiacPosition(longitude) {
  const signs = ["Ari", "Tau", "Gem", "Can", "Leo", "Vir", "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis"];
  const sign = Math.floor(longitude / 30);
  const degrees = Math.floor(longitude % 30);
  const minutes = Math.floor((longitude % 1) * 60);
  return `${signs[sign]} ${degrees}°${String(minutes).padStart(2, '0')}'`;
}

console.log("\n=== END OF TEST ===");