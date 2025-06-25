import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp, Download } from "lucide-react";
import type { NatalChartData, Coordinates } from "@shared/schema";
import { getPlanetColor, getPlanetSymbol, getAspectSymbol } from "@/lib/astrology-utils";

interface ForecastSectionProps {
  natalData: NatalChartData;
  coordinates: Coordinates | null;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

interface DayForecast {
  date: string;
  progressions: Transit[];
  outerPlanets: Transit[];
  venus: Transit[];
  mars: Transit[];
  mercuryRetro: Transit[];
}

interface Transit {
  transitPlanet: string;
  aspect: string;
  symbol: string;
  natalPoint: string;
  orb: string;
  isRetrograde?: boolean;
}

export default function ForecastSection({
  natalData,
  coordinates,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}: ForecastSectionProps) {
  const { toast } = useToast();
  const [forecastData, setForecastData] = useState<DayForecast[]>([]);

  // Calculate forecast mutation
  const calculateForecast = useMutation({
    mutationFn: async (data: { birthData: any; coordinates: any; startDate: string; endDate: string }) => {
      const response = await apiRequest("POST", "/api/calculate-forecast", data);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        // Filter out days with no aspects in any column
        const filteredData = result.data.filter((day: DayForecast) =>
          (day.progressions && day.progressions.length > 0) ||
          (day.outerPlanets && day.outerPlanets.length > 0) ||
          (day.venus && day.venus.length > 0) ||
          (day.mars && day.mars.length > 0) ||
          (day.mercuryRetro && day.mercuryRetro.length > 0)
        );
        setForecastData(filteredData);
        toast({
          title: "Успех!",
          description: "Прогнозата е изчислена успешно.",
        });
      } else {
        throw new Error(result.error);
      }
    },
    onError: (error) => {
      toast({
        title: "Грешка",
        description: `Възникна грешка при изчисляването на прогнозата: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCalculateForecast = () => {
    if (!coordinates) {
      toast({
        title: "Грешка",
        description: "Координатите не са налични. Моля първо изчислете наталната карта.",
        variant: "destructive",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Грешка",
        description: "Моля въведете начална и крайна дата.",
        variant: "destructive",
      });
      return;
    }

    calculateForecast.mutate({
      birthData: natalData.birthData,
      coordinates: coordinates,
      startDate: startDate,
      endDate: endDate
    });
  };

  const handleExportToPDF = async () => {
    if (forecastData.length === 0) {
      toast({
        title: "Грешка",
        description: "Няма данни за експорт. Моля първо изчислете прогнозата.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/export-forecast-pdf", {
        forecastData,
        startDate,
        endDate,
        birthData: natalData.birthData
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `prognoza-${startDate}-${endDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Успех!",
          description: "PDF файлът е изтеглен успешно.",
        });
      } else {
        throw new Error("Грешка при генериране на PDF");
      }
    } catch (error) {
      toast({
        title: "Грешка",
        description: `Възникна грешка при експорта в PDF: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const renderTransit = (transit: Transit) => {
    const isHouse = transit.natalPoint.startsWith("Дом");
    const isAngle = ["Асцендент", "MC", "Десцендент", "IC"].includes(transit.natalPoint);
    
    return (
      <div className="mb-1">
        <span
          className="text-lg symbol-font mr-1"
          style={{ color: getPlanetColor(transit.transitPlanet) }}
        >
          {getPlanetSymbol(transit.transitPlanet)}
          {transit.isRetrograde && <span className="text-xs text-red-600 font-bold">R</span>}
        </span>
        <span className="text-lg mx-1" style={{ color: getAspectColor(transit.aspect) }}>
          {getAspectSymbol(transit.aspect)}
        </span>
        {isHouse || isAngle ? (
          <span className="text-purple-600 font-medium">{transit.natalPoint}</span>
        ) : (
          <>
            <span
              className="text-lg symbol-font ml-1"
              style={{ color: getPlanetColor(transit.natalPoint) }}
            >
              {getPlanetSymbol(transit.natalPoint)}
            </span>
            <span className="text-sm ml-1">{transit.natalPoint}</span>
          </>
        )}
      </div>
    );
  };

  const getAspectColor = (aspect: string): string => {
    const colors: Record<string, string> = {
      "Съвпад": "#ff0000",
      "Опозиция": "#ff6600",
      "Квадратура": "#ff9900",
      "Тригон": "#0066ff",
      "Секстил": "#00cc00"
    };
    return colors[aspect] || "#666666";
  };

  return (
    <div className="border-t-2 border-gray-200 pt-8 w-full">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
        <TrendingUp className="text-blue-600" />
        Прогноза (Транзити)
      </h3>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="start-date">Начална дата</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="end-date">Крайна дата</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="mt-2"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Button
          onClick={handleCalculateForecast}
          className="flex-1 astro-gradient-reverse text-white font-semibold py-4 px-6 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          disabled={calculateForecast.isPending}
        >
          <TrendingUp className="mr-3" size={20} />
          {calculateForecast.isPending ? "Изчисляване..." : "Изчисли Прогноза"}
        </Button>

        {forecastData.length > 0 && (
          <Button
            onClick={handleExportToPDF}
            variant="outline"
            className="px-6 py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold transition-all duration-300"
          >
            <Download className="mr-2" size={20} />
            Експорт PDF
          </Button>
        )}
      </div>

      {forecastData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
          <Table>
            <TableHeader className="astro-gradient-reverse text-white sticky top-0 z-10">
              <TableRow>
                <TableHead className="px-4 py-4 text-left font-semibold text-white whitespace-nowrap">
                  Дата
                </TableHead>
                <TableHead className="px-4 py-4 text-left font-semibold text-white">
                  Прогресии<br/>
                  <span className="text-xs font-normal">(всички прогресивни планети)</span>
                </TableHead>
                <TableHead className="px-4 py-4 text-left font-semibold text-white">
                  Външни планети<br/>
                  <span className="text-xs font-normal">(♃ ♄ ♅ ♆ ♇ - всички аспекти)</span>
                </TableHead>
                <TableHead className="px-4 py-4 text-left font-semibold text-white">
                  Венера<br/>
                  <span className="text-xs font-normal">(☌ ⚹ △)</span>
                </TableHead>
                <TableHead className="px-4 py-4 text-left font-semibold text-white">
                  Марс<br/>
                  <span className="text-xs font-normal">(☌ □ ☍)</span>
                </TableHead>
                <TableHead className="px-4 py-4 text-left font-semibold text-white">
                  Меркурий R<br/>
                  <span className="text-xs font-normal">(само ретрограден)</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {forecastData.map((dayForecast, index) => (
                <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="px-4 py-4 font-medium align-top whitespace-nowrap">
                    {new Date(dayForecast.date).toLocaleDateString("bg-BG", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric"
                    })}
                  </TableCell>
                  <TableCell className="px-4 py-4 align-top">
                    {dayForecast.progressions && dayForecast.progressions.length > 0 ? (
                      <div className="space-y-1">
                        {dayForecast.progressions.map((transit, idx) => (
                          <div key={idx}>{renderTransit(transit)}</div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-4 align-top">
                    {dayForecast.outerPlanets && dayForecast.outerPlanets.length > 0 ? (
                      <div className="space-y-1">
                        {dayForecast.outerPlanets.map((transit, idx) => (
                          <div key={idx}>{renderTransit(transit)}</div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-4 align-top">
                    {dayForecast.venus && dayForecast.venus.length > 0 ? (
                      <div className="space-y-1">
                        {dayForecast.venus.map((transit, idx) => (
                          <div key={idx}>{renderTransit(transit)}</div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-4 align-top">
                    {dayForecast.mars && dayForecast.mars.length > 0 ? (
                      <div className="space-y-1">
                        {dayForecast.mars.map((transit, idx) => (
                          <div key={idx}>{renderTransit(transit)}</div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-4 align-top">
                    {dayForecast.mercuryRetro && dayForecast.mercuryRetro.length > 0 ? (
                      <div className="space-y-1">
                        {dayForecast.mercuryRetro.map((transit, idx) => (
                          <div key={idx}>{renderTransit(transit)}</div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {forecastData.length === 0 && calculateForecast.isSuccess && (
        <div className="p-6 text-center text-gray-500 bg-white rounded-2xl shadow-lg">
          Няма точни аспекти в избрания период
        </div>
      )}

      {/* Легенда */}
      {forecastData.length > 0 && (
        <div className="mt-6 bg-gray-50 rounded-xl p-6">
          <h4 className="font-semibold text-gray-800 mb-3">Легенда:</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Планети:</h5>
              <div className="space-y-1">
                <span className="inline-flex items-center gap-2">
                  <span className="text-lg symbol-font" style={{ color: getPlanetColor("Юпитер") }}>♃</span> Юпитер
                </span>
                <span className="inline-flex items-center gap-2 ml-4">
                  <span className="text-lg symbol-font" style={{ color: getPlanetColor("Сатурн") }}>♄</span> Сатурн
                </span>
                <span className="inline-flex items-center gap-2 ml-4">
                  <span className="text-lg symbol-font" style={{ color: getPlanetColor("Уран") }}>♅</span> Уран
                </span>
                <div>
                  <span className="inline-flex items-center gap-2">
                    <span className="text-lg symbol-font" style={{ color: getPlanetColor("Нептун") }}>♆</span> Нептун
                  </span>
                  <span className="inline-flex items-center gap-2 ml-4">
                    <span className="text-lg symbol-font" style={{ color: getPlanetColor("Плутон") }}>♇</span> Плутон
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Аспекти:</h5>
              <div className="space-y-1">
                <span className="inline-flex items-center gap-2">
                  <span style={{ color: "#ff0000" }}>{getAspectSymbol("Съвпад")}</span> Съвпад (0°)
                </span>
                <span className="inline-flex items-center gap-2 ml-4">
                  <span style={{ color: "#00cc00" }}>{getAspectSymbol("Секстил")}</span> Секстил (60°)
                </span>
                <span className="inline-flex items-center gap-2 ml-4">
                  <span style={{ color: "#ff9900" }}>{getAspectSymbol("Квадратура")}</span> Квадратура (90°)
                </span>
                <div>
                  <span className="inline-flex items-center gap-2">
                    <span style={{ color: "#0066ff" }}>{getAspectSymbol("Тригон")}</span> Тригон (120°)
                  </span>
                  <span className="inline-flex items-center gap-2 ml-4">
                    <span style={{ color: "#ff6600" }}>{getAspectSymbol("Опозиция")}</span> Опозиция (180°)
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <p><span className="text-red-600 font-bold">R</span> = Ретроградна планета</p>
            <p className="mt-1">Показват се само точни аспекти (орбис ≤ 0.1°)</p>
            <p className="mt-1">Прогресиите се изчисляват по метода "ден за година"</p>
          </div>
        </div>
      )}
    </div>
  );
}

