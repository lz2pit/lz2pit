import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPlanetColor, getPlanetSymbol, formatDegreeMinutesSeconds } from "@/lib/astrology-utils";

// Разширяваме типа PlanetPosition локално
interface ExtendedPlanetPosition {
  longitude: number;
  sign: { name: string; symbol: string };
  degree: number;
  minutes: number;
  seconds: number;
  house: number;
  speed?: number;
  motionType?: string;
  magnitude?: string | number;
}

interface PlanetTableProps {
  planets: Record<string, ExtendedPlanetPosition | any>;
}

export default function PlanetTable({ planets }: PlanetTableProps) {
  // Функция за форматиране на типа движение
  const getMotionDisplay = (motionType?: string) => {
    if (!motionType) return <span className="text-gray-400">—</span>;
    
    const motionStyles: Record<string, { text: string; color: string; title: string }> = {
      'R': { text: 'R', color: 'text-red-600 font-bold', title: 'Ретроградна' },
      'D': { text: 'D', color: 'text-green-600', title: 'Директна' },
      'S': { text: 'S', color: 'text-orange-600 font-bold', title: 'Стационарна' }
    };
    
    const style = motionStyles[motionType] || { text: motionType, color: 'text-gray-600', title: '' };
    
    return (
      <span className={style.color} title={style.title}>
        {style.text}
      </span>
    );
  };

  // Функция за форматиране на магнитуда
  const getMagnitudeDisplay = (magnitude?: string | number) => {
    if (magnitude === undefined || magnitude === null) {
      return <span className="text-gray-400">—</span>;
    }
    
    if (magnitude === 'X') {
      return <span className="text-gray-500" title="Невидима планета">X</span>;
    }
    
    const mag = typeof magnitude === 'number' ? magnitude : parseFloat(magnitude.toString());
    let colorClass = 'text-gray-700';
    
    if (mag < -4) colorClass = 'text-yellow-600 font-bold'; // Много ярка (Венера, Слънце)
    else if (mag < -2) colorClass = 'text-yellow-500'; // Ярка (Юпитер, Марс)
    else if (mag < 0) colorClass = 'text-blue-600'; // Средно ярка (Сатурн)
    else if (mag < 2) colorClass = 'text-blue-500'; // Слабо видима (Меркурий)
    
    return <span className={colorClass}>{magnitude}</span>;
  };

  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
      <Table>
        <TableHeader className="astro-gradient text-white">
          <TableRow>
            <TableHead className="px-6 py-4 text-left font-semibold text-white">
              Планета
            </TableHead>
            <TableHead className="px-4 py-4 text-center font-semibold text-white" title="Ретроградна/Директна/Стационарна">
              R/D/S
            </TableHead>
            <TableHead className="px-4 py-4 text-center font-semibold text-white">
              Магнитуд
            </TableHead>
            <TableHead className="px-6 py-4 text-left font-semibold text-white">
              Знак
            </TableHead>
            <TableHead className="px-6 py-4 text-left font-semibold text-white">
              Градус
            </TableHead>
            <TableHead className="px-6 py-4 text-left font-semibold text-white">
              Дом
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200">
          {Object.entries(planets).map(([planetName, planetData]) => (
            <TableRow key={planetName} className="hover:bg-gray-50 transition-colors">
              <TableCell className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <span
                    className="text-2xl symbol-font"
                    style={{ color: getPlanetColor(planetName) }}
                  >
                    {getPlanetSymbol(planetName)}
                  </span>
                  <span className="font-medium">{planetName}</span>
                </div>
              </TableCell>
              <TableCell className="px-4 py-4 text-center">
                {getMotionDisplay(planetData.motionType)}
              </TableCell>
              <TableCell className="px-4 py-4 text-center font-mono">
                {getMagnitudeDisplay(planetData.magnitude)}
              </TableCell>
              <TableCell className="px-6 py-4">
                {planetData.sign ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-xl symbol-font">{planetData.sign.symbol}</span>
                    <span>{planetData.sign.name}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </TableCell>
              <TableCell className="px-6 py-4 font-mono">
                {typeof planetData.degree === 'number' &&
                 typeof planetData.minutes === 'number' &&
                 typeof planetData.seconds === 'number' ?
                  formatDegreeMinutesSeconds(planetData.degree, planetData.minutes, planetData.seconds) :
                  <span className="text-gray-400">—</span>
                }
              </TableCell>
              <TableCell className="px-6 py-4 font-semibold text-celestial">
                {typeof planetData.house === 'number' ?
                  `Дом ${planetData.house}` :
                  <span className="text-gray-400">—</span>
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Легенда */}
      <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-700">R/D/S:</span>
            <span className="ml-2">
              <span className="text-red-600 font-bold">R</span> = Ретроградна,
              <span className="text-green-600 ml-2">D</span> = Директна,
              <span className="text-orange-600 font-bold ml-2">S</span> = Стационарна
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Магнитуд:</span>
            <span className="ml-2">По-малки числа = по-ярки планети, X = невидима</span>
          </div>
        </div>
      </div>
    </div>
  );
}