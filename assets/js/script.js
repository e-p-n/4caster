var cityEl = document.querySelector("#city");
var searchBtnEl = document.querySelector("#search");
var weatherDisplayEl = document.querySelector("main");



function searchWeather() {

    let unitValues = document.getElementsByName("unit");
    let unit;
    let cityName = cityEl.value;
    cityEl.value = "";

    for (var i = 0; i < unitValues.length; i++){

        if(unitValues[i].checked) {
            unit = unitValues[i].value;
            if (unit === "metric") {
                tempScale = "˚C";
            } else {
                tempScale = "˚F"
            }
        }
    }

    if (cityName) {
        let forecastAPICall = "http://api.openweathermap.org/data/2.5/forecast?q="+cityName+"&units="+unit+"&appid=df74799927b7fd8a9f5fb2e7b85418e6";
        fetch(forecastAPICall)
            .then(function(response) {
                return response.json();        
            })
            .then(function(data){
                let forecasts = data.list;
                for (var i=0; i < forecasts.length; i+=8) {
                    weatherForecast(forecasts[i], cityName, i)
                    if (i===0) {i--};
                }

            })
        weatherDisplayEl.textContent = "";

    } else {
        alert("Fill out the damned form!")
    }
}

function weatherForecast(forecast, city, dayNo){
    city = city.charAt(0).toUpperCase() + city.slice(1);
    let bgColor, fontColor, iconSize, dateSize;
    if (dayNo === 0) {
        bgColor = "bg-blue";
        fontColor = "white";
        iconSize = "largeIcon";
        dateSize = "h3"
    } else {
        bgColor = "bg-white";
        fontColor = "blue";
        iconSize = "none";
        dateSize = "h4"
        if (dayNo===7){
            let fiveDayTitle = document.createElement("h2");
            fiveDayTitle.classList.add("blue");
            fiveDayTitle.textContent = "Five Day Forecast:";
            weatherDisplayEl.appendChild(fiveDayTitle);
        }
    }
    
    let weatherCardEl = document.createElement("div");
    weatherCardEl.classList.add("card", bgColor);
    let weatherCardBodyEl = document.createElement("div");
    weatherCardBodyEl.classList.add("card-body");
    if (dayNo === 0) {
        let cityEl = document.createElement("h2");
        cityEl.classList.add("card-title", fontColor);
        cityEl.textContent = city;
        weatherCardBodyEl.appendChild(cityEl);
    }
    let dateEl = document.createElement(dateSize);
    dateEl.classList.add("card-subtitle", fontColor);
    dateEl.textContent = moment(forecast.dt*1000).format("dddd MMMM DD.");
    weatherCardBodyEl.appendChild(dateEl);
    let weatherIconEl = document.createElement("i");
    weatherIconEl.classList.add("weather-icon", iconSize, fontColor, "wi", "wi-owm-"+forecast.weather[0].id);
    weatherCardBodyEl.appendChild(weatherIconEl);
    let currentTemp = document.createElement("h3");
    currentTemp.classList.add("card-subtitle", "mb-2", fontColor);  
    currentTemp.textContent = Math.round(forecast.main.temp) + tempScale;
    weatherCardBodyEl.appendChild(currentTemp);

    if (dayNo === 0) {

        if (Math.round(forecast.main.temp) != Math.round(forecast.main.feels_like)) {
            let feelsLikeEl = document.createElement("p");
            feelsLikeEl.classList.add("card-text", fontColor);
            if (Math.round(forecast.main.temp) > Math.round(forecast.main.feels_like)) {
                feelsLikeCause = " with the wind chill."
            } else {
                feelsLikeCause = " with the humidity."
            }
        feelsLikeEl.textContent = "Feels like "+ Math.round(forecast.main.feels_like) + tempScale + feelsLikeCause;
        weatherCardBodyEl.appendChild(feelsLikeEl);
        }
        let highLowEl =  document.createElement("p");
        highLowEl.classList.add("card-text", fontColor);
        highLowEl.textContent = "High: " + Math.round(forecast.main.temp_max) + tempScale + " | Low: " + Math.round(forecast.main.temp_min) + tempScale;
        weatherCardBodyEl.appendChild(highLowEl);
    }
    weatherCardEl.appendChild(weatherCardBodyEl);
    weatherDisplayEl.appendChild(weatherCardEl);



}

searchBtnEl.addEventListener("click", searchWeather);
