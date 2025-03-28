interface WeatherData {
  location: string;
  date: string;
  current: {
    temp: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    rainChance: number;
  };
  forecast: Array<{
    day: string;
    condition: string;
    icon: string;
    tempMin: number;
    tempMax: number;
  }>;
}

interface WeatherWidgetProps {
  weatherData: WeatherData;
}

export const WeatherWidget = ({ weatherData }: WeatherWidgetProps) => {
  // Function to get weather icon
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
        return "fas fa-sun";
      case "partly cloudy":
        return "fas fa-cloud-sun";
      case "cloudy":
        return "fas fa-cloud";
      case "rainy":
        return "fas fa-cloud-rain";
      case "stormy":
        return "fas fa-bolt";
      default:
        return "fas fa-cloud-sun";
    }
  };

  const { current, forecast } = weatherData;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="font-bold text-slate-dark mb-4">Weather Conditions</h2>
      <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-lg">{weatherData.location}</h3>
            <p className="text-blue-100">{weatherData.date}</p>
          </div>
          <div className="text-4xl">
            <i className={getWeatherIcon(current.condition)}></i>
          </div>
        </div>
        <div className="text-3xl font-bold mt-4">{current.temp}°C</div>
        <div className="flex items-center mt-1 text-blue-100">
          <span>{current.condition}</span>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-sm text-blue-100">Humidity</p>
            <p className="font-bold">{current.humidity}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-blue-100">Wind</p>
            <p className="font-bold">{current.windSpeed} km/h</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-blue-100">Rain</p>
            <p className="font-bold">{current.rainChance}%</p>
          </div>
        </div>
      </div>

      <h3 className="font-medium text-slate-dark mt-6 mb-3">7-Day Forecast</h3>
      <div className="space-y-2">
        {forecast.map((day, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-gray-500 w-20">{day.day}</span>
            <div className="flex items-center w-20">
              <i className={`${getWeatherIcon(day.condition)} mr-2`}></i>
              <span>{day.condition}</span>
            </div>
            <div className="flex items-center justify-end w-24">
              <span>{day.tempMin}°C</span>
              <span className="mx-1 text-gray-400">/</span>
              <span>{day.tempMax}°C</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
