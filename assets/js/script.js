var cityEl = document.querySelector("#city");
var searchBtnEl = document.querySelector("#search");
var weatherIcons = [    {icon: "01d", fontRef: "wi wi-day-sunny"},
                        {icon: "01n", fontRef: "wi wi-night-clear"},
                        {icon: "02d", fontRef: "wi wi-day-cloudy"},
                        {icon: "02n", fontRef: "wi wi-night-alt-cloudy"},
                        {icon: "03d", fontRef: "wi wi-cloud"},
                        {icon: "03n", fontRef: "wi wi-cloud"},
                        {icon: "04d", fontRef: "wi wi-cloudy"},
                        {icon: "04n", fontRef: "wi wi-cloudy"},
                        {icon: "09d", fontRef: "wi wi-day-showers"},
                        {icon: "09n", fontRef: "wi wi-night-showers"},
                        {icon: "10d", fontRef: "wi wi-rain"},
                        {icon: "10n", fontRef: "wi wi-rain"},
                        {icon: "11d", fontRef: "wi wi-thunderstorm"},
                        {icon: "11n", fontRef: "wi wi-thunderstorm"},
                        {icon: "13d", fontRef: "wi wi-snowflake-cold"},
                        {icon: "13n", fontRef: "wi wi-snowflake-cold"},
                        {icon: "50d", fontRef: "wi wi-fog"},
                        {icon: "50n", fontRef: "wi wi-fog"}
                   ]

console.log(weatherIcons[0].icon)

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
                weatherForecast(forecasts[0]);
                //fiveDayForecast()
            })
    } else {
        alert("Fill out the damned form!")
    }
}

function weatherForecast(forecast){
    
    console.log("Current Temp: " + Math.round(forecast.main.temp) + tempScale);
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
    for (i = 0; i < weatherIcons.length; i++)
        if (forecast.weather[0].icon === weatherIcons[i].icon) {
            let finalIcon = weatherIcons[i].fontRef;
            console.log(finalIcon);
        }
    console.log(forecast);


    let today = new Date();
    console.log(today);


}

searchBtnEl.addEventListener("click", searchWeather);
