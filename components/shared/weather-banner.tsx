"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Sun, Cloud, CloudRain, Thermometer, Wind, Droplets, Mountain, CloudSnow } from "lucide-react"

interface WeatherData {
  temperature: number
  condition: "sunny" | "cloudy" | "rainy" | "snow"
  humidity: number
  windSpeed: number
  description: string
  feelsLike: number
  visibility: number
  timestamp: number
  fetchTime: string
}

interface WeatherCache {
  [key: string]: WeatherData
}

// Coordenadas de Cajamarca
const CAJAMARCA_COORDS = {
  lat: -7.1611,
  lon: -78.5126,
}

// Horarios de actualización del clima (5 veces al día)
const WEATHER_SCHEDULE = [
  { hour: 6, minute: 0, name: "mañana" }, // 6:00 AM - Mañana temprano
  { hour: 12, minute: 0, name: "mediodía" }, // 12:00 PM - Mediodía
  { hour: 15, minute: 0, name: "tarde" }, // 3:00 PM - Tarde
  { hour: 18, minute: 0, name: "anochecer" }, // 6:00 PM - Anochecer
  { hour: 21, minute: 0, name: "noche" }, // 9:00 PM - Noche
]

export function WeatherBanner() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cacheStatus, setCacheStatus] = useState<string>("")

  useEffect(() => {
    const initializeWeather = async () => {
      const cachedWeather = getCachedWeather()

      if (cachedWeather) {
        setWeather(cachedWeather)
        setCacheStatus(`Datos desde caché (${cachedWeather.fetchTime})`)
        setLoading(false)

        // Verificar si necesita actualización en segundo plano
        if (shouldFetchNewWeather()) {
          fetchWeatherData(true) // Actualización silenciosa
        }
      } else {
        // No hay caché válido, hacer petición inicial
        await fetchWeatherData(false)
      }
    }

    initializeWeather()

    // Verificar cada 30 minutos si es hora de actualizar
    const interval = setInterval(
      () => {
        if (shouldFetchNewWeather()) {
          fetchWeatherData(true)
        }
      },
      30 * 60 * 1000,
    ) // 30 minutos

    return () => clearInterval(interval)
  }, [])

  const getCurrentTimeSlot = () => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = currentHour * 60 + currentMinute

    // Encontrar el slot de tiempo más cercano
    let closestSlot = WEATHER_SCHEDULE[0]
    let minDiff = Number.POSITIVE_INFINITY

    for (const slot of WEATHER_SCHEDULE) {
      const slotTime = slot.hour * 60 + slot.minute
      const diff = Math.abs(currentTime - slotTime)

      if (diff < minDiff) {
        minDiff = diff
        closestSlot = slot
      }
    }

    return closestSlot
  }

  const getCacheKey = () => {
    const today = new Date().toDateString()
    const timeSlot = getCurrentTimeSlot()
    return `weather_${today}_${timeSlot.name}`
  }

  const getCachedWeather = (): WeatherData | null => {
    try {
      const cacheKey = getCacheKey()
      const cached = localStorage.getItem(cacheKey)

      if (cached) {
        const weatherData = JSON.parse(cached) as WeatherData

        // Verificar que el caché no sea muy viejo (máximo 4 horas)
        const now = Date.now()
        const cacheAge = now - weatherData.timestamp
        const maxAge = 4 * 60 * 60 * 1000 // 4 horas

        if (cacheAge < maxAge) {
          return weatherData
        }
      }

      return null
    } catch (error) {
      console.error("Error reading cache:", error)
      return null
    }
  }

  const setCachedWeather = (weatherData: WeatherData) => {
    try {
      const cacheKey = getCacheKey()
      localStorage.setItem(cacheKey, JSON.stringify(weatherData))

      // Limpiar caché antiguo (mantener solo últimos 3 días)
      cleanOldCache()
    } catch (error) {
      console.error("Error saving to cache:", error)
    }
  }

  const cleanOldCache = () => {
    try {
      const keys = Object.keys(localStorage)
      const weatherKeys = keys.filter((key) => key.startsWith("weather_"))

      // Mantener solo los últimos 15 items (3 días × 5 slots)
      if (weatherKeys.length > 15) {
        weatherKeys
          .sort()
          .slice(0, weatherKeys.length - 15)
          .forEach((key) => localStorage.removeItem(key))
      }
    } catch (error) {
      console.error("Error cleaning cache:", error)
    }
  }

  const shouldFetchNewWeather = (): boolean => {
    const cachedWeather = getCachedWeather()

    if (!cachedWeather) return true

    const now = new Date()
    const currentTimeSlot = getCurrentTimeSlot()
    const nextFetchTime = new Date()
    nextFetchTime.setHours(currentTimeSlot.hour, currentTimeSlot.minute, 0, 0)

    // Si ya pasó la hora del slot actual, buscar el siguiente
    if (now > nextFetchTime) {
      const currentIndex = WEATHER_SCHEDULE.findIndex((slot) => slot.name === currentTimeSlot.name)
      const nextIndex = (currentIndex + 1) % WEATHER_SCHEDULE.length
      const nextSlot = WEATHER_SCHEDULE[nextIndex]

      nextFetchTime.setHours(nextSlot.hour, nextSlot.minute, 0, 0)

      // Si es el slot de mañana, agregar un día
      if (nextIndex === 0) {
        nextFetchTime.setDate(nextFetchTime.getDate() + 1)
      }
    }

    // Verificar si estamos en la ventana de tiempo para actualizar (±15 minutos)
    const timeDiff = Math.abs(now.getTime() - nextFetchTime.getTime())
    const fifteenMinutes = 15 * 60 * 1000

    return timeDiff <= fifteenMinutes
  }

  const fetchWeatherData = async (isSilentUpdate = false) => {
    try {
      if (!isSilentUpdate) {
        setLoading(true)
        setError(null)
      }

      const API_KEY = "5e7ef0d2b32adf6b60865c445dbfb23c"

      if (!API_KEY) {
        const fallbackWeather = getCajamarcaTypicalWeather()
        setWeather(fallbackWeather)
        setCachedWeather(fallbackWeather)
        setCacheStatus("Datos estimados (sin API)")
        return
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${CAJAMARCA_COORDS.lat}&lon=${CAJAMARCA_COORDS.lon}&appid=${API_KEY}&units=metric&lang=es`,
        {
          next: { revalidate: 1800 }, // Cache for 30 minutes
        },
      )

      if (!response.ok) {
        throw new Error("Error al obtener datos del clima")
      }

      const data = await response.json()
      const currentTimeSlot = getCurrentTimeSlot()

      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp),
        condition: mapWeatherCondition(data.weather[0].main),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6),
        description: getSpanishDescription(data.weather[0].main, data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        visibility: data.visibility ? Math.round(data.visibility / 1000) : 10,
        timestamp: Date.now(),
        fetchTime: `${currentTimeSlot.name} (${new Date().toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit",
        })})`,
      }

      setWeather(weatherData)
      setCachedWeather(weatherData)
      setCacheStatus(`Actualizado ${weatherData.fetchTime}`)
    } catch (err) {
      console.error("Error fetching weather:", err)

      if (!isSilentUpdate) {
        setError("No se pudo obtener el clima actual")
        const fallbackWeather = getCajamarcaTypicalWeather()
        setWeather(fallbackWeather)
        setCacheStatus("Datos estimados (error API)")
      }
    } finally {
      if (!isSilentUpdate) {
        setLoading(false)
      }
    }
  }

  const getCajamarcaTypicalWeather = (): WeatherData => {
    const now = new Date()
    const hour = now.getHours()
    const month = now.getMonth() + 1
    const currentTimeSlot = getCurrentTimeSlot()

    let baseTemp = 15
    let condition: WeatherData["condition"] = "cloudy"
    let humidity = 70

    // Ajustar por hora del día
    if (hour >= 6 && hour <= 12) {
      baseTemp += 3
    } else if (hour >= 13 && hour <= 17) {
      baseTemp += 5
    } else if (hour >= 18 && hour <= 21) {
      baseTemp += 1
    } else {
      baseTemp -= 2
    }

    // Ajustar por temporada
    if (month >= 6 && month <= 8) {
      baseTemp -= 2
      humidity = 60
      condition = Math.random() > 0.3 ? "sunny" : "cloudy"
    } else if (month >= 12 || month <= 3) {
      baseTemp += 1
      humidity = 85
      condition = Math.random() > 0.4 ? "rainy" : "cloudy"
    } else {
      condition = Math.random() > 0.5 ? "cloudy" : "sunny"
    }

    const finalTemp = Math.round(baseTemp + (Math.random() * 4 - 2))
    const finalHumidity = humidity + Math.round(Math.random() * 10 - 5)
    const finalWindSpeed = Math.round(8 + Math.random() * 8)

    return {
      temperature: finalTemp,
      condition,
      humidity: finalHumidity,
      windSpeed: finalWindSpeed,
      description: getLivestockEventDescription(condition, finalTemp, finalHumidity, finalWindSpeed),
      feelsLike: Math.round(finalTemp + (Math.random() * 2 - 1)),
      visibility: 10,
      timestamp: Date.now(),
      fetchTime: `${currentTimeSlot.name} (estimado)`,
    }
  }

  const mapWeatherCondition = (condition: string): WeatherData["condition"] => {
    switch (condition.toLowerCase()) {
      case "clear":
        return "sunny"
      case "clouds":
        return "cloudy"
      case "rain":
      case "drizzle":
        return "rainy"
      case "snow":
        return "snow"
      default:
        return "cloudy"
    }
  }

  const getLivestockEventDescription = (
    condition: WeatherData["condition"],
    temp: number,
    humidity: number,
    windSpeed: number,
  ): string => {
    // Evaluar condiciones para eventos ganaderos
    const isIdealTemp = temp >= 16 && temp <= 22
    const isHotDay = temp > 22
    const isColdDay = temp < 12
    const isHighHumidity = humidity > 80
    const isLowHumidity = humidity < 60
    const isWindy = windSpeed > 20
    const isCalm = windSpeed < 8

    switch (condition) {
      case "sunny":
        if (isIdealTemp && !isHighHumidity) {
          return "Soleado - Ideal para eventos ganaderos"
        }
        if (isHotDay) {
          return "Soleado y cálido - Programar eventos temprano o tardío"
        }
        if (isColdDay) {
          return "Soleado pero fresco - Excelente para ganado, considerar abrigo"
        }
        if (isHighHumidity) {
          return "Soleado con humedad - Asegurar hidratación del ganado"
        }
        return "Soleado - Condiciones favorables para actividades"

      case "cloudy":
        if (isIdealTemp && !isHighHumidity) {
          return "Parcialmente nublado - Condiciones favorables"
        }
        if (isHotDay) {
          return "Nublado - Protección natural del sol para el ganado"
        }
        if (isColdDay) {
          return "Nublado y fresco - Condiciones estables"
        }
        if (isWindy) {
          return "Nublado y ventoso - Proteger del viento"
        }
        if (isHighHumidity) {
          return "Nublado con alta humedad - Monitorear comodidad animal"
        }
        return "Nublado - Condiciones estables para eventos"

      case "rainy":
        if (windSpeed > 15) {
          return "Lluvia con viento - Eventos bajo techo obligatorio"
        }
        if (isHotDay && humidity > 85) {
          return "Lluvia ligera - Considerar eventos bajo techo"
        }
        if (isColdDay) {
          return "Lluvia fría - Proteger ganado, eventos en interior"
        }
        if (temp >= 15 && temp <= 18 && windSpeed < 12) {
          return "Lluvia ligera - Considerar eventos bajo techo"
        }
        return "Lluvia presente - Planificar eventos bajo techo"

      case "snow":
        return "Nevadas en las alturas - Condiciones especiales"

      default:
        if (isIdealTemp && !isHighHumidity && !isWindy) {
          return "Condiciones favorables para eventos ganaderos"
        }
        return "Condiciones variables - Monitorear el clima"
    }
  }

  const getSpanishDescription = (condition: string, temp: number): string => {
    // Esta función se usa para datos de API real
    const isWarm = temp > 18
    const isCold = temp < 12

    switch (condition) {
      case "sunny":
      case "clear":
        if (isWarm) return "Soleado y cálido - Programar eventos temprano o tardío"
        if (isCold) return "Soleado pero fresco - Excelente para ganado, considerar abrigo"
        return "Soleado - Ideal para eventos ganaderos"

      case "cloudy":
      case "clouds":
        if (isCold) return "Nublado y fresco - Condiciones estables"
        return "Parcialmente nublado - Condiciones favorables"

      case "rainy":
      case "rain":
      case "drizzle":
        if (temp >= 15 && temp <= 18) {
          return "Lluvia ligera - Considerar eventos bajo techo"
        }
        return "Lluvia presente - Planificar eventos bajo techo"

      case "snow":
        return "Nevadas en las alturas - Condiciones especiales"

      default:
        return "Condiciones variables - Monitorear el clima"
    }
  }

  const getNextUpdateTime = () => {
    const now = new Date()
    const currentTimeSlot = getCurrentTimeSlot()
    const currentIndex = WEATHER_SCHEDULE.findIndex((slot) => slot.name === currentTimeSlot.name)
    const nextIndex = (currentIndex + 1) % WEATHER_SCHEDULE.length
    const nextSlot = WEATHER_SCHEDULE[nextIndex]

    const nextUpdate = new Date()
    nextUpdate.setHours(nextSlot.hour, nextSlot.minute, 0, 0)

    if (nextIndex === 0 || nextUpdate <= now) {
      nextUpdate.setDate(nextUpdate.getDate() + 1)
    }

    return nextUpdate.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 mb-6">
        <div className="flex items-center justify-center">
          <div className="animate-pulse flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            <span>Obteniendo clima actual de Cajamarca...</span>
          </div>
        </div>
      </Card>
    )
  }

  if (!weather) return null

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun className="h-6 w-6 text-yellow-300" />
      case "cloudy":
        return <Cloud className="h-6 w-6 text-gray-200" />
      case "rainy":
        return <CloudRain className="h-6 w-6 text-blue-200" />
      case "snow":
        return <CloudSnow className="h-6 w-6 text-blue-100" />
      default:
        return <Sun className="h-6 w-6 text-yellow-300" />
    }
  }

  const getBackgroundColor = (condition: string) => {
    switch (condition) {
      case "sunny":
        return "from-orange-500 to-yellow-500"
      case "cloudy":
        return "from-gray-500 to-blue-500"
      case "rainy":
        return "from-blue-600 to-indigo-600"
      case "snow":
        return "from-blue-700 to-purple-600"
      default:
        return "from-blue-500 to-blue-600"
    }
  }

  return (
    <Card className={`bg-gradient-to-r ${getBackgroundColor(weather.condition)} text-white p-4 mb-6 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Mountain className="h-5 w-5" />
            <span className="font-semibold">Cajamarca</span>
            {error && <span className="text-xs bg-yellow-500/20 px-2 py-1 rounded">Offline</span>}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              {getWeatherIcon(weather.condition)}
              <span className="text-2xl font-bold">{weather.temperature}°C</span>
              <span className="text-sm opacity-75">(Se siente {weather.feelsLike}°C)</span>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Droplets className="h-4 w-4" />
                <span>{weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind className="h-4 w-4" />
                <span>{weather.windSpeed} km/h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium">{weather.description}</p>
          <p className="text-xs opacity-90">2,750 msnm</p>
          <p className="text-xs opacity-75">{cacheStatus}</p>
          <p className="text-xs opacity-60">Próx. actualización: {getNextUpdateTime()}</p>
        </div>
      </div>

      {/* Información adicional en móvil */}
      <div className="sm:hidden mt-3 pt-3 border-t border-white/20">
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1">
            <Droplets className="h-4 w-4" />
            <span>Humedad: {weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="h-4 w-4" />
            <span>Viento: {weather.windSpeed} km/h</span>
          </div>
        </div>
        <div className="mt-2 text-xs opacity-75 text-center">
          {cacheStatus} • Próx.: {getNextUpdateTime()}
        </div>
      </div>
    </Card>
  )
}
