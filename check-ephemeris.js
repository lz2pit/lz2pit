// check-ephemeris.js
import swisseph from "swisseph";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("=== Swiss Ephemeris Check ===");

// Проверяваме различни възможни пътища
const possiblePaths = [
  "./swisseph-master/ephe",
  "../swisseph-master/ephe",
  "./ephe",
  "../ephe",
  path.join(__dirname, "../swisseph-master/ephe"),
  path.join(__dirname, "./swisseph-master/ephe"),
  path.join(__dirname, "../ephe"),
  path.join(__dirname, "./ephe"),
  "/root/astrology-app2/swisseph-master/ephe"
];

console.log("\nSearching for ephemeris files in:");
for (const p of possiblePaths) {
  const absPath = path.resolve(p);
  console.log(`- ${absPath}: ${fs.existsSync(absPath) ? "EXISTS" : "NOT FOUND"}`);
  
  if (fs.existsSync(absPath)) {
    console.log("  Files found:");
    const files = fs.readdirSync(absPath);
    files.slice(0, 5).forEach(f => console.log(`    - ${f}`));
    if (files.length > 5) console.log(`    ... and ${files.length - 5} more files`);
  }
}

// Тестваме основна функционалност
console.log("\n=== Testing Basic Functionality ===");

const EPHE_PATH = process.env.EPHE_PATH || path.join(__dirname, "../swisseph-master/ephe");
console.log("Setting ephemeris path to:", EPHE_PATH);
swisseph.swe_set_ephe_path(EPHE_PATH);

try {
  // Тест за 13 февруари 1982, 17:13:00 UTC+2
  const year = 1982, month = 2, day = 13;
  const hour = 17 - 2; // Конвертираме към UTC
  const minute = 13;
  const second = 0;
  
  const jd = swisseph.swe_julday(year, month, day, hour + minute/60 + second/3600, swisseph.SE_GREG_CAL);
  console.log("\nJulian Day for 1982-02-13 17:13:00 EET:", jd);
  
  // Тестваме Слънцето
  console.log("\nTesting Sun position:");
  const sunResult = swisseph.swe_calc_ut(jd, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH);
  if (sunResult.error) {
    console.error("ERROR:", sunResult.error);
  } else {
    const longitude = sunResult.longitude;
    const sign = Math.floor(longitude / 30);
    const degrees = Math.floor(longitude % 30);
    const minutes = Math.floor((longitude % 1) * 60);
    const seconds = Math.round((((longitude % 1) * 60) % 1) * 60);
    console.log(`Sun longitude: ${longitude.toFixed(6)}°`);
    console.log(`Sun position: Sign ${sign} (Aquarius), ${degrees}° ${minutes}' ${seconds}"`);
  }
  
  // Тестваме домовете за Плевен
  console.log("\nTesting houses for Pleven (43.4167°N, 24.6167°E):");
  const houses = swisseph.swe_houses(jd, 43.4167, 24.6167, 'P');
  if (houses.error) {
    console.error("ERROR:", houses.error);
  } else {
    console.log("Ascendant:", houses.ascendant?.toFixed(6), "°");
    console.log("MC:", houses.mc?.toFixed(6), "°");
    console.log("House cusps:", houses.house?.map((h, i) => `House ${i+1}: ${h.toFixed(2)}°`).slice(0, 4).join(", "), "...");
  }
  
} catch (error) {
  console.error("\nERROR during testing:", error);
  console.error("Stack trace:", error.stack);
}

console.log("\n=== End of Check ===");
