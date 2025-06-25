const swe = require('sweph');

class AstrologyCalculator {
    constructor() {
        console.log("Астрологичен калкулатор инициализиран със Swiss Ephemeris");
        swe.set_ephe_path('/root/astrology-app/swisseph-master/ephe');
    }

    async getCoordinates(city, country) {
        const lower = city.toLowerCase();
        if (lower === 'плевен') return { lat: 43.4167, lng: 24.6167, city: 'Плевен', country };
        return { lat: 42.7, lng: 23.3, city, country }; // София като fallback
    }

    async getCitySuggestions(query) {
        const cities = ["София", "Пловдив", "Варна", "Бургас", "Русе", "Плевен"];
        return cities
            .filter(c => c.toLowerCase().includes(query.toLowerCase()))
            .map(c => ({ city: c, country: "България" }));
    }

    async calculateNatalChart(birthData, coordinates) {
        const date = new Date(Date.UTC(
            birthData.year, birthData.month - 1, birthData.day,
            birthData.hour, birthData.minute, birthData.second || 0
        ));

        const ut = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
        const jd_ut = swe.julday(
            date.getUTCFullYear(),
            date.getUTCMonth() + 1,
            date.getUTCDate(),
            ut,
            swe.constants.SE_GREG_CAL
        );

        const planetList = [
            swe.constants.SE_SUN, swe.constants.SE_MOON, swe.constants.SE_MERCURY,
            swe.constants.SE_VENUS, swe.constants.SE_MARS, swe.constants.SE_JUPITER,
            swe.constants.SE_SATURN, swe.constants.SE_URANUS, swe.constants.SE_NEPTUNE,
            swe.constants.SE_PLUTO
        ];

        const planetNames = ['Слънце','Луна','Меркурий','Венера','Марс','Юпитер','Сатурн','Уран','Нептун','Плутон'];
        const planets = {};

        planetList.forEach((planet, i) => {
            const res = swe.calc_ut(jd_ut, planet, swe.constants.SEFLG_SWIEPH);
            planets[planetNames[i]] = {
                longitude: res[0],
                sign: this.getZodiacSign(res[0]),
                degree: Math.floor(res[0] % 30),
                minutes: Math.floor(((res[0] % 30) % 1) * 60),
                seconds: Math.round(((((res[0] % 30) % 1) * 60) % 1) * 60)
            };
        });

        const houses = this.calculateHouses(jd_ut, coordinates.lat, coordinates.lng);

        return { birthData, coordinates, planets, houses };
    }

    calculateHouses(jd_ut, lat, lon) {
        const result = swe.houses(jd_ut, lat, lon, 'P');

        if (!result.data || !result.data.houses || result.data.houses.length !== 12) {
            throw new Error("Грешка при изчисление на домове: липсват cusp стойности");
        }

        const cusps = result.data.houses;
        const ascmc = result.data.points;

        const houses = cusps.map((cusp, i) => ({
            cusp,
            sign: this.getZodiacSign(cusp),
            degree: Math.floor(cusp % 30),
            minutes: Math.floor(((cusp % 30) % 1) * 60)
        }));

        houses.ASC = ascmc[0];
        houses.MC = ascmc[1];

        return houses;
    }

    getZodiacSign(degree) {
        const signs = ['Овен','Телец','Близнаци','Рак','Лъв','Дева','Везни','Скорпион','Стрелец','Козирог','Водолей','Риби'];
        return signs[Math.floor(degree / 30) % 12];
    }

    async calculateForecast(birthData, coordinates) {
        const now = new Date();
        const ut = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
        const jd_ut = swe.julday(
            now.getUTCFullYear(),
            now.getUTCMonth() + 1,
            now.getUTCDate(),
            ut,
            swe.constants.SE_GREG_CAL
        );

        const planetList = [
            swe.constants.SE_SUN, swe.constants.SE_MOON, swe.constants.SE_MERCURY,
            swe.constants.SE_VENUS, swe.constants.SE_MARS, swe.constants.SE_JUPITER,
            swe.constants.SE_SATURN, swe.constants.SE_URANUS, swe.constants.SE_NEPTUNE,
            swe.constants.SE_PLUTO
        ];

        const planetNames = ['Слънце','Луна','Меркурий','Венера','Марс','Юпитер','Сатурн','Уран','Нептун','Плутон'];
        const transits = {};

        planetList.forEach((planet, i) => {
            const res = swe.calc_ut(jd_ut, planet, swe.constants.SEFLG_SWIEPH);
            transits[planetNames[i]] = {
                longitude: res[0],
                sign: this.getZodiacSign(res[0]),
                degree: Math.floor(res[0] % 30),
                minutes: Math.floor(((res[0] % 30) % 1) * 60),
                seconds: Math.round(((((res[0] % 30) % 1) * 60) % 1) * 60)
            };
        });

        return { date: now, transits };
    }
}

module.exports = AstrologyCalculator;
