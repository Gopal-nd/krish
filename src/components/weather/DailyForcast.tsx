'use client'
import { DailyWeatherData } from "@/types/weather";
import { Sun, Moon, CloudRain, Wind, Thermometer, Cloud, Umbrella, Droplet, Compass } from 'lucide-react'; // Import Lucide icons

const data =                   
{
  "city": {
    "id": 3163858,
    "name": "Zocca",
    "coord": {
      "lon": 10.99,
      "lat": 44.34
    },
    "country": "IT",
    "population": 4593,
    "timezone": 7200
  },
  "cod": "200",
  "message": 0.0582563,
  "cnt": 7,
  "list": [
    {
      "dt": 1661857200,
      "sunrise": 1661834187,
      "sunset": 1661882248,
      "temp": {
        "day": 299.66,
        "min": 288.93,
        "max": 299.66,
        "night": 290.31,
        "eve": 297.16,
        "morn": 288.93
      },
      "feels_like": {
        "day": 299.66,
        "night": 290.3,
        "eve": 297.1,
        "morn": 288.73
      },
      "pressure": 1017,
      "humidity": 44,
      "weather": [
        {
          "id": 500,
          "main": "Rain",
          "description": "light rain",
          "icon": "10d"
        }
      ],
      "speed": 2.7,
      "deg": 209,
      "gust": 3.58,
      "clouds": 53,
      "pop": 0.7,
      "rain": 2.51
    },
    {
      "dt": 1661943600,
      "sunrise": 1661920656,
      "sunset": 1661968542,
      "temp": {
        "day": 295.76,
        "min": 287.73,
        "max": 295.76,
        "night": 289.37,
        "eve": 292.76,
        "morn": 287.73
      },
      "feels_like": {
        "day": 295.64,
        "night": 289.45,
        "eve": 292.97,
        "morn": 287.59
      },
      "pressure": 1014,
      "humidity": 60,
      "weather": [
        {
          "id": 500,
          "main": "Rain",
          "description": "light rain",
          "icon": "10d"
        }
      ],
      "speed": 2.29,
      "deg": 215,
      "gust": 3.27,
      "clouds": 66,
      "pop": 0.82,
      "rain": 5.32
    },
    {
      "dt": 1662030000,
      "sunrise": 1662007126,
      "sunset": 1662054835,
      "temp": {
        "day": 293.38,
        "min": 287.06,
        "max": 293.38,
        "night": 287.06,
        "eve": 289.01,
        "morn": 287.84
      },
      "feels_like": {
        "day": 293.31,
        "night": 287.01,
        "eve": 289.05,
        "morn": 287.85
      },
      "pressure": 1014,
      "humidity": 71,
      "weather": [
        {
          "id": 500,
          "main": "Rain",
          "description": "light rain",
          "icon": "10d"
        }
      ],
      "speed": 2.67,
      "deg": 60,
      "gust": 2.66,
      "clouds": 97,
      "pop": 0.84,
      "rain": 4.49
    },
    {
        "dt": 1661857200,
        "sunrise": 1661834187,
        "sunset": 1661882248,
        "temp": {
          "day": 299.66,
          "min": 288.93,
          "max": 299.66,
          "night": 290.31,
          "eve": 297.16,
          "morn": 288.93
        },
        "feels_like": {
          "day": 299.66,
          "night": 290.3,
          "eve": 297.1,
          "morn": 288.73
        },
        "pressure": 1017,
        "humidity": 44,
        "weather": [
          {
            "id": 500,
            "main": "Rain",
            "description": "light rain",
            "icon": "10d"
          }
        ],
        "speed": 2.7,
        "deg": 209,
        "gust": 3.58,
        "clouds": 53,
        "pop": 0.7,
        "rain": 2.51
      },
      {
        "dt": 1661943600,
        "sunrise": 1661920656,
        "sunset": 1661968542,
        "temp": {
          "day": 295.76,
          "min": 287.73,
          "max": 295.76,
          "night": 289.37,
          "eve": 292.76,
          "morn": 287.73
        },
        "feels_like": {
          "day": 295.64,
          "night": 289.45,
          "eve": 292.97,
          "morn": 287.59
        },
        "pressure": 1014,
        "humidity": 60,
        "weather": [
          {
            "id": 500,
            "main": "Rain",
            "description": "light rain",
            "icon": "10d"
          }
        ],
        "speed": 2.29,
        "deg": 215,
        "gust": 3.27,
        "clouds": 66,
        "pop": 0.82,
        "rain": 5.32
      },
      {
        "dt": 1662030000,
        "sunrise": 1662007126,
        "sunset": 1662054835,
        "temp": {
          "day": 293.38,
          "min": 287.06,
          "max": 293.38,
          "night": 287.06,
          "eve": 289.01,
          "morn": 287.84
        },
        "feels_like": {
          "day": 293.31,
          "night": 287.01,
          "eve": 289.05,
          "morn": 287.85
        },
        "pressure": 1014,
        "humidity": 71,
        "weather": [
          {
            "id": 500,
            "main": "Rain",
            "description": "light rain",
            "icon": "10d"
          }
        ],
        "speed": 2.67,
        "deg": 60,
        "gust": 2.66,
        "clouds": 97,
        "pop": 0.84,
        "rain": 4.49
      },  {
        "dt": 1661857200,
        "sunrise": 1661834187,
        "sunset": 1661882248,
        "temp": {
          "day": 299.66,
          "min": 288.93,
          "max": 299.66,
          "night": 290.31,
          "eve": 297.16,
          "morn": 288.93
        },
        "feels_like": {
          "day": 299.66,
          "night": 290.3,
          "eve": 297.1,
          "morn": 288.73
        },
        "pressure": 1017,
        "humidity": 44,
        "weather": [
          {
            "id": 500,
            "main": "Rain",
            "description": "light rain",
            "icon": "10d"
          }
        ],
        "speed": 2.7,
        "deg": 209,
        "gust": 3.58,
        "clouds": 53,
        "pop": 0.7,
        "rain": 2.51
      },
      {
        "dt": 1661943600,
        "sunrise": 1661920656,
        "sunset": 1661968542,
        "temp": {
          "day": 295.76,
          "min": 287.73,
          "max": 295.76,
          "night": 289.37,
          "eve": 292.76,
          "morn": 287.73
        },
        "feels_like": {
          "day": 295.64,
          "night": 289.45,
          "eve": 292.97,
          "morn": 287.59
        },
        "pressure": 1014,
        "humidity": 60,
        "weather": [
          {
            "id": 500,
            "main": "Rain",
            "description": "light rain",
            "icon": "10d"
          }
        ],
        "speed": 2.29,
        "deg": 215,
        "gust": 3.27,
        "clouds": 66,
        "pop": 0.82,
        "rain": 5.32
      },
      {
        "dt": 1662030000,
        "sunrise": 1662007126,
        "sunset": 1662054835,
        "temp": {
          "day": 293.38,
          "min": 287.06,
          "max": 293.38,
          "night": 287.06,
          "eve": 289.01,
          "morn": 287.84
        },
        "feels_like": {
          "day": 293.31,
          "night": 287.01,
          "eve": 289.05,
          "morn": 287.85
        },
        "pressure": 1014,
        "humidity": 71,
        "weather": [
          {
            "id": 500,
            "main": "Rain",
            "description": "light rain",
            "icon": "10d"
          }
        ],
        "speed": 2.67,
        "deg": 60,
        "gust": 2.66,
        "clouds": 97,
        "pop": 0.84,
        "rain": 4.49
      },  {
        "dt": 1661857200,
        "sunrise": 1661834187,
        "sunset": 1661882248,
        "temp": {
          "day": 299.66,
          "min": 288.93,
          "max": 299.66,
          "night": 290.31,
          "eve": 297.16,
          "morn": 288.93
        },
        "feels_like": {
          "day": 299.66,
          "night": 290.3,
          "eve": 297.1,
          "morn": 288.73
        },
        "pressure": 1017,
        "humidity": 44,
        "weather": [
          {
            "id": 500,
            "main": "Rain",
            "description": "light rain",
            "icon": "10d"
          }
        ],
        "speed": 2.7,
        "deg": 209,
        "gust": 3.58,
        "clouds": 53,
        "pop": 0.7,
        "rain": 2.51
      },
      {
        "dt": 1661943600,
        "sunrise": 1661920656,
        "sunset": 1661968542,
        "temp": {
          "day": 295.76,
          "min": 287.73,
          "max": 295.76,
          "night": 289.37,
          "eve": 292.76,
          "morn": 287.73
        },
        "feels_like": {
          "day": 295.64,
          "night": 289.45,
          "eve": 292.97,
          "morn": 287.59
        },
        "pressure": 1014,
        "humidity": 60,
        "weather": [
          {
            "id": 500,
            "main": "Rain",
            "description": "light rain",
            "icon": "10d"
          }
        ],
        "speed": 2.29,
        "deg": 215,
        "gust": 3.27,
        "clouds": 66,
        "pop": 0.82,
        "rain": 5.32
      },
      {
        "dt": 1662030000,
        "sunrise": 1662007126,
        "sunset": 1662054835,
        "temp": {
          "day": 293.38,
          "min": 287.06,
          "max": 293.38,
          "night": 287.06,
          "eve": 289.01,
          "morn": 287.84
        },
        "feels_like": {
          "day": 293.31,
          "night": 287.01,
          "eve": 289.05,
          "morn": 287.85
        },
        "pressure": 1014,
        "humidity": 71,
        "weather": [
          {
            "id": 500,
            "main": "Rain",
            "description": "light rain",
            "icon": "10d"
          }
        ],
        "speed": 2.67,
        "deg": 60,
        "gust": 2.66,
        "clouds": 97,
        "pop": 0.84,
        "rain": 4.49
      }]
}

const weatherData= data.list;
                   
                
// const DailyForecast = ({ weatherData }: { weatherData: DailyWeatherData[] }) => {
const DailyForecast = () => {
    return (
        <div className="p-2 pt-4 border-t rounded-lg shadow-md max-w-5xl mx-auto">
            <h2 className="text-xl font-semibold mb-4 ">Daily Forecast (fake)</h2>
        <div className="p-4 space-y-4">
      {weatherData.map((dayData, index) => (
        <div
          key={index}
          className="w-full p-4  rounded-lg shadow-lg flex flex-col border"
        >
          {/* Date */}
          <p className="font-semibold text-lg mb-2">
            {new Date(Date.now()+index*86400000).toLocaleDateString([], {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          {/* Sunrise and Sunset */}
          <div className="flex justify-between mb-4">
            <p>
            🌅 Sunrise:{' '}
              {new Date(dayData.sunrise * 1000).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p>
            🌇 Sunset:{' '}
              {new Date(dayData.sunset * 1000).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {/* Temperature Details */}
          <div className="flex flex-wrap justify-between mb-4">
            <p>
              <Thermometer className="inline " size={16} /> Day: {Math.round(dayData.temp.day - 273.15)}°C
            </p>
            <p>
              <Thermometer className="inline " size={16} /> Night: {Math.round(dayData.temp.night - 273.15)}°C
            </p>
          </div>

          {/* Weather Description */}
          <div className="flex justify-center items-center mb-4">
            <img
              src={`http://openweathermap.org/img/wn/${dayData.weather[0].icon}.png`}
              alt={dayData.weather[0].description}
              className="w-10 h-10 mr-2"
            />
            <p>
              {dayData.weather[0].main} - {dayData.weather[0].description}
            </p>
          </div>

          {/* Pressure, Humidity, and Wind */}
          <div className="flex flex-wrap justify-between mb-4">
            <p>
              💧Humidity: {dayData.humidity}%
            </p>
            <p>
             🌬️ Wind Speed: {dayData.speed} m/s
            </p>
          </div>

          {/* Rain and Clouds */}
          <div className="flex flex-wrap justify-between">
            <p>
             🌧️ Rain: {dayData.rain || 0} mm
            </p>
            <p>
             ☁️ Clouds: {dayData.clouds}%
            </p>
          </div>
        </div>
      ))}
    </div>
    </div>
    );
  };
  
  export default DailyForecast;