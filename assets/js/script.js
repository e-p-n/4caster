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
                weatherForecast(forecasts[0], cityName);
                //fiveDayForecast()
            })
    } else {
        alert("Fill out the damned form!")
    }
}

function weatherForecast(forecast, city){
    city = city.charAt(0).toUpperCase() + city.slice(1);
    let weatherCardEl = document.createElement("div");
    weatherCardEl.classList.add("card", "today");
    let weatherCardBodyEl = document.createElement("div");
    weatherCardBodyEl.classList.add("card-body");
    let cityEl = document.createElement("h2");
    cityEl.classList.add("card-title", "white");
    cityEl.textContent = city;
    weatherCardBodyEl.appendChild(cityEl);
    let dateEl = document.createElement("h3");
    dateEl.classList.add("card-subtitle", "white");
    dateEl.textContent = moment(forecast.dt*1000).format("dddd MMMM DD.");
    weatherCardBodyEl.appendChild(dateEl);
    let weatherIconEl = document.createElement("i");
    weatherIconEl.classList.add("weather-icon", "white", "wi", "wi-owm-"+forecast.weather[0].id);
    weatherCardBodyEl.appendChild(weatherIconEl);
    let currentTemp = document.createElement("h3");
    currentTemp.classList.add("card-subtitle", "mb-2", "white");  
    currentTemp.textContent = Math.round(forecast.main.temp) + tempScale;
    weatherCardBodyEl.appendChild(currentTemp);

    if (Math.round(forecast.main.temp) != Math.round(forecast.main.feels_like)) {
        let feelsLikeEl = document.createElement("p");
        feelsLikeEl.classList.add("card-text", "white");
        if (Math.round(forecast.main.temp) > Math.round(forecast.main.feels_like)) {
            feelsLikeCause = " with the wind chill."
        } else {
            feelsLikeCause = " with the humidity."
        }
       feelsLikeEl.textContent = "Feels like "+ Math.round(forecast.main.feels_like) + tempScale + feelsLikeCause;
       weatherCardBodyEl.appendChild(feelsLikeEl);
    }
    let highLowEl =  document.createElement("p");
    highLowEl.classList.add("card-text", "white");
    highLowEl.textContent = "High: " + Math.round(forecast.main.temp_min) + tempScale + " | Low: " + Math.round(forecast.main.temp_max) + tempScale;
    weatherCardBodyEl.appendChild(highLowEl);
    weatherCardEl.appendChild(weatherCardBodyEl);
    weatherDisplayEl.appendChild(weatherCardEl);

    




    //console.log("Current Temp: " + Math.round(forecast.main.temp) + tempScale);
    if (Math.round(forecast.main.temp) === Math.round(forecast.main.feels_like)) {
        feelsLikeCause = "";
    } else {
        if (Math.round(forecast.main.temp) > Math.round(forecast.main.feels_like)) {
            feelsLikeCause = " with the wind chill."
        } else {
            feelsLikeCause = " with the humidity."
        }
        console.log("Feels like "+ Math.round(forecast.main.feels_like) + tempScale + feelsLikeCause);
    }
    console.log("Low: "+ Math.round(forecast.main.temp_min) + tempScale);
    console.log("High: "+ Math.round(forecast.main.temp_max) + tempScale);
  
    console.log(forecast);


    let today = new Date();
    console.log(today);


}

searchBtnEl.addEventListener("click", searchWeather);
