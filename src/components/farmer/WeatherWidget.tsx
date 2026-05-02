import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Wind, Droplets, Sun, AlertTriangle, CheckCircle2, Loader2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Weather {
  temperature: number;
  windSpeed: number;
  humidity: number;
  precipitationNext2h: number;
  weatherCode: number;
  locationLabel: string;
}

// Default to Dhule, Maharashtra
const DEFAULT_LAT = 20.9042;
const DEFAULT_LNG = 74.7749;

function spraySafety(w: Weather): { level: "safe" | "caution" | "unsafe"; message: string } {
  if (w.precipitationNext2h > 0.5) {
    return { level: "unsafe", message: "Rain expected within 2 hours. Do not spray now." };
  }
  if (w.windSpeed > 15) {
    return { level: "unsafe", message: `High wind (${w.windSpeed.toFixed(0)} km/h). Spray drift risk — wait.` };
  }
  if (w.windSpeed > 10 || w.temperature > 35) {
    return { level: "caution", message: "Marginal conditions. Spray early morning or late evening." };
  }
  return { level: "safe", message: `Low wind (${w.windSpeed.toFixed(0)} km/h). Safe window for spraying.` };
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async (lat: number, lng: number, label: string) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=precipitation&forecast_days=1&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();
        const nextHours = (data.hourly?.precipitation ?? []).slice(0, 2);
        const precip = nextHours.reduce((a: number, b: number) => a + (b || 0), 0);
        setWeather({
          temperature: data.current.temperature_2m,
          windSpeed: data.current.wind_speed_10m,
          humidity: data.current.relative_humidity_2m,
          precipitationNext2h: precip,
          weatherCode: data.current.weather_code,
          locationLabel: label,
        });
      } catch (e) {
        setError("Could not load weather");
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, "Your location"),
        () => fetchWeather(DEFAULT_LAT, DEFAULT_LNG, "Dhule, Maharashtra"),
        { timeout: 5000 },
      );
    } else {
      fetchWeather(DEFAULT_LAT, DEFAULT_LNG, "Dhule, Maharashtra");
    }
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Cloud className="h-5 w-5 text-primary" /> Spray Weather
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading conditions…
          </div>
        ) : error || !weather ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {weather.locationLabel}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted p-2">
                <Sun className="mx-auto h-4 w-4 text-accent" />
                <p className="mt-1 text-lg font-bold" translate="no">{weather.temperature.toFixed(0)}°C</p>
                <p className="text-[10px] text-muted-foreground">Temp</p>
              </div>
              <div className="rounded-md bg-muted p-2">
                <Wind className="mx-auto h-4 w-4 text-primary" />
                <p className="mt-1 text-lg font-bold" translate="no">{weather.windSpeed.toFixed(0)}</p>
                <p className="text-[10px] text-muted-foreground">km/h wind</p>
              </div>
              <div className="rounded-md bg-muted p-2">
                <Droplets className="mx-auto h-4 w-4 text-primary" />
                <p className="mt-1 text-lg font-bold" translate="no">{weather.humidity.toFixed(0)}%</p>
                <p className="text-[10px] text-muted-foreground">Humidity</p>
              </div>
            </div>
            {(() => {
              const s = spraySafety(weather);
              const variant =
                s.level === "safe" ? "default" : s.level === "caution" ? "secondary" : "destructive";
              const Icon = s.level === "safe" ? CheckCircle2 : AlertTriangle;
              return (
                <div className="space-y-2">
                  <Badge variant={variant} className="w-full justify-center py-1.5">
                    <Icon className="mr-1 h-3.5 w-3.5" />
                    {s.level === "safe" ? "Safe to Spray" : s.level === "caution" ? "Spray With Caution" : "Do Not Spray"}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{s.message}</p>
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;