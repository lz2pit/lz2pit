import swisseph from 'swisseph';
import path from 'path';
import type { BirthData, Coordinates } from '@shared/schema';

const ephePath = process.env.EPHE_PATH || './swisseph-master/ephe';
swisseph.swe_set_ephe_path(path.resolve(ephePath));

// Примерен масив с градове
const cities = [
  { name: 'Плевен', country: 'България', latitude: 43.417, longitude: 24.617 },
  { name: 'София', country: 'България', latitude: 42.6975, longitude: 23.3242 },
  { name: 'Варна', country: 'България', latitude: 43.214, longitude: 27.914 },
];

async function getCoordinates(city: string, country: string) {
  const result = cities.find(
    c => c.name.toLowerCase() === city.toLowerCase() &&
         c.country.toLowerCase() === country.toLowerCase()
  );
  if (!result) throw new Error('Не са намерени координати за този град');
  return { lat: result.latitude, lon: result.longitude };
}

async function getCitySuggestions(query: string) {
  return cities
    .filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    .map(c => c.name)
    .slice(0, 10);
}

async function calculateNatalChart(birthData: BirthData, coordinates: Coordinates) {
  const { year, month, day, hour, minute, second } = birthData;
  const ut = hour + minute / 60 + second / 3600;
  const jd = swisseph.swe_julday(year, month, day, ut, swisseph.SE_GREG_CAL);

  const planetIds = [
    swisseph.SE_SUN,
    swisseph.SE_MOON,
    swisseph.SE_MERCURY,
    swisseph.SE_VENUS,
    swisseph.SE_MARS,
    swisseph.SE_JUPITER,
    swisseph.SE_SATURN,
    swisseph.SE_URANUS,
    swisseph.SE_NEPTUNE,
    swisseph.SE_PLUTO
  ];

  const natalPlanets = planetIds.map(id => {
    const { longitude, speed } = swisseph.swe_calc_ut(jd, id, swisseph.SEFLG_SWIEPH);
    return {
      id,
      name: swisseph.swe_get_planet_name(id),
      lon: longitude,
      isRetrograde: speed < 0
    };
  });

  const houseCusps = swisseph.swe_houses(jd, coordinates.lat, coordinates.lon, 'P');
  const houses = houseCusps.cusps.slice(1, 13).map((cusp: number, index: number) => ({
    house: index + 1,
    lon: cusp
  }));

  const ascendant = houseCusps.ascendant;
  const mc = houseCusps.mc;

  return {
    birthData,
    coordinates,
    planets: natalPlanets,
    houses,
    ascendant,
    mc
  };
}

interface Transit {
  transitPlanet: string;
  aspect: string;
  symbol: string;
  natalPoint: string;
  orb: string;
  isRetrograde?: boolean;
}

interface DayForecast {
  date: string;
  outerPlanets: Transit[];
  venus: Transit[];
  mars: Transit[];
  mercuryRetro: Transit[];
  progressions: Transit[];
}

async function calculateForecast(
  birthData: BirthData,
  coordinates: Coordinates,
  startDate: string,
  endDate: string
): Promise<DayForecast[]> {
  const forecast: DayForecast[] = [];
  const natalChart = await calculateNatalChart(birthData, coordinates);

  const start = new Date(startDate);
  const end = new Date(endDate);

  const aspects = [
    { name: 'Съвпад', degree: 0, orb: 1 },
    { name: 'Опозиция', degree: 180, orb: 1 },
    { name: 'Квадратура', degree: 90, orb: 1 },
    { name: 'Тригон', degree: 120, orb: 1 },
    { name: 'Секстил', degree: 60, orb: 1 }
  ];

  const natalPoints = [
    ...natalChart.planets,
    { name: 'Асцендент', lon: natalChart.ascendant },
    { name: 'MC', lon: natalChart.mc },
    ...natalChart.houses.map(h => ({ name: `Дом ${h.house}`, lon: h.lon }))
  ];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateString = d.toISOString().split('T')[0];
    const jd = swisseph.swe_julday(d.getFullYear(), d.getMonth() + 1, d.getDate(), 0, swisseph.SE_GREG_CAL);

    const dayForecast: DayForecast = {
      date: dateString,
      outerPlanets: [],
      venus: [],
      mars: [],
      mercuryRetro: [],
      progressions: []
    };

    const transitPlanetIds = [
      swisseph.SE_JUPITER,
      swisseph.SE_SATURN,
      swisseph.SE_URANUS,
      swisseph.SE_NEPTUNE,
      swisseph.SE_PLUTO,
      swisseph.SE_VENUS,
      swisseph.SE_MARS,
      swisseph.SE_MERCURY
    ];

    for (const transitId of transitPlanetIds) {
      const { longitude: transitLon, speed: transitSpeed } = swisseph.swe_calc_ut(jd, transitId, swisseph.SEFLG_SWIEPH);
      const transitPlanetName = swisseph.swe_get_planet_name(transitId);
      const isRetrograde = transitSpeed < 0;

      for (const natalPoint of natalPoints) {
        for (const aspect of aspects) {
          const diff = Math.abs(transitLon - natalPoint.lon);
          const exactDiff = Math.min(diff, 360 - diff);

          if (Math.abs(exactDiff - aspect.degree) <= 0.1) { // Exact aspect with a small tolerance
            const newTransit: Transit = {
              transitPlanet: transitPlanetName,
              aspect: aspect.name,
              symbol: getAspectSymbol(aspect.name),
              natalPoint: natalPoint.name,
              orb: exactDiff.toFixed(2),
              isRetrograde: isRetrograde
            };

            if ([swisseph.SE_JUPITER, swisseph.SE_SATURN, swisseph.SE_URANUS, swisseph.SE_NEPTUNE, swisseph.SE_PLUTO].includes(transitId)) {
              dayForecast.outerPlanets.push(newTransit);
            } else if (transitId === swisseph.SE_VENUS && ['Съвпад', 'Секстил', 'Тригон'].includes(aspect.name)) {
              dayForecast.venus.push(newTransit);
            } else if (transitId === swisseph.SE_MARS && ['Съвпад', 'Квадратура', 'Опозиция'].includes(aspect.name)) {
              dayForecast.mars.push(newTransit);
            } else if (transitId === swisseph.SE_MERCURY && isRetrograde) {
              dayForecast.mercuryRetro.push(newTransit);
            }
          }
        }
      }
    }

    // Calculate Progressions (Secondary Progressions - Day for a Year)
    const birthDate = new Date(birthData.year, birthData.month - 1, birthData.day, birthData.hour, birthData.minute, birthData.second);
    const daysSinceBirth = (d.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24);
    const progressedYears = daysSinceBirth; // Day for a year progression

    // Calculate progressed chart for the current day 'd'
    const progressedJdForCalc = swisseph.swe_julday(
      birthData.year,
      birthData.month,
      birthData.day,
      birthData.hour + birthData.minute / 60 + birthData.second / 3600 + progressedYears, // Add progressed years to UT
      swisseph.SE_GREG_CAL
    );

    const progressedPlanetIds = [
      swisseph.SE_SUN,
      swisseph.SE_MOON,
      swisseph.SE_MERCURY,
      swisseph.SE_VENUS,
      swisseph.SE_MARS,
      swisseph.SE_JUPITER,
      swisseph.SE_SATURN,
      swisseph.SE_URANUS,
      swisseph.SE_NEPTUNE,
      swisseph.SE_PLUTO
    ];

    for (const progId of progressedPlanetIds) {
      const { longitude: progLon, speed: progSpeed } = swisseph.swe_calc_ut(progressedJdForCalc, progId, swisseph.SEFLG_SWIEPH);
      const progPlanetName = swisseph.swe_get_planet_name(progId);
      const isRetrograde = progSpeed < 0;

      for (const natalPoint of natalPoints) {
        for (const aspect of aspects) {
          const diff = Math.abs(progLon - natalPoint.lon);
          const exactDiff = Math.min(diff, 360 - diff);

          if (Math.abs(exactDiff - aspect.degree) <= 0.1) { // Exact aspect with a small tolerance
            const newProgression: Transit = {
              transitPlanet: progPlanetName,
              aspect: aspect.name,
              symbol: getAspectSymbol(aspect.name),
              natalPoint: natalPoint.name,
              orb: exactDiff.toFixed(2),
              isRetrograde: isRetrograde
            };
            dayForecast.progressions.push(newProgression);
          }
        }
      }
    }

    if (dayForecast.outerPlanets.length > 0 ||
        dayForecast.venus.length > 0 ||
        dayForecast.mars.length > 0 ||
        dayForecast.mercuryRetro.length > 0 ||
        dayForecast.progressions.length > 0) {
      forecast.push(dayForecast);
    }
  }

  return forecast;
}

function getAspectSymbol(aspectType: string): string {
  const symbolMap: { [key: string]: string } = {
    'Съвпад': '☌',
    'Секстил': '⚹',
    'Квадратура': '□',
    'Тригон': '△',
    'Опозиция': '☍'
  };
  return symbolMap[aspectType] || '?';
}

// ⬇️ ТОВА Е КЛЮЧЪТ: експортирай обект с всички функции като default!
export default {
  getCoordinates,
  getCitySuggestions,
  calculateNatalChart,
  calculateForecast
};


