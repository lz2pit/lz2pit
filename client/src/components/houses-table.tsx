import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Home } from "lucide-react";

interface House {
  longitude: number;
  sign: {
    name: string;
    symbol: string;
  };
  degree: number;
  minutes: number;
  seconds: number;
}

interface HousesTableProps {
  houses: Record<string, House>;
}

export default function HousesTable({ houses }: HousesTableProps) {
  if (!houses || Object.keys(houses).length === 0) {
    return null;
  }

  // Сортираме домовете по номер
  const sortedHouses = Object.entries(houses).sort((a, b) => {
    const numA = parseInt(a[0].replace('Дом ', ''));
    const numB = parseInt(b[0].replace('Дом ', ''));
    return numA - numB;
  });

  // Цветове за различните знаци
  const getSignColor = (signName: string) => {
    const colors: Record<string, string> = {
      "Овен": "#ff0000",
      "Телец": "#008000",
      "Близнаци": "#ffff00",
      "Рак": "#c0c0c0",
      "Лъв": "#ffa500",
      "Дева": "#808000",
      "Везни": "#00ff00",
      "Скорпион": "#800000",
      "Стрелец": "#800080",
      "Козирог": "#000080",
      "Водолей": "#00ffff",
      "Риби": "#ff00ff"
    };
    return colors[signName] || "#666666";
  };

  return (
    <div className="mt-8 border-t-2 border-gray-200 pt-8">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
        <Home className="text-purple-600" />
        Астрологични домове
      </h3>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <TableRow>
              <TableHead className="px-6 py-4 text-left font-semibold text-white">
                Дом
              </TableHead>
              <TableHead className="px-6 py-4 text-left font-semibold text-white">
                Знак
              </TableHead>
              <TableHead className="px-6 py-4 text-left font-semibold text-white">
                Позиция
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-200">
            {sortedHouses.map(([houseName, houseData]) => (
              <TableRow key={houseName} className="hover:bg-gray-50 transition-colors">
                <TableCell className="px-6 py-4 font-medium">
                  {houseName}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <span
                      className="text-2xl symbol-font"
                      style={{ color: getSignColor(houseData.sign.name) }}
                    >
                      {houseData.sign.symbol}
                    </span>
                    <span className="font-medium">{houseData.sign.name}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="font-mono text-gray-700">
                    {houseData.degree}° {String(houseData.minutes).padStart(2, '0')}' {String(houseData.seconds).padStart(2, '0')}"
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm text-gray-600">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-blue-800">Ъглови домове (1, 4, 7, 10)</h4>
          <p>Най-силните домове, свързани с личността, дома, партньорствата и кариерата.</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-green-800">Последващи домове (2, 5, 8, 11)</h4>
          <p>Стабилизиращи домове, свързани с ресурси, творчество, трансформация и приятелства.</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-purple-800">Падащи домове (3, 6, 9, 12)</h4>
          <p>Променливи домове, свързани с комуникация, здраве, философия и духовност.</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-orange-800">Системата на домовете</h4>
          <p>Използва се системата на Плацидус за изчисляване на домовете.</p>
        </div>
      </div>
    </div>
  );
}
