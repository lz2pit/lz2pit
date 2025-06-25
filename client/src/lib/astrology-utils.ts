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
    "Слънце": "hsl(var(--astro-sun))",
    "Луна": "hsl(var(--astro-moon))",
    "Меркурий": "hsl(var(--astro-mercury))",
    "Венера": "hsl(var(--astro-venus))",
    "Марс": "hsl(var(--astro-mars))",
    "Юпитер": "hsl(var(--astro-jupiter))",
    "Сатурн": "hsl(var(--astro-saturn))",
    "Уран": "hsl(var(--astro-uranus))",
    "Нептун": "hsl(var(--astro-neptune))",
    "Плутон": "hsl(var(--astro-pluto))"
  };
  return colorMap[planetName] || "hsl(var(--foreground))";
}

export function getPlanetSymbol(planetName: string): string {
  const symbolMap: { [key: string]: string } = {
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
  return symbolMap[planetName] || "?";
}

export function getAspectColor(aspectType: string): string {
  const colorMap: { [key: string]: string } = {
    "Съвпад": "#ff0000",      // червено
    "Опозиция": "#ff6600",    // оранжево
    "Квадратура": "#ff9900",  // жълто-оранжево
    "Тригон": "#0066ff",      // синьо
    "Секстил": "#00cc00"      // зелено
  };
  return colorMap[aspectType] || "#666666";
}

export function getAspectSymbol(aspectType: string): string {
  const symbolMap: { [key: string]: string } = {
    "Съвпад": "☌",
    "Секстил": "⚹",
    "Квадратура": "□",
    "Тригон": "△",
    "Опозиция": "☍"
  };
  return symbolMap[aspectType] || "?";
}

