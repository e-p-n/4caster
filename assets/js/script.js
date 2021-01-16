var cityEl = document.querySelector("#city");
var searchBtnEl = document.querySelector("#search");

function searchWeather() {

    let unitValues = document.getElementsByName("unit");
    let unit;

    for (var i = 0; i < unitValues.length; i++){

        if(unitValues[i].checked) {
            unit = unitValues[i].value;
        }
    }

    if (cityEl.value) {
        let forecastAPICall = "http://api.openweathermap.org/data/2.5/forecast?q="+cityEl.value+"&units="+unit+"&appid=df74799927b7fd8a9f5fb2e7b85418e6";
        
        fetch(forecastAPICall)
            .then(function(response) {
                let weatherInfo = response.json();
                let time = new Date(1610813222*1000);

                console.log(time.toString('dddd, MMMM dd'));

                console.log(weatherInfo);
        
            })
        cityEl.value = "";
    } else {
        alert("Fill out the damned form!")
    }
}

searchBtnEl.addEventListener("click", searchWeather);
