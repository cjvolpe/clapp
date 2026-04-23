import {useEffect, useState} from "react";
import "../pages/styles/weatherwidget.css";

interface WeatherData {
    temperature: number;
    apparentTemperature: number;
    precipitation: number;
    windSpeed: number;
    weatherCode: number;
}

interface ClimbingVerdict {
    good: boolean;
    label: string;
    reason: string;
}

const WEATHER_CODE_LABELS: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
};

function describeWeather(code: number): string {
    return WEATHER_CODE_LABELS[code] ?? "Unknown conditions";
}

function evaluateClimbing(weather: WeatherData): ClimbingVerdict {
    const {temperature, precipitation, windSpeed, weatherCode} = weather;

    if (precipitation > 0.1 || (weatherCode >= 51 && weatherCode <= 99)) {
        return {good: false, label: "Not great", reason: "Wet rock — best to wait it out or hit the gym."};
    }
    if (temperature < 2) {
        return {good: false, label: "Too cold", reason: "Freezing temps make holds painful and risky."};
    }
    if (temperature > 32) {
        return {good: false, label: "Too hot", reason: "Skin and friction suffer in the heat."};
    }
    if (windSpeed > 40) {
        return {good: false, label: "Too windy", reason: "High winds make belaying and rope work sketchy."};
    }
    if (temperature >= 8 && temperature <= 22 && windSpeed < 25) {
        return {good: true, label: "Send weather", reason: "Cool, dry, and calm — prime conditions."};
    }
    return {good: true, label: "Good to go", reason: "Conditions look workable for outdoor climbing."};
}

export default function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
            return;
        }

        const fetchWeather = async (latitude: number, longitude: number) => {
            try {
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code&timezone=auto`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Weather request failed: ${response.status}`);
                }
                const data = await response.json();
                const current = data.current;
                setWeather({
                    temperature: current.temperature_2m,
                    apparentTemperature: current.apparent_temperature,
                    precipitation: current.precipitation,
                    windSpeed: current.wind_speed_10m,
                    weatherCode: current.weather_code,
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load weather.");
            } finally {
                setLoading(false);
            }
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeather(position.coords.latitude, position.coords.longitude);
            },
            (geoError) => {
                setError(
                    geoError.code === geoError.PERMISSION_DENIED
                        ? "Location permission denied — enable it for a climbing forecast."
                        : "Couldn't read your location."
                );
                setLoading(false);
            },
            {timeout: 10000, maximumAge: 5 * 60 * 1000}
        );
    }, []);

    if (loading) {
        return (
            <div className={"weather-widget loading"}>
                <p>Checking the weather…</p>
            </div>
        );
    }

    if (error || !weather) {
        return (
            <div className={"weather-widget error"}>
                <p className={"weather-title"}>Weather unavailable</p>
                <p className={"weather-detail"}>{error ?? "No data."}</p>
            </div>
        );
    }

    const verdict = evaluateClimbing(weather);

    return (
        <div className={`weather-widget ${verdict.good ? "good" : "bad"}`}>
            <div className={"weather-summary"}>
                <p className={"weather-title"}>{describeWeather(weather.weatherCode)}</p>
                <p className={"weather-temp"}>{Math.round(weather.temperature)}°C</p>
            </div>
            <div className={"weather-meta"}>
                <span>Feels {Math.round(weather.apparentTemperature)}°C</span>
                <span>Wind {Math.round(weather.windSpeed)} km/h</span>
                <span>Precip {weather.precipitation} mm</span>
            </div>
            <div className={"weather-verdict"}>
                <span className={"verdict-label"}>
                    {verdict.good ? "✓" : "✗"} Outdoor climbing: {verdict.label}
                </span>
                <span className={"verdict-reason"}>{verdict.reason}</span>
            </div>
        </div>
    );
}
