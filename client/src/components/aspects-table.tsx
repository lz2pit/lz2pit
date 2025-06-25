import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPlanetColor, getPlanetSymbol, getAspectColor } from "@/lib/astrology-utils";

interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  symbol: string;
  angle: number;
  orb: number;
  category?: string;
}

interface AspectsTableProps {
  aspects: Aspect[];
}

// Речник за показване на домовете и ъглите с точните съкращения
const HOUSE_LABELS_MAP: Record<string, string> = {
  "Дом 1": "ASC",
  "Дом 2": "2",
  "Дом 3": "3",
  "Дом 4": "IC",
  "Дом 5": "5",
  "Дом 6": "6",
  "Дом 7": "DSC",
  "Дом 8": "8",
  "Дом 9": "9",
  "Дом 10": "MC",
  "Дом 11": "11",
  "Дом 12": "12",
  "Асцендент": "ASC",
  "Десцендент": "DSC",
  "IC": "IC",
  "MC": "MC",
};

export default function AspectsTable({ aspects }: AspectsTableProps) {
  if (!aspects || aspects.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">Няма намерени аспекти</p>
    );
  }

  const planetToPlanet = aspects.filter(a => !a.category || a.category === "planet-planet");
  const planetToHouse = aspects.filter(a => a.category === "planet-house");
  const planetToAngle = aspects.filter(a => a.category === "planet-angle");

  const renderAspectRow = (aspect: Aspect, index: number) => {
    if (!aspect || !aspect.planet1 || !aspect.planet2) return null;

    const isPlanetToHouse = aspect.category === "planet-house";
    const isPlanetToAngle = aspect.category === "planet-angle";

    return (
      <TableRow key={index} className="hover:bg-gray-50 transition-colors">
        <TableCell className="px-6 py-4">
          <div className="flex items-center space-x-2">
            {/* Само глиф, без име */}
            <span
              className="text-lg symbol-font"
              style={{ color: getPlanetColor(aspect.planet1) }}
            >
              {getPlanetSymbol(aspect.planet1)}
            </span>
          </div>
        </TableCell>
        <TableCell className="px-6 py-4 text-center">
          <span
            className="text-2xl symbol-font"
            style={{ color: getAspectColor(aspect.type) }}
          >
            {aspect.symbol}
          </span>
        </TableCell>
        <TableCell className="px-6 py-4">
          <div className="flex items-center space-x-2">
            {isPlanetToHouse ? (
              <span className="font-medium text-purple-600">
                {HOUSE_LABELS_MAP[aspect.planet2] || aspect.planet2}
              </span>
            ) : isPlanetToAngle ? (
              <span className="font-medium text-indigo-600">
                {HOUSE_LABELS_MAP[aspect.planet2] || aspect.planet2}
              </span>
            ) : (
              // Само глиф, без име
              <span
                className="text-lg symbol-font"
                style={{ color: getPlanetColor(aspect.planet2) }}
              >
                {getPlanetSymbol(aspect.planet2)}
              </span>
            )}
          </div>
        </TableCell>
        <TableCell className="px-6 py-4 text-center">
          <span className="text-sm text-gray-600">{aspect.angle.toFixed(2)}°</span>
        </TableCell>
        <TableCell className="px-6 py-4 text-center">
          <span className={`text-sm ${aspect.orb < 1 ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
            {aspect.orb.toFixed(2)}°
          </span>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">Аспекти към натал ({aspects.length})</TabsTrigger>
        <TabsTrigger value="planets">Планети ({planetToPlanet.length})</TabsTrigger>
        <TabsTrigger value="houses">Домове ({planetToHouse.length})</TabsTrigger>
        <TabsTrigger value="angles">Ъгли ({planetToAngle.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <TableRow>
                <TableHead className="px-6 py-4 text-left font-semibold text-white">
                  Планета 1
                </TableHead>
                <TableHead className="px-6 py-4 text-center font-semibold text-white">
                  Аспект
                </TableHead>
                <TableHead className="px-6 py-4 text-left font-semibold text-white">
                  Планета 2 / Дом
                </TableHead>
                <TableHead className="px-6 py-4 text-center font-semibold text-white">
                  Ъгъл
                </TableHead>
                <TableHead className="px-6 py-4 text-center font-semibold text-white">
                  Орбис
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {aspects.map((aspect, index) => renderAspectRow(aspect, index))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="planets">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <TableRow>
                <TableHead className="px-6 py-4 text-left font-semibold text-white">
                  Планета 1
                </TableHead>
                <TableHead className="px-6 py-4 text-center font-semibold text-white">
                  Аспект
                </TableHead>
                <TableHead className="px-6 py-4 text-left font-semibold text-white">
                  Планета 2
                </TableHead>
                <TableHead className="px-6 py-4 text-center font-semibold text-white">
                  Ъгъл
                </TableHead>
                <TableHead className="px-6 py-4 text-center font-semibold text-white">
                  Орбис
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {planetToPlanet.map((aspect, index) => renderAspectRow(aspect, index))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="houses">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {planetToHouse.length > 0 ? (
            <Table>
              <TableHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <TableRow>
                  <TableHead className="px-6 py-4 text-left font-semibold text-white">
                    Планета
                  </TableHead>
                  <TableHead className="px-6 py-4 text-center font-semibold text-white">
                    Аспект
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left font-semibold text-white">
                    Дом
                  </TableHead>
                  <TableHead className="px-6 py-4 text-center font-semibold text-white">
                    Ъгъл
                  </TableHead>
                  <TableHead className="px-6 py-4 text-center font-semibold text-white">
                    Орбис
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200">
                {planetToHouse.map((aspect, index) => renderAspectRow(aspect, index))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Няма намерени мажорни аспекти към домове с орбис до 3°
            </p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="angles">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {planetToAngle.length > 0 ? (
            <Table>
              <TableHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <TableRow>
                  <TableHead className="px-6 py-4 text-left font-semibold text-white">
                    Планета
                  </TableHead>
                  <TableHead className="px-6 py-4 text-center font-semibold text-white">
                    Аспект
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left font-semibold text-white">
                    Ъгъл
                  </TableHead>
                  <TableHead className="px-6 py-4 text-center font-semibold text-white">
                    Градуси
                  </TableHead>
                  <TableHead className="px-6 py-4 text-center font-semibold text-white">
                    Орбис
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200">
                {planetToAngle.map((aspect, index) => renderAspectRow(aspect, index))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Няма намерени аспекти към Асцендент или MC
            </p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
