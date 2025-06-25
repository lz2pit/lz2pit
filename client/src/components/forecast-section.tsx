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

  const calculateForecast = useMutation({
    mutationFn: async (data: { birthData: any; coordinates: any; startDate: string; endDate: string }) => {
      const response = await apiRequest("POST", "/api/calculate-forecast", data);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
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

  const renderTransit = (transit: Transit) => {
    if (!transit || !transit.transitPlanet || !transit.natalPoint) return null;

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
            {/* Името е скрито според изискването */}
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
            onClick={async () => {
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
              } catch (error: any) {
                toast({
                  title: "Грешка",
                  description: `Възникна грешка при експорта в PDF: ${error.message}`,
                  variant: "destructive",
                });
              }
            }}
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
                  Прогресии
                </TableHead>
                <TableHead className="px-4 py-4 text-left font-semibold text-white">
                  Външни планети
                </TableHead>
                <TableHead className="px-4 py-4 text-left font-semibold text-white">
                  Венера
                </TableHead>
                <TableHead className="px-4 py-4 text-left font-semibold text-white">
                  Марс
                </TableHead>
                <TableHead className="px-4 py-4 text-left font-semibold text-white">
                  Меркурий ретро
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {forecastData.map((day) => (
                <TableRow key={day.date} className="hover:bg-gray-50">
                  <TableCell className="whitespace-nowrap font-semibold text-gray-700 px-4 py-4">
                    {day.date}
                  </TableCell>

                  <TableCell className="max-w-[150px] min-w-[150px] px-4 py-4 align-top">
                    {day.progressions?.map(renderTransit)}
                  </TableCell>

                  <TableCell className="max-w-[150px] min-w-[150px] px-4 py-4 align-top">
                    {day.outerPlanets?.map(renderTransit)}
                  </TableCell>

                  <TableCell className="max-w-[150px] min-w-[150px] px-4 py-4 align-top">
                    {day.venus?.map(renderTransit)}
                  </TableCell>

                  <TableCell className="max-w-[150px] min-w-[150px] px-4 py-4 align-top">
                    {day.mars?.map(renderTransit)}
                  </TableCell>

                  <TableCell className="max-w-[150px] min-w-[150px] px-4 py-4 align-top">
                    {day.mercuryRetro?.map(renderTransit)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
