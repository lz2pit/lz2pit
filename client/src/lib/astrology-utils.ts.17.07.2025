export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function formatDegreeMinutesSeconds(degree: number, minutes: number, seconds: number): string {
  return `${degree}°${minutes}'${seconds}"`;
}

export function getPlanetColor(planetName: string): string {
  const colorMap: { [key: string]: string } = {
    // Български имена
    "Слънце": "hsl(var(--astro-sun))",
    "Луна": "hsl(var(--astro-moon))",
    "Меркурий": "hsl(var(--astro-mercury))",
    "Венера": "hsl(var(--astro-venus))",
    "Марс": "hsl(var(--astro-mars))",
    "Юпитер": "hsl(var(--astro-jupiter))",
    "Сатурн": "hsl(var(--astro-saturn))",
    "Уран": "hsl(var(--astro-uranus))",
    "Нептун": "hsl(var(--astro-neptune))",
    "Плутон": "hsl(var(--astro-pluto))",
    
    // Английски имена (от Swiss Ephemeris)
    "Sun": "hsl(var(--astro-sun))",
    "Moon": "hsl(var(--astro-moon))",
    "Mercury": "hsl(var(--astro-mercury))",
    "Venus": "hsl(var(--astro-venus))",
    "Mars": "hsl(var(--astro-mars))",
    "Jupiter": "hsl(var(--astro-jupiter))",
    "Saturn": "hsl(var(--astro-saturn))",
    "Uranus": "hsl(var(--astro-uranus))",
    "Neptune": "hsl(var(--astro-neptune))",
    "Pluto": "hsl(var(--astro-pluto))",
    
    // Символи (ако се подават директно)
    "☉": "hsl(var(--astro-sun))",
    "☽": "hsl(var(--astro-moon))",
    "☿": "hsl(var(--astro-mercury))",
    "♀": "hsl(var(--astro-venus))",
    "♂": "hsl(var(--astro-mars))",
    "♃": "hsl(var(--astro-jupiter))",
    "♄": "hsl(var(--astro-saturn))",
    "♅": "hsl(var(--astro-uranus))",
    "♆": "hsl(var(--astro-neptune))",
    "♇": "hsl(var(--astro-pluto))"
  };
  return colorMap[planetName] || "hsl(var(--foreground))";
}

export function getPlanetSymbol(planetName: string): string {
  const symbolMap: { [key: string]: string } = {
    // Български имена
    "Слънце": "☉",
    "Луна": "☽",
    "Меркурий": "☿",
    "Венера": "♀",
    "Марс": "♂",
    "Юпитер": "♃",
    "Сатурн": "♄",
    "Уран": "♅",
    "Нептун": "♆",
    "Плутон": "♇",
    
    // Английски имена (от Swiss Ephemeris)
    "Sun": "☉",
    "Moon": "☽",
    "Mercury": "☿",
    "Venus": "♀",
    "Mars": "♂",
    "Jupiter": "♃",
    "Saturn": "♄",
    "Uranus": "♅",
    "Neptune": "♆",
    "Pluto": "♇",
    
    // Асцендент и MC
    "Асцендент": "ASC",
    "Ascendant": "ASC",
    "ASC": "ASC",
    "MC": "MC",
    "Midheaven": "MC",
    "IC": "IC",
    "DSC": "DSC",
    "Descendant": "DSC",
    
    // Ако вече е символ, връщаме го
    "☉": "☉",
    "☽": "☽",
    "☿": "☿",
    "♀": "♀",
    "♂": "♂",
    "♃": "♃",
    "♄": "♄",
    "♅": "♅",
    "♆": "♆",
    "♇": "♇"
  };
  
  return symbolMap[planetName] || planetName;
}

export function getAspectColor(aspectType: string): string {
  const colorMap: { [key: string]: string } = {
    // Български
    "Съвпад": "#ff0000",      // червено
    "Опозиция": "#ff6600",    // оранжево
    "Квадратура": "#ff9900",  // жълто-оранжево
    "Тригон": "#0066ff",      // синьо
    "Секстил": "#00cc00",     // зелено
    
    // Английски
    "Conjunction": "#ff0000",
    "Opposition": "#ff6600",
    "Square": "#ff9900",
    "Trine": "#0066ff",
    "Sextile": "#00cc00",
    
    // Символи
    "☌": "#ff0000",
    "☍": "#ff6600",
    "□": "#ff9900",
    "△": "#0066ff",
    "⚹": "#00cc00"
  };
  return colorMap[aspectType] || "#666666";
}

export function getAspectSymbol(aspectType: string): string {
  const symbolMap: { [key: string]: string } = {
    // Български
    "Съвпад": "☌",
    "Секстил": "⚹",
    "Квадратура": "□",
    "Тригон": "△",
    "Опозиция": "☍",
    
    // Английски
    "Conjunction": "☌",
    "Sextile": "⚹",
    "Square": "□",
    "Trine": "△",
    "Opposition": "☍",
    
    // Ако вече е символ
    "☌": "☌",
    "⚹": "⚹",
    "□": "□",
    "△": "△",
    "☍": "☍"
  };
  return symbolMap[aspectType] || aspectType;
}