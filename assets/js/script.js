var cityEl = document.querySelector("#city");
var searchBtnEl = document.querySelector("#search");
var weatherDisplayEl = document.querySelector("main");
var cityListEl = document.querySelector(".cities");
var tempScale, windScale, unit, lat, lon, weatherCardEl, weatherCardBodyEl, cityName, forecastHolderEl;
var searchHistory = JSON.parse(localStorage.getItem("cities"));
if (!searchHistory) {
    searchHistory = [];
}


// Load cities from local storage and add them to the sidebar
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

//Add new city searches to searchCity array and then save array on local storage
function saveCity(newCity) {
    for (var i = 0; i < searchHistory.length; i++) {
        // check if city name has been searched before. If yes, remove the old sarch from the array
        if (newCity == searchHistory[i].city) {
            searchHistory.splice(i, 1);
        }
    }
    let savedCity = {city: newCity};
    searchHistory.push(savedCity);
    // Keep recent searches list to a maximum of 10. Remove the oldest if over 10
    if (searchHistory.length > 10) {
        searchHistory.splice(0, 1)
    }
    localStorage.setItem("cities", JSON.stringify(searchHistory));
    // Refresh the list of cities in the sidebar
    loadCities();

}

// Use API calls based on city entered.
function searchWeather(theCity) {
    cityName = theCity;

    // check which if they are using metric or imperial and set variables accordingly
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
    
    // check to see that a city name was actually entered.
    if (cityName) {
        // Call the Geocoding API and get the coordinates for the city entered
        let coordAPICall = "https://api.openweathermap.org/geo/1.0/direct?q="+cityName+"&limit=1&appid=df74799927b7fd8a9f5fb2e7b85418e6";
        fetch(coordAPICall)
            .then(function(response){
                return response.json();        
            })
            .then(function(data){
                lat = data[0].lat;
                lon = data[0].lon;
                // check city name in API return and change the cityName variable to the name in teh API (or english name if it has that variable). Corrects any capitalization issues.
                if(data[0].local_names.en) {
                    cityName = data[0].local_names.en;
                } else {
                    cityName = data[0].name;
                }
                saveCity(cityName);
                //clear the DOM area that holds the forecast
                cityEl.value = "";

                // Call the One CAll API using the coordinates from the Geocoding call. (This API does not provide for searching by city name).
                let forecastAPICall = "https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&exclude=minutely,hourly,alerts&units="+unit+"&appid=df74799927b7fd8a9f5fb2e7b85418e6";
                fetch(forecastAPICall)
                    .then(function(response) {
                        return response.json();        
                    })
                    .then(function(data){
                        currentWeather(data.current);
                        // check to see if date of the first day of seven day forecast is the same as the current date. If it is start with the second day when generating five day forecast.
                        let addDay = 0;
                        let currentDate = moment(data.current.dt*1000).format("dddd MMMM DD");
                        let firstForecastDate = moment(data.current.dt*1000).format("dddd MMMM DD");
                        if (currentDate == firstForecastDate) {
                            addDay = 1;
                        } 
                        for (var i=0; i < 5; i++) {
                            weatherForecast(data.daily[i+addDay], i)
                        }
                    })
                    .catch(function(){
                        alert("An error has occurred, please try again.")
                    })
            })          
            .catch(function(error){
                alert("An error has occurred. Please try again.")
                return;
            })

    
        weatherDisplayEl.textContent = "";
    } 
}

// Adds the initials div for the cards that are added to the dom
function buildWeatherCard(bgColor, isForecast, isFirst){
    
    weatherCardEl = document.createElement("div");
    weatherCardEl.classList.add("card", "col-sm", bgColor);
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

//sets heading size, date info, font colour icon an it's size and the temperature to the card
function buildCommonCardElements(hSize, theDate, fontColor, iconSize, iconType, temp) {
    let dateEl = document.createElement(hSize);
    dateEl.classList.add("card-subtitle", fontColor);
    let dayMonth = moment(theDate*1000).format('dddd MMMM');
    let dateString = moment(theDate*1000).format('DD');
    dateEl.innerHTML = dayMonth + "&nbsp;" + dateString;
    weatherCardBodyEl.appendChild(dateEl);
    let weatherIconEl = document.createElement("i");
    weatherIconEl.classList.add("weather-icon", iconSize, fontColor, "wi", "wi-owm-"+iconType);
    weatherCardBodyEl.appendChild(weatherIconEl);
    let tempEl = document.createElement("h3");
    tempEl.classList.add("card-subtitle", "mb-2", fontColor);  
    tempEl.textContent = Math.round(temp) + tempScale;
    weatherCardBodyEl.appendChild(tempEl);
}
//adds humidity to the card
function buildHumidity(fontColor, humidity) {
    let humidityEl = document.createElement("p");
    humidityEl.classList.add("card-text", fontColor);
    humidityEl.textContent = "Humidity: " + humidity + "%";
    weatherCardBodyEl.appendChild(humidityEl);
}

// sets the UV level to low, mod, high, v-high or ext. This values will set the class to create the right colour for the UV
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

// create the cuurent weather card
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


    weatherCardEl.appendChild(weatherCardBodyEl);


}

//cresate the 5-day forecast cards
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


    weatherCardEl.appendChild(weatherCardBodyEl);

}

searchBtnEl.addEventListener("click", function() { searchWeather(cityEl.value) });
loadCities();
