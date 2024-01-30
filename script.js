const apiKey = "f0f696d8d9b4ec696ac5b58feb28797d";
const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather";
const forecastApiUrl = "https://api.openweathermap.org/data/2.5/forecast";
const defaultUnit = document.querySelector(".active-unit");

function formatDate(timestamp) {
    let date = new Date(timestamp);
    let weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let weekDay = weekDays[date.getDay()];
    return `${weekDay} ${formatHours(timestamp)}`;
}

function formatHours(timestamp) {
    let date = new Date(timestamp);
    let hours = ("0" + date.getHours()).slice(-2);
    let minutes = ("0" + date.getMinutes()).slice(-2);
    return `${hours}:${minutes}`;
}

function displayRealTemp(response) {
    let cityElement = document.querySelector("#city");
    cityElement.innerHTML = response.data.name;

    let dateElement = document.querySelector("#date");
    let localTime = new Date();
    dateElement.innerHTML = formatDate(localTime.getTime());

    let descriptionElement = document.querySelector("#weather-description");
    descriptionElement.innerHTML = response.data.weather[0].description;

    let weatherIconElement = document.querySelector("#weather-icon");
    let iconElement = response.data.weather[0].icon;
    weatherIconElement.setAttribute("src", `http://openweathermap.org/img/wn/${iconElement}@2x.png`);
    weatherIconElement.setAttribute("alt", response.data.weather[0].description);

    let tempElement = document.querySelector("#temp");
    const celsiusCurrentTemp = Math.round(response.data.main.temp);
    tempElement.innerHTML = defaultUnit.classList.contains("active-unit") ? celsiusCurrentTemp : Math.round(celsiusCurrentTemp * 1.8 + 32);

    let humidityElement = document.querySelector("#humidity");
    humidityElement.innerHTML = response.data.main.humidity;

    let windElement = document.querySelector("#wind");
    windElement.innerHTML = Math.round(response.data.wind.speed * 3.6);
}

function displayForecast(response) {
    let forecastElement = document.querySelector("#forecast");
    forecastElement.innerHTML = null;

    for (let index = 0; index < 6; index++) {
        let forecast = response.data.list[index];
        let maxTempForecast = Math.round(forecast.main.temp_max);
        let minTempForecast = Math.round(forecast.main.temp_min);

        if (defaultUnit.classList.contains("active-unit")) {
            forecastElement.innerHTML += `
            <div class="col-2">
                <h6>${formatHours(forecast.dt * 1000)}</h6>
                <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}" height="75" />
                <div>
                    <strong><span class="max-temp">${maxTempForecast}</span></strong><span class="forecast-unit unit">ºC</span>
                    <span class="min-temp">${minTempForecast}</span><span class="forecast-unit unit">ºC</span>
                </div>
            </div>
          `;
        } else {
            forecastElement.innerHTML += `
            <div class="col-2">
                <h6>${formatHours(forecast.dt * 1000)}</h6>
                <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}" height="75" />
                <div>
                    <strong><span class="max-temp">${Math.round(maxTempForecast * 1.8 + 32)}</span></strong>
                    <span class="forecast-unit unit">ºF</span>
                    <span class="min-temp">${Math.round(minTempForecast * 1.8 + 32)}</span>
                    <span class="forecast-unit unit">ºF</span>
                </div>
            </div>
          `;
        }
    }
}

function search(city) {
    const weatherUrl = `${weatherApiUrl}?q=${city}&appid=${apiKey}&units=metric`;
    axios.get(weatherUrl).then(displayRealTemp);

    const forecastUrl = `${forecastApiUrl}?q=${city}&appid=${apiKey}&units=metric`;
    axios.get(forecastUrl).then(displayForecast);
}

function handleLocationClick() {
    navigator.geolocation.getCurrentPosition(function (position) {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        const weatherUrl = `${weatherApiUrl}?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
        axios.get(weatherUrl).then(displayRealTemp);

        const forecastUrl = `${forecastApiUrl}?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
        axios.get(forecastUrl).then(displayForecast);
    });
}

function displayTempInFahrenheit() {
    document.getElementById("fahrenheit").style.background = "#f7e4df";
    document.getElementById("celsius").style.background = "none";

    let currentTemp = document.querySelector("#temp");
    currentTemp.innerHTML = Math.round(parseFloat(currentTemp.innerHTML) * 1.8 + 32);

    let forecastMaxTemps = document.querySelectorAll(".max-temp");
    forecastMaxTemps.forEach(maxTemp => maxTemp.innerHTML = Math.round(parseFloat(maxTemp.innerHTML) * 1.8 + 32));

    let forecastMinTemps = document.querySelectorAll(".min-temp");
    forecastMinTemps.forEach(minTemp => minTemp.innerHTML = Math.round(parseFloat(minTemp.innerHTML) * 1.8 + 32));

    let units = document.querySelectorAll(".unit");
    units.forEach(unit => unit.innerHTML = "ºF");

    document.querySelector("#fahrenheit-label-btn").setAttribute("class", "active-unit");
    document.querySelector("#celsius-label-btn").setAttribute("class", "alternative-unit");

    document.querySelector("#fahrenheit").removeEventListener("click", displayTempInFahrenheit);
    document.querySelector("#celsius").addEventListener("click", displayTempInCelsius);
}

function displayTempInCelsius() {
    document.getElementById("fahrenheit").style.background = "none";
    document.getElementById("celsius").style.background = "#f7e4df";

    let currentTemp = document.querySelector("#temp");
    currentTemp.innerHTML = Math.round((parseFloat(currentTemp.innerHTML) - 32) / 1.8);

    let forecastMaxTemps = document.querySelectorAll(".max-temp");
    forecastMaxTemps.forEach(maxTemp => maxTemp.innerHTML = Math.round((parseFloat(maxTemp.innerHTML) - 32) / 1.8));

    let forecastMinTemps = document.querySelectorAll(".min-temp");
    forecastMinTemps.forEach(minTemp => minTemp.innerHTML = Math.round((parseFloat(minTemp.innerHTML) - 32) / 1.8));

    let units = document.querySelectorAll(".unit");
    units.forEach(unit => unit.innerHTML = "ºC");

    document.querySelector("#celsius-label-btn").setAttribute("class", "active-unit");
    document.querySelector("#fahrenheit-label-btn").setAttribute("class", "alternative-unit");

    document.querySelector("#celsius").removeEventListener("click", displayTempInCelsius);
    document.querySelector("#fahrenheit").addEventListener("click", displayTempInFahrenheit);
}

// Event Listeners
document.querySelector("#submit-btn").addEventListener("click", function (event) {
    event.preventDefault();
    let cityInput = document.querySelector("#searched-city");
    search(cityInput.value);
});

document.querySelector("#location-btn").addEventListener("click", handleLocationClick);

document.querySelector("#fahrenheit").addEventListener("click", displayTempInFahrenheit);
document.querySelector("#celsius").addEventListener("click", displayTempInCelsius);

// Initial Search
search("Kolkata");
