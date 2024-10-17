// Your API KEY
const apiKey = 'YOUR API KEY'; 
let searchbar=document.querySelector('#searchbar');

let city = 'İzmir';

// current api call url
let currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

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



let dailyForecasts=[];
let futureDates=[];


// Select HTML elements from the document
let d1Icon=document.querySelector('.d1Icon');
let d2Icon=document.querySelector('.d2Icon');
let d3Icon=document.querySelector('.d3Icon');
let d4Icon=document.querySelector('.d4Icon');

let degreeElement = document.querySelector('.degree');
let cityElement=document.querySelector('.city');
let countryElement=document.querySelector('.country');
let dayWeekElement=document.querySelector('.dayWeek');
let weatherIconElement=document.querySelector('.wicon');
let windSpeedElement=document.querySelector('.hiz');
let d1name=document.querySelector('.d1name');
let d2name=document.querySelector('.d2name');
let d3name=document.querySelector('.d3name');
let d4name=document.querySelector('.d4name');
const nemElement=document.querySelector('.hum');
let infocont=document.querySelector('.infoContainer');

// Displays the current day and the next four days.
let today= new Date();
let dayIndex=today.getDay();
const daysOfWeek = [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday","sunday"];
const abbrevDaysOfWeek=["Mon", "Tue", "Wed", "Thu", "Fri", "Sat","Sun"];
dayWeekElement.textContent=daysOfWeek[(dayIndex+6)%7]
d1name.textContent=abbrevDaysOfWeek[((dayIndex+1)%7)];
d2name.textContent=abbrevDaysOfWeek[((dayIndex+2)%7)];
d3name.textContent=abbrevDaysOfWeek[((dayIndex+3)%7)];
d4name.textContent=abbrevDaysOfWeek[((dayIndex+4)%7)];



for (let i=1;i<=4;i++){
    const futureDate=new Date();
    futureDate.setDate(today.getDate()+i);
    const formattedDate=futureDate.toISOString().split('T')[0];
    futureDates.push(formattedDate);
}

async function getWeather() {
    try {
        //  api call
        const responseCurrent = await fetch(currentURL);
        
        if (!responseCurrent.ok) {
            throw new Error(`Mevcut hava durumu API hatası: ${responseCurrent.status}`);
        }
        
        // Receive response in JSON format.
        const currentWeatherData = await responseCurrent.json();
        



        //data from current weather API
        const humidity=currentWeatherData.main.humidity;
        const countryName=currentWeatherData.sys.country;
        const cityName = currentWeatherData.name.replace(" Province","");
        const temperature = Math.floor(currentWeatherData.main.temp);
        let windSpeed=currentWeatherData.wind.speed*3.6;
        
        


        

        // Display the data fetched from the API in the DOM

        windSpeedElement.textContent=windSpeed.toFixed(1)+' km/H',
        // To set Monday as the first day of the week
        
        countryElement.textContent=countryName;
        cityElement.textContent=cityName;

        if(cityName.length>9){
            infocont.style.fontSize="2.48rem";
        }


        degreeElement.textContent = temperature;
        
        nemElement.textContent=humidity+'%';
        
        






        
        // Get the coordinate information
        const { lat, lon } = currentWeatherData.coord;

        
        // Second API URL: For the weather forecast of the coming days

        const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;





        // Second API call: For the weather forecast of the coming days
        const responseForecast = await fetch(forecastURL);
        
        if (!responseForecast.ok) {
            throw new Error(`Gelecek günlerin hava durumu API hatası: ${responseForecast.status}`);
        }
        
        // Receive response in JSON format.

        const forecastData = await responseForecast.json();
         dailyForecasts = forecastData.list; 
        

        
        

















        // updateDaysWeatherIcon((getWeatherForDate(futureDates[0])),'d1Icon')
        getAverageTemperatureForDate(futureDates[0],'d1AverageTemperature','d1Humidity');
        getAverageTemperatureForDate(futureDates[1],'d2AverageTemperature','d2Humidity');
        getAverageTemperatureForDate(futureDates[2],'d3AverageTemperature','d3Humidity');
        getAverageTemperatureForDate(futureDates[3],'d4AverageTemperature','d4Humidity');
        
        let weatherCondition1=getWeatherForDate(futureDates[0]);
        updateDaysWeatherIcon(weatherCondition1,'d1Icon')


        let weatherCondition2=getWeatherForDate(futureDates[1]);
        updateDaysWeatherIcon(weatherCondition2,'d2Icon')

        let weatherCondition3=getWeatherForDate(futureDates[2]);
        updateDaysWeatherIcon(weatherCondition3,'d3Icon')

        let weatherCondition4=getWeatherForDate(futureDates[3]);
        updateDaysWeatherIcon(weatherCondition4,'d4Icon')
        






        const weatherCondition = currentWeatherData.weather[0].main

        updateWeatherIcon(weatherCondition);
        setBGIMG(weatherCondition)



        
    } catch (error) {
        console.error('Hata:', error);
    }



    
}

//for getting average temp and humidity for next days
function getAverageTemperatureForDate(date,avgtmpelement,humidityelement){
    const forecastsForDate=dailyForecasts.filter(forecast=>forecast.dt_txt.startsWith(date));
    if (forecastsForDate.length===0){
        return 'No Data available';
    }

    let totaltemp=0;
    forecastsForDate.forEach(forecast => {
        totaltemp+=forecast.main.temp;
    });

    const averageTemp=totaltemp/forecastsForDate.length;
    let avgTempElement=document.querySelector(`.${avgtmpelement}`)
    let humidityElement=document.querySelector(`.${humidityelement}`)
    avgTempElement.textContent=averageTemp.toFixed(0);

    const targetTime = `${date} 09:00:00`;
    const humidityForDate = dailyForecasts.find(forecast => forecast.dt_txt === targetTime);
    let humidity=humidityForDate.main.humidity;
    humidityElement.textContent=humidity;


    

}




//setting icons for next days
function updateDaysWeatherIcon(weatherCondition,day) {

    const weatherIconElement = document.querySelector(`.${day}`);
    // if (!weatherIconElement) {
    //     console.error(`Element with class '${day}' not found.`);
    //     return; 
    // }

    const iconClass = weatherIcons[weatherCondition];
  
   
    weatherIconElement.className = `fa-solid ${iconClass} ${day} dIcon`;
    
 }


//updating todays icon
 function updateWeatherIcon(weatherCondition) {
    const weatherIconElement = document.querySelector('.wicon');
    const iconClass = weatherIcons[weatherCondition] || "fa-question";
    weatherIconElement.className = `fa-solid ${iconClass} wicon`;
  }
//set background image function
function setBGIMG(weatherCondition){
    let backımg=document.querySelector('body');
    backımg.style.backgroundImage = `url(${backgroundIMG[weatherCondition]})`;
    

}
  

//getweather function for next days 
 function getWeatherForDate(date) {
    const targetTime = `${date} 09:00:00`;
    const weatherForDate = dailyForecasts.find(forecast => forecast.dt_txt === targetTime);

    if (weatherForDate) {
        let description = weatherForDate.weather[0].description;
        
        if (description.includes('clouds')) {
            description = 'Clouds';
        }
        
        return description; 
    }

}








//searchbar keypress event
searchbar.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        city = searchbar.value;
        currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        getWeather(); 
    }
});

// Fetches weather data when the page loads.
window.onload = getWeather;
