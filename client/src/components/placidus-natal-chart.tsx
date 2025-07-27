import React from 'react';

interface Planet {
  longitude: number;
  sign: {
    name: string;
    symbol: string;
  };
  degree: number;
  minutes: number;
  seconds: number;
  house: number;
  symbol: string;
  motionType?: string;
}

interface House {
  longitude: number;
  sign: {
    name: string;
    symbol: string;
  };
  degree: number;
  minutes: number;
  seconds: number;
  name: string;
}

interface NatalChartData {
  planets: Record<string, Planet>;
  houses: Record<string, House>;
  birthData: any;
}

interface PlacidusNatalChartProps {
  data: NatalChartData | null;
}

const PlacidusNatalChart: React.FC<PlacidusNatalChartProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Няма данни за натална карта</p>
      </div>
    );
  }

  const { planets, houses, birthData } = data;
  
  // Конвертиране на планетите от обект в масив с правилен формат
  const planetPositions = Object.entries(planets).reduce((acc, [name, planet]) => {
    const planetName = name.toLowerCase().replace('ъ', 'u');
    acc[planetName] = {
      degree: planet.longitude,
      minutes: planet.minutes,
      seconds: planet.seconds,
      sign: planet.sign.name,
      house: planet.house,
      symbol: planet.symbol,
      retrograde: planet.motionType === 'R'
    };
    return acc;
  }, {} as any);

  // Конвертиране на домовете от обект в масив
  const housesArray = Object.entries(houses).map(([key, house]) => {
    const houseNumber = key === "Дом 1" ? 1 :
                       key === "Дом 2" ? 2 :
                       key === "Дом 3" ? 3 :
                       key === "Дом 4" ? 4 :
                       key === "Дом 5" ? 5 :
                       key === "Дом 6" ? 6 :
                       key === "Дом 7" ? 7 :
                       key === "Дом 8" ? 8 :
                       key === "Дом 9" ? 9 :
                       key === "Дом 10" ? 10 :
                       key === "Дом 11" ? 11 : 12;
    
    return {
      number: houseNumber,
      degree: house.longitude,
      minutes: house.minutes,
      seconds: house.seconds,
      sign: house.sign.name
    };
  }).sort((a, b) => a.number - b.number);

  const signs = [
    { name: 'Aries', symbol: '♈', degree: 0, color: '#FF0000' },
    { name: 'Taurus', symbol: '♉', degree: 30, color: '#228B22' },
    { name: 'Gemini', symbol: '♊', degree: 60, color: '#FFD700' },
    { name: 'Cancer', symbol: '♋', degree: 90, color: '#C0C0C0' },
    { name: 'Leo', symbol: '♌', degree: 120, color: '#FF8C00' },
    { name: 'Virgo', symbol: '♍', degree: 150, color: '#8B4513' },
    { name: 'Libra', symbol: '♎', degree: 180, color: '#FF69B4' },
    { name: 'Scorpio', symbol: '♏', degree: 210, color: '#8B0000' },
    { name: 'Sagittarius', symbol: '♐', degree: 240, color: '#1E90FF' },
    { name: 'Capricorn', symbol: '♑', degree: 270, color: '#2F4F4F' },
    { name: 'Aquarius', symbol: '♒', degree: 300, color: '#00CED1' },
    { name: 'Pisces', symbol: '♓', degree: 330, color: '#9370DB' }
  ];

  // SVG параметри
  const svgSize = 700;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const outerRadius = 320;
  const signInnerRadius = 280;
  const degreeInnerRadius = 260;
  const houseRadius = 220;
  const planetOrbitRadius = 190;
  const innerCircleRadius = 40;

  // Конвертиране на градуси в радиани
  // ASC-DSC трябва да са перфектно хоризонтални
  const degreeToRadian = (degree) => {
    // ASC трябва да е точно на 180° (хоризонтално ляво)
    const ascDegree = housesArray[0].degree; // Първия дом е ASC
    const adjustedDegree = -(degree - ascDegree + 180);
    return (adjustedDegree) * Math.PI / 180;
  };

  // Конвертиране от полярни в декартови координати
  const polarToCartesian = (cx, cy, radius, angleInDegrees) => {
    const angleInRadians = degreeToRadian(angleInDegrees);
    return {
      x: cx + (radius * Math.cos(angleInRadians)),
      y: cy + (radius * Math.sin(angleInRadians))
    };
  };

  // Чертаене на градусните маркери
  const drawDegreeMarks = () => {
    const marks = [];
    for (let i = 0; i < 360; i++) {
      const is5Degree = i % 5 === 0;
      const is10Degree = i % 10 === 0;
      const is30Degree = i % 30 === 0;
      
      let markStart = degreeInnerRadius;
      let markEnd = signInnerRadius;
      let strokeWidth = 0.5;
      
      if (is30Degree) {
        markStart = degreeInnerRadius - 5;
        strokeWidth = 2;
      } else if (is10Degree) {
        markEnd = signInnerRadius - 8;
        strokeWidth = 1;
      } else if (is5Degree) {
        markEnd = signInnerRadius - 5;
        strokeWidth = 0.5;
      } else {
        markEnd = signInnerRadius - 3;
        strokeWidth = 0.3;
      }
      
      const innerPoint = polarToCartesian(centerX, centerY, markStart, i);
      const outerPoint = polarToCartesian(centerX, centerY, markEnd, i);
      
      marks.push(
        <line
          key={`mark-${i}`}
          x1={innerPoint.x}
          y1={innerPoint.y}
          x2={outerPoint.x}
          y2={outerPoint.y}
          stroke="#000000"
          strokeWidth={strokeWidth}
        />
      );
    }
    return marks;
  };

  // Чертаене на градусните числа във външния пръстен
  const drawDegreeNumbers = () => {
    const numbers = [];
    
    signs.forEach((sign) => {
      for (let deg = 0; deg < 30; deg += 10) {
        if (deg === 0) continue;
        const actualDegree = sign.degree + deg;
        const position = polarToCartesian(centerX, centerY, (outerRadius + signInnerRadius) / 2 - 10, actualDegree);
        numbers.push(
          <text
            key={`deg-num-${actualDegree}`}
            x={position.x}
            y={position.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fill="#000"
          >
            {deg}°
          </text>
        );
      }
    });
    
    return numbers;
  };

  // Форматиране на градуси, минути и секунди
  const formatDMS = (degree, minutes, seconds) => {
    const degInSign = Math.floor(degree % 30);
    return `${degInSign}°${minutes < 10 ? '0' : ''}${minutes}'`;
  };

  // Проверка дали планетата е невидима
  const isInvisible = (planetName, planetDegree) => {
    const sunDegree = planetPositions.слънце?.degree || planetPositions.sun?.degree;
    return planetName === 'mercury' && sunDegree && Math.abs(planetDegree - sunDegree) < 15;
  };

  // Разпределяне на планетите за избягване на припокриване
  const adjustPlanetPosition = (planets) => {
    const adjusted = {};
    const sortedPlanets = Object.entries(planets).sort((a, b) => a[1].degree - b[1].degree);
    
    const minDistance = 12;
    let lastDegree = -minDistance;
    let radiusIndex = 0;
    
    const radii = [
      planetOrbitRadius,
      planetOrbitRadius - 30,
      planetOrbitRadius + 25,
      planetOrbitRadius - 55,
      planetOrbitRadius + 50
    ];
    
    sortedPlanets.forEach(([name, planet]) => {
      if (planet.degree - lastDegree < minDistance) {
        radiusIndex = (radiusIndex + 1) % radii.length;
      } else {
        radiusIndex = 0;
      }
      
      adjusted[name] = { 
        ...planet, 
        radius: radii[radiusIndex],
        displayDegree: planet.degree
      };
      
      lastDegree = planet.degree;
    });
    
    return adjusted;
  };

  const adjustedPlanets = adjustPlanetPosition(planetPositions);

  return (
    <div className="flex flex-col items-center p-4 bg-white">
      <h2 className="text-xl font-bold mb-2">Натална карта - Placidus домова система</h2>
      <p className="text-sm text-gray-600 mb-4">
        {birthData.day}.{birthData.month}.{birthData.year} {birthData.hour}:{birthData.minute.toString().padStart(2, '0')}:00 {birthData.city}, {birthData.country}
      </p>
      
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} className="border border-gray-300">
        <defs>
          <radialGradient id="centerGradient">
            <stop offset="0%" stopColor="#E0E0E0" />
            <stop offset="100%" stopColor="#CCCCCC" />
          </radialGradient>
        </defs>
        
        {/* Външни кръгове */}
        <circle cx={centerX} cy={centerY} r={outerRadius} fill="none" stroke="#000" strokeWidth="2" />
        <circle cx={centerX} cy={centerY} r={signInnerRadius} fill="none" stroke="#000" strokeWidth="1.5" />
        <circle cx={centerX} cy={centerY} r={degreeInnerRadius} fill="none" stroke="#000" strokeWidth="1" />
        <circle cx={centerX} cy={centerY} r={houseRadius} fill="none" stroke="#000" strokeWidth="1" />
        <circle cx={centerX} cy={centerY} r={innerCircleRadius} fill="url(#centerGradient)" stroke="#000" strokeWidth="1" />
        
        {/* Градусни маркери */}
        {drawDegreeMarks()}
        
        {/* Зодиакални знаци */}
        {signs.map((sign) => {
          const lineStart = polarToCartesian(centerX, centerY, signInnerRadius, sign.degree);
          const lineEnd = polarToCartesian(centerX, centerY, outerRadius, sign.degree);
          const symbolPos = polarToCartesian(centerX, centerY, (outerRadius + signInnerRadius) / 2, sign.degree + 15);
          
          return (
            <g key={sign.name}>
              <line x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y} stroke="#000" strokeWidth="2" />
              <text x={symbolPos.x} y={symbolPos.y} textAnchor="middle" dominantBaseline="middle" fontSize="20" fill={sign.color} fontWeight="bold">
                {sign.symbol}
              </text>
            </g>
          );
        })}
        
        {/* Градусни числа */}
        {drawDegreeNumbers()}
        
        {/* Линии на домовете */}
        {housesArray.map((house, index) => {
          const isCardinal = [1, 4, 7, 10].includes(house.number);
          const houseStart = polarToCartesian(centerX, centerY, innerCircleRadius, house.degree);
          const houseEnd = polarToCartesian(centerX, centerY, houseRadius, house.degree);
          
          const nextHouse = housesArray[(index + 1) % 12];
          let midDegree = (house.degree + nextHouse.degree) / 2;
          if (nextHouse.degree < house.degree) {
            midDegree = (house.degree + nextHouse.degree + 360) / 2;
          }
          const numberPos = polarToCartesian(centerX, centerY, (houseRadius + innerCircleRadius) / 2, midDegree);
          const cuspPos = polarToCartesian(centerX, centerY, houseRadius + 10, house.degree);
          
          return (
            <g key={`house-${house.number}`}>
              <line x1={houseStart.x} y1={houseStart.y} x2={houseEnd.x} y2={houseEnd.y} stroke="#000" strokeWidth={isCardinal ? "2.5" : "1"} />
              <text x={numberPos.x} y={numberPos.y} textAnchor="middle" dominantBaseline="middle" fontSize="14" fill="#000" fontWeight={isCardinal ? "bold" : "normal"}>
                {house.number}
              </text>
              <text x={cuspPos.x} y={cuspPos.y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#000" fontWeight="normal">
                {formatDMS(house.degree, house.minutes, house.seconds)}
              </text>
            </g>
          );
        })}
        
        {/* Планети */}
        {Object.entries(adjustedPlanets).map(([name, planet]) => {
          const pos = polarToCartesian(centerX, centerY, planet.radius, planet.displayDegree);
          const labelPos = polarToCartesian(centerX, centerY, planet.radius - 30, planet.displayDegree);
          const invisible = isInvisible(name, planet.degree);
          
          const tickStart = polarToCartesian(centerX, centerY, signInnerRadius, planet.degree);
          const tickEnd = polarToCartesian(centerX, centerY, planet.radius + 10, planet.displayDegree);
          
          return (
            <g key={name}>
              <line x1={tickStart.x} y1={tickStart.y} x2={tickEnd.x} y2={tickEnd.y} stroke="#FF0000" strokeWidth="0.5" opacity="0.7" />
              <line
                x1={polarToCartesian(centerX, centerY, signInnerRadius - 3, planet.degree).x}
                y1={polarToCartesian(centerX, centerY, signInnerRadius - 3, planet.degree).y}
                x2={polarToCartesian(centerX, centerY, signInnerRadius + 3, planet.degree).x}
                y2={polarToCartesian(centerX, centerY, signInnerRadius + 3, planet.degree).y}
                stroke="#FF0000" strokeWidth="2"
              />
              <rect x={labelPos.x - 20} y={labelPos.y - 8} width="40" height="16" fill="white" opacity="0.9" />
              <text x={labelPos.x} y={labelPos.y} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#000" fontWeight="normal">
                {formatDMS(planet.degree, planet.minutes, planet.seconds)}
              </text>
              <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fontSize="22" fill={invisible ? "#FF0000" : "#000000"} fontWeight="normal">
                {planet.symbol}
              </text>
              {invisible && (
                <text x={pos.x + 10} y={pos.y + 10} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="#FF0000" fontWeight="normal">
                  x
                </text>
              )}
              {planet.retrograde && !invisible && (
                <text x={pos.x + 10} y={pos.y + 10} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="#FF0000" fontWeight="normal">
                  R
                </text>
              )}
            </g>
          );
        })}
        
        {/* Специални точки - ASC, MC, DSC, IC */}
        <g>
          {/* ASC */}
          <rect
            x={polarToCartesian(centerX, centerY, houseRadius + 35, housesArray[0].degree).x - 25}
            y={polarToCartesian(centerX, centerY, houseRadius + 35, housesArray[0].degree).y - 10}
            width="50" height="20" fill="white" opacity="0.9"
          />
          <text x={polarToCartesian(centerX, centerY, houseRadius + 35, housesArray[0].degree).x}
                y={polarToCartesian(centerX, centerY, houseRadius + 35, housesArray[0].degree).y}
                textAnchor="middle" fontSize="12" fill="#000" fontWeight="bold">
            ASC
          </text>
          
          {/* MC */}
          <text x={polarToCartesian(centerX, centerY, houseRadius + 25, housesArray[9].degree).x}
                y={polarToCartesian(centerX, centerY, houseRadius + 25, housesArray[9].degree).y}
                textAnchor="middle" fontSize="12" fill="#000" fontWeight="bold">
            MC
          </text>
          
          {/* DSC */}
          <text x={polarToCartesian(centerX, centerY, houseRadius + 35, housesArray[6].degree).x}
                y={polarToCartesian(centerX, centerY, houseRadius + 35, housesArray[6].degree).y}
                textAnchor="middle" fontSize="12" fill="#000" fontWeight="bold">
            DSC
          </text>
          
          {/* IC */}
          <text x={polarToCartesian(centerX, centerY, houseRadius + 25, housesArray[3].degree).x}
                y={polarToCartesian(centerX, centerY, houseRadius + 25, housesArray[3].degree).y}
                textAnchor="middle" fontSize="12" fill="#000" fontWeight="bold">
            IC
          </text>
        </g>
      </svg>
    </div>
  );
};

export default PlacidusNatalChart;