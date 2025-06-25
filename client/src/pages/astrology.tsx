import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Star, Calculator, User, MapPin, Clock, TrendingUp } from "lucide-react";
import { debounce, formatDate, addMonths } from "@/lib/astrology-utils";
import { MONTHS } from "@/lib/astrology-constants";
import NatalChart from "@/components/natal-chart";
import PlanetTable from "@/components/planet-table";
import AspectsTable from "@/components/aspects-table";
import ForecastSection from "@/components/forecast-section";
import HousesTable from "@/components/houses-table";
import type { BirthData, NatalChartData, Coordinates } from "@shared/schema";

export default function AstrologyPage() {
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<Partial<BirthData>>({
    name: "",
    gender: undefined,
    year: undefined,
    month: undefined,
    day: undefined,
    hour: undefined,
    minute: undefined,
    second: 0,
    city: "",
    country: "България"
  });

  // Results state
  const [natalData, setNatalData] = useState<NatalChartData | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Autocomplete state
  const [cityQuery, setCityQuery] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);

  // Default forecast dates
  const today = new Date();
  const [startDate, setStartDate] = useState(formatDate(today));
  const [endDate, setEndDate] = useState(formatDate(addMonths(today, 12)));

  // City suggestions query
  const { data: citySuggestions, refetch: refetchCities } = useQuery({
    queryKey: ["/api/city-suggestions", cityQuery],
    enabled: false,
  });

  // Country suggestions query
  const { data: countrySuggestions, refetch: refetchCountries } = useQuery({
    queryKey: ["/api/country-suggestions", countryQuery],
    enabled: false,
  });

  // Debounced search functions
  const debouncedCitySearch = debounce((query: string) => {
    setCityQuery(query);
    if (query.length >= 2) {
      refetchCities();
      setShowCitySuggestions(true);
    } else {
      setShowCitySuggestions(false);
    }
  }, 300);

  const debouncedCountrySearch = debounce((query: string) => {
    setCountryQuery(query);
    if (query.length >= 2) {
      refetchCountries();
      setShowCountrySuggestions(true);
    } else {
      setShowCountrySuggestions(false);
    }
  }, 300);

  // Calculate natal chart mutation
  const calculateNatalChart = useMutation({
    mutationFn: async (data: { birthData: BirthData; coordinates: Coordinates }) => {
      const response = await apiRequest("POST", "/api/calculate-natal-chart", data);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        setNatalData(result.data);
        setShowResults(true);
        // Update forecast dates based on birth data
        const birthDate = new Date(result.data.birthData.year, result.data.birthData.month - 1, result.data.birthData.day);
        setStartDate(formatDate(today));
        setEndDate(formatDate(addMonths(today, 12)));

        toast({
          title: "Успех!",
          description: "Наталната карта е изчислена успешно.",
        });
      } else {
        throw new Error(result.error);
      }
    },
    onError: (error) => {
      toast({
        title: "Грешка",
        description: `Възникна грешка при изчисляването: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Get coordinates mutation
  const getCoordinates = useMutation({
    mutationFn: async ({ city, country }: { city: string; country: string }) => {
      const response = await fetch(`/api/coordinates/${encodeURIComponent(city)}/${encodeURIComponent(country)}`);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        setCoordinates(result.data);
      } else {
        throw new Error(result.error);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name || !formData.gender || !formData.year || !formData.month ||
        !formData.day || formData.hour === undefined || formData.minute === undefined ||
        !formData.city || !formData.country) {
      toast({
        title: "Грешка във формата",
        description: "Моля попълнете всички задължителни полета.",
        variant: "destructive",
      });
      return;
    }

    try {
      // First get coordinates
      const coordsResult = await getCoordinates.mutateAsync({
        city: formData.city,
        country: formData.country
      });

      if (coordsResult.success) {
        const coords = coordsResult.data;
        // Then calculate natal chart
        await calculateNatalChart.mutateAsync({
          birthData: formData as BirthData,
          coordinates: coords
        });
      }
    } catch (error) {
      // Error handling is done in mutation onError
    }
  };

  const handleInputChange = (field: keyof BirthData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectCity = (city: string) => {
    setFormData(prev => ({ ...prev, city }));
    setShowCitySuggestions(false);
  };

  const selectCountry = (country: string) => {
    setFormData(prev => ({ ...prev, country }));
    setShowCountrySuggestions(false);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative z-10 text-center py-12">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg flex items-center justify-center gap-3">
          <Star className="text-yellow-400" size={48} />
          Астрологичен Софтуер
        </h1>
        <p className="text-xl text-white/90 max-w-2xl mx-auto">
          Професионално изчисляване на натални карти и астрологични прогнози със Swiss Ephemeris
        </p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-12 gap-8 max-w-7xl mx-auto">

          {/* Input Section */}
          <div className="lg:col-span-5">
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <User className="text-blue-600" />
                  Данни за раждане
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Personal Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Име</Label>
                      <Input
                        id="name"
                        value={formData.name || ""}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Пол</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Изберете пол" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Мъж">Мъж</SelectItem>
                          <SelectItem value="Жена">Жена</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Birth Date */}
                  <div>
                    <Label>Дата на раждане</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      <Input
                        type="number"
                        placeholder="Ден"
                        min="1"
                        max="31"
                        value={formData.day || ""}
                        onChange={(e) => handleInputChange("day", parseInt(e.target.value))}
                        required
                      />
                      <Select value={formData.month?.toString()} onValueChange={(value) => handleInputChange("month", parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Месец" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map(month => (
                            <SelectItem key={month.value} value={month.value.toString()}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Година"
                        min="1900"
                        max="2100"
                        value={formData.year || ""}
                        onChange={(e) => handleInputChange("year", parseInt(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  {/* Birth Time */}
                  <div>
                    <Label className="flex items-center gap-2">
                      <Clock size={16} />
                      Час на раждане
                    </Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      <Input
                        type="number"
                        placeholder="Час"
                        min="0"
                        max="23"
                        value={formData.hour ?? ""}
                        onChange={(e) => handleInputChange("hour", parseInt(e.target.value))}
                        required
                      />
                      <Input
                        type="number"
                        placeholder="Мин"
                        min="0"
                        max="59"
                        value={formData.minute ?? ""}
                        onChange={(e) => handleInputChange("minute", parseInt(e.target.value))}
                        required
                      />
                      <Input
                        type="number"
                        placeholder="Сек"
                        min="0"
                        max="59"
                        value={formData.second ?? 0}
                        onChange={(e) => handleInputChange("second", parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Label htmlFor="city" className="flex items-center gap-2">
                        <MapPin size={16} />
                        Град
                      </Label>
                      <Input
                        id="city"
                        value={formData.city || ""}
                        onChange={(e) => {
                          handleInputChange("city", e.target.value);
                          debouncedCitySearch(e.target.value);
                        }}
                        className="mt-2"
                        required
                      />
                      {showCitySuggestions && citySuggestions?.success && citySuggestions.data.length > 0 && (
                        <div className="absolute z-50 w-full bg-white border-2 border-gray-200 rounded-xl mt-1 shadow-lg max-h-60 overflow-y-auto">
                          {citySuggestions.data.map((suggestion: any, index: number) => (
                            <div
                              key={index}
                              className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
                              onClick={() => selectCity(suggestion.city)}
                            >
                              {suggestion.city}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <Label htmlFor="country">Държава</Label>
                      <Input
                        id="country"
                        value={formData.country || ""}
                        onChange={(e) => {
                          handleInputChange("country", e.target.value);
                          debouncedCountrySearch(e.target.value);
                        }}
                        className="mt-2"
                        required
                      />
                      {showCountrySuggestions && countrySuggestions?.success && countrySuggestions.data.length > 0 && (
                        <div className="absolute z-50 w-full bg-white border-2 border-gray-200 rounded-xl mt-1 shadow-lg max-h-60 overflow-y-auto">
                          {countrySuggestions.data.map((suggestion: any, index: number) => (
                            <div
                              key={index}
                              className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
                              onClick={() => selectCountry(suggestion.country)}
                            >
                              {suggestion.country}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full astro-gradient text-white font-semibold py-4 px-6 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                    disabled={calculateNatalChart.isPending || getCoordinates.isPending}
                  >
                    <Calculator className="mr-3" size={20} />
                    {calculateNatalChart.isPending || getCoordinates.isPending ? "Изчисляване..." : "Изчисли Натална Карта"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Houses Table - показва се само когато има резултати */}
            {showResults && natalData && natalData.houses && (
              <div className="mt-8">
                <HousesTable houses={natalData.houses} />
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="lg:col-span-7">
            {showResults && natalData ? (
              <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
                <CardContent className="p-8">

                  {/* Natal Chart */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                      <Star className="text-blue-600" />
                      Натална Карта
                    </h3>
                    <NatalChart data={natalData} />
                  </div>

                  {/* Planet Table */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                      <Star className="text-blue-600" />
                      Позиции на Планетите
                    </h3>
                    <PlanetTable planets={natalData.planets} />
                  </div>

                  {/* Aspects Table */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                      <Star className="text-blue-600" />
                      Аспекти
                    </h3>
                    <AspectsTable aspects={natalData.aspects} />
                  </div>

                  {/* Forecast Section */}
                  <ForecastSection
                    natalData={natalData}
                    coordinates={coordinates}
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 p-8 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                <Calculator size={64} className="text-gray-400 mb-4" />
                <p className="text-xl text-gray-600 font-medium">Въведете данни за раждане, за да изчислите натална карта и прогнози.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

