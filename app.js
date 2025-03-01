const apiKey = 'YOUR API KEY';
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes
let cache = new Map();

//for icon classes
const weatherIcons = {
  "Clear": "fa-sun",
  "clear sky": "fa-sun",
  "Clouds": "fa-cloud",
  "Rain": "fa-cloud-rain",
  "Drizzle": "fa-cloud-rain",
  "light rain": "fa-cloud-rain",
  "snow": "fa-snowflake",
  "Thunderstorm": "fa-bolt",
  "Mist": "fa-smog"
};

//for background image
const backgroundIMG = {
    "Clear": "images/sunny.jpg",
    "clear sky": "images/sunny.jpg",
    "snow": "images/snowy.jpg",
    "Rain": "images/heavyrain1.jpg",
    "Clouds": "images/claudy.jpg",
    "Drizzle": "images/heavyrain1.jpg",
    "light rain": "images/heavyrain1.jpg",
    "Mist": "images/mist.jpg",
    "Thunderstorm": "images/thunderstorm.jpg"
};

class WeatherApp {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.searchbar = document.querySelector('#searchbar');
        this.loading = document.querySelector('.loading');
        this.errorMessage = document.querySelector('.error-message');
        this.d1Icon = document.querySelector('.d1Icon');
        this.d2Icon = document.querySelector('.d2Icon');
        this.d3Icon = document.querySelector('.d3Icon');
        this.d4Icon = document.querySelector('.d4Icon');
        this.degreeElement = document.querySelector('.degree');
        this.cityElement = document.querySelector('.city');
        this.countryElement = document.querySelector('.country');
        this.dayWeekElement = document.querySelector('.dayWeek');
        this.weatherIconElement = document.querySelector('.wicon');
        this.windSpeedElement = document.querySelector('.hiz');
        this.d1name = document.querySelector('.d1name');
        this.d2name = document.querySelector('.d2name');
        this.d3name = document.querySelector('.d3name');
        this.d4name = document.querySelector('.d4name');
        this.nemElement = document.querySelector('.hum');
        this.infocont = document.querySelector('.infoContainer');
    }

    setupEventListeners() {
        this.searchbar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
    }

    async handleSearch() {
        const city = this.searchbar.value.trim();
        if (!city) return;

        try {
            this.showLoading();
            await this.getWeather(city);
            this.hideError();
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        this.loading.classList.add('active');
    }

    hideLoading() {
        this.loading.classList.remove('active');
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }

    async getWeather(city = 'İzmir') {
        const cacheKey = `weather_${city}`;
        const cachedData = cache.get(cacheKey);

        if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
            this.updateUI(cachedData.data);
            return;
        }

        const currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        
        try {
            const weatherData = await this.fetchWeatherData(currentURL);
            cache.set(cacheKey, {
                timestamp: Date.now(),
                data: weatherData
            });
            this.updateUI(weatherData);
        } catch (error) {
            throw new Error('Could not fetch weather data. Please try again.');
        }
    }

    async fetchWeatherData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return response.json();
    }

    updateUI(weatherData) {
        const humidity = weatherData.main.humidity;
        const countryName = weatherData.sys.country;
        const cityName = weatherData.name.replace(" Province", "");
        const temperature = Math.floor(weatherData.main.temp);
        let windSpeed = weatherData.wind.speed * 3.6;

        this.windSpeedElement.textContent = windSpeed.toFixed(1) + ' km/H';
        this.countryElement.textContent = countryName;
        this.cityElement.textContent = cityName;

        if (cityName.length > 9) {
            this.infocont.style.fontSize = "2.48rem";
        }

        this.degreeElement.textContent = temperature;
        this.nemElement.textContent = humidity + '%';

        const { lat, lon } = weatherData.coord;
        this.getForecast(lat, lon);
        this.updateWeatherIcon(weatherData.weather[0].main);
        this.setBGIMG(weatherData.weather[0].main);
    }

    async getForecast(lat, lon) {
        const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await fetch(forecastURL);
        if (!response.ok) {
            throw new Error(`Forecast API error: ${response.status}`);
        }
        const forecastData = await response.json();
        this.dailyForecasts = forecastData.list;
        this.updateForecastUI();
    }

    updateForecastUI() {
        const today = new Date();
        const dayIndex = today.getDay();
        const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const abbrevDaysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        this.dayWeekElement.textContent = daysOfWeek[(dayIndex + 6) % 7];
        this.d1name.textContent = abbrevDaysOfWeek[((dayIndex + 1) % 7)];
        this.d2name.textContent = abbrevDaysOfWeek[((dayIndex + 2) % 7)];
        this.d3name.textContent = abbrevDaysOfWeek[((dayIndex + 3) % 7)];
        this.d4name.textContent = abbrevDaysOfWeek[((dayIndex + 4) % 7)];

        const futureDates = [];
        for (let i = 1; i <= 4; i++) {
            const futureDate = new Date();
            futureDate.setDate(today.getDate() + i);
            const formattedDate = futureDate.toISOString().split('T')[0];
            futureDates.push(formattedDate);
        }

        this.getAverageTemperatureForDate(futureDates[0], 'd1AverageTemperature', 'd1Humidity');
        this.getAverageTemperatureForDate(futureDates[1], 'd2AverageTemperature', 'd2Humidity');
        this.getAverageTemperatureForDate(futureDates[2], 'd3AverageTemperature', 'd3Humidity');
        this.getAverageTemperatureForDate(futureDates[3], 'd4AverageTemperature', 'd4Humidity');

        let weatherCondition1 = this.getWeatherForDate(futureDates[0]);
        this.updateDaysWeatherIcon(weatherCondition1, 'd1Icon');

        let weatherCondition2 = this.getWeatherForDate(futureDates[1]);
        this.updateDaysWeatherIcon(weatherCondition2, 'd2Icon');

        let weatherCondition3 = this.getWeatherForDate(futureDates[2]);
        this.updateDaysWeatherIcon(weatherCondition3, 'd3Icon');

        let weatherCondition4 = this.getWeatherForDate(futureDates[3]);
        this.updateDaysWeatherIcon(weatherCondition4, 'd4Icon');
    }

    getAverageTemperatureForDate(date, avgtmpelement, humidityelement) {
        const forecastsForDate = this.dailyForecasts.filter(forecast => forecast.dt_txt.startsWith(date));
        if (forecastsForDate.length === 0) {
            return 'No Data available';
        }

        let totaltemp = 0;
        forecastsForDate.forEach(forecast => {
            totaltemp += forecast.main.temp;
        });

        const averageTemp = totaltemp / forecastsForDate.length;
        let avgTempElement = document.querySelector(`.${avgtmpelement}`);
        let humidityElement = document.querySelector(`.${humidityelement}`);
        avgTempElement.textContent = averageTemp.toFixed(0);

        const targetTime = `${date} 09:00:00`;
        const humidityForDate = this.dailyForecasts.find(forecast => forecast.dt_txt === targetTime);
        let humidity = humidityForDate.main.humidity;
        humidityElement.textContent = humidity;
    }

    updateDaysWeatherIcon(weatherCondition, day) {
        const weatherIconElement = document.querySelector(`.${day}`);
        const iconClass = weatherIcons[weatherCondition];
        weatherIconElement.className = `fa-solid ${iconClass} ${day} dIcon`;
    }

    updateWeatherIcon(weatherCondition) {
        const weatherIconElement = document.querySelector('.wicon');
        const iconClass = weatherIcons[weatherCondition] || "fa-question";
        weatherIconElement.className = `fa-solid ${iconClass} wicon`;
    }

    setBGIMG(weatherCondition) {
        let backımg = document.querySelector('body');
        backımg.style.backgroundImage = `url(${backgroundIMG[weatherCondition]})`;
    }

    getWeatherForDate(date) {
        const targetTime = `${date} 09:00:00`;
        const weatherForDate = this.dailyForecasts.find(forecast => forecast.dt_txt === targetTime);

        if (weatherForDate) {
            let description = weatherForDate.weather[0].description;

            if (description.includes('clouds')) {
                description = 'Clouds';
            }

            return description;
        }
    }
}

// Initialize the app
const weatherApp = new WeatherApp();
window.onload = () => weatherApp.getWeather();
