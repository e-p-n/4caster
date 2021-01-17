var cityEl = document.querySelector("#city");
var searchBtnEl = document.querySelector("#search");
var weatherDisplayEl = document.querySelector("main");
var cityListEl = document.querySelector(".cities");
var tempScale, windScale, unit, lat, lon, weatherCardEl, weatherCardBodyEl, cityName, forecastHolderEl;
var searchHistory = JSON.parse(localStorage.getItem("cities"));
if (!searchHistory) {
    searchHistory = [];
}



function loadCities() {
    cityListEl.textContent="";
    for(var i = searchHistory.length-1; i >=0; i--){
        let cityListItem = searchHistory[i].city;
        let cityListItemEl = document.createElement("a");
        cityListItemEl.setAttribute("href", "#");
        cityListItemEl.textContent= cityListItem;
        cityListEl.appendChild(cityListItemEl);
        cityListItemEl.addEventListener("click", function(){
            searchWeather(cityListItem);
        });
        
    }
}
function saveCity(newCity) {
    for (var i = 0; i < searchHistory.length; i++) {
        if (newCity == searchHistory[i].city) {
            searchHistory.splice(i, 1);
        }
    }
    let savedCity = {city: newCity};
    searchHistory.push(savedCity);
    localStorage.setItem("cities", JSON.stringify(searchHistory));
    loadCities();

}

function searchWeather(theCity) {
    cityName = theCity;

    let unitValue = document.getElementById("unit").checked;
    if(unitValue) {
        tempScale = "˚F";
        windScale = " MPH";
        unit="imperial";
    } else {
        tempScale = "˚C";
        windScale = " KM/H";
        unit="metric";
    }
  
    if (cityName) {
        let coordAPICall = "http://api.openweathermap.org/geo/1.0/direct?q="+cityName+"&limit=1&appid=df74799927b7fd8a9f5fb2e7b85418e6";
        fetch(coordAPICall)
            .then(function(response){
                return response.json();        
            })
            .then(function(data){
                lat = data[0].lat;
                lon = data[0].lon;
                if(data[0].local_names.en) {
                    cityName = data[0].local_names.en;
                } else {
                    cityName = data[0].name;
                }
                saveCity(cityName);
                cityEl.value = "";
                let forecastAPICall = "http://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&exclude=minutely,hourly,alerts&units="+unit+"&appid=df74799927b7fd8a9f5fb2e7b85418e6";

                fetch(forecastAPICall)
                    .then(function(response) {
                        return response.json();        
                    })
                    .then(function(data){
                        currentWeather(data.current)
                        for (var i=0; i < 5; i++) {
                            weatherForecast(data.daily[i], i)
                        }
                    })
                    .catch(function(){
                        alert("An error has occurred, please try again.")
                    })
            })          
            .catch(function(){
                alert("An error has occurred, please check your spelling and try again.")
                return;
            })

    
        weatherDisplayEl.textContent = "";
    } else {
        alert("Fill out the damned form!")
    }
}

function buildWeatherCard(bgColor, isForecast, isFirst){
    
    weatherCardEl = document.createElement("div");
    weatherCardEl.classList.add("card", "col", bgColor);
    weatherCardBodyEl = document.createElement("div");
    weatherCardBodyEl.classList.add("card-body");
    if (isForecast && isFirst) {
        forecastHolderEl = document.createElement("div");
        forecastHolderEl.classList.add("row");
        forecastHolderEl.appendChild(weatherCardEl);
        weatherDisplayEl.appendChild(forecastHolderEl);
    } else if (isForecast && !isFirst) {
        forecastHolderEl.appendChild(weatherCardEl);

    } else {
        weatherDisplayEl.appendChild(weatherCardEl);
    }    
}

function buildCommonCardElements(hSize, theDate, fontColor, iconSize, iconType, temp) {
    let dateEl = document.createElement(hSize);
    dateEl.classList.add("card-subtitle", fontColor);
    dateEl.textContent = moment(theDate*1000).format("dddd MMMM DD");
    weatherCardBodyEl.appendChild(dateEl);
    let weatherIconEl = document.createElement("i");
    weatherIconEl.classList.add("weather-icon", iconSize, fontColor, "wi", "wi-owm-"+iconType);
    weatherCardBodyEl.appendChild(weatherIconEl);
    let tempEl = document.createElement("h3");
    tempEl.classList.add("card-subtitle", "mb-2", fontColor);  
    tempEl.textContent = Math.round(temp) + tempScale;
    weatherCardBodyEl.appendChild(tempEl);
}

function buildHumidity(fontColor, humidity) {
    let humidityEl = document.createElement("p");
    humidityEl.classList.add("card-text", fontColor);
    humidityEl.textContent = "Humidity: " + humidity + "%";
    weatherCardBodyEl.appendChild(humidityEl);
}

function addToDOM() {
    weatherCardEl.appendChild(weatherCardBodyEl);
}
function getUVLevel(uvNo) {
    let uvLevel;
    if (uvNo < 3) {
        uvLevel = "low";
    } else if (uvNo < 6) {
        uvLevel = "mod";
    } else if (uvNo < 8) {
        uvLevel = "high";
    } else if (uvNo < 11) {
        uvLevel = "v-high";
    } else  {
        uvLevel = "ext";
    }
    return uvLevel;
}
function currentWeather(current) {
    let fontColor = "white";

    buildWeatherCard("bg-blue", false, false);

    let cityEl = document.createElement("h2");
    cityEl.classList.add("card-title", fontColor);
    cityEl.textContent = cityName;
    weatherCardBodyEl.appendChild(cityEl);


    let currentIcon = current.weather[0].id;
    let currentTemp = current.temp;
    let currentDate = current.dt;
    buildCommonCardElements("h3", currentDate, fontColor, "largeIcon", currentIcon, currentTemp);


    if (Math.round(current.temp) != Math.round(current.feels_like)) {
        let feelsLikeEl = document.createElement("p");
        feelsLikeEl.classList.add("card-text", fontColor);
        if (Math.round(current.temp) > Math.round(current.feels_like)) {
            feelsLikeCause = " with the wind chill."
        } else {
            feelsLikeCause = " with the humidity."
        }
        feelsLikeEl.textContent = "Feels like "+ Math.round(current.feels_like) + tempScale + feelsLikeCause;
        weatherCardBodyEl.appendChild(feelsLikeEl);
    }

    let windSpeedEl = document.createElement("p");
    windSpeedEl.classList.add("card-text", fontColor);
    let windSpeed;
    if (windScale === " KM/H") {
        windSpeed = Math.round(current.wind_speed * 360)/100 + windScale;
    } else {
        windSpeed = current.wind_speed + windScale;
    }
    windSpeedEl.textContent = "Wind Speed: " + windSpeed;
    weatherCardBodyEl.appendChild(windSpeedEl);
 
    let currentHumidity = current.humidity;
    buildHumidity(fontColor, currentHumidity);

    let uviEl = document.createElement("p");
    let uvNumber = Math.round(current.uvi);
    let uvLevel = getUVLevel(uvNumber);
    uviEl.classList.add("card-text", fontColor);
    uviEl.innerHTML = "UV Index: <span class='uv-rating " + uvLevel + "'>" + uvNumber +"</span>";
    weatherCardBodyEl.appendChild(uviEl);


    addToDOM();


}

function weatherForecast(forecast, dayNo){

    let fontColor = "blue";
    let isFirst = false;
    
    if (dayNo===0){
        isFirst = true;

        let fiveDayTitle = document.createElement("h3");
        fiveDayTitle.classList.add(fontColor);
        fiveDayTitle.textContent = "Five Day Forecast:";
        weatherDisplayEl.appendChild(fiveDayTitle);
        
    }
     
    buildWeatherCard("bg-white", true, isFirst);

    let forecastIcon = forecast.weather[0].id;
    let forecastTemp = forecast.temp.max;
    let forecastDate = forecast.dt;

    buildCommonCardElements("h5", forecastDate, fontColor, "smallIcon", forecastIcon, forecastTemp);
  
    let forecastHumidity = forecast.humidity;
    buildHumidity(fontColor, forecastHumidity);


    addToDOM();

}

searchBtnEl.addEventListener("click", function() { searchWeather(cityEl.value) });
loadCities();
