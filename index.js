
const API_KEY = "YOUR_API_KEY";

// DOM ELEMENTS

const cityInput = document.querySelector("#cityInput");
const searchBtn = document.querySelector("#searchBtn");

const loading = document.querySelector("#loading");
const errorMessage = document.querySelector("#errorMessage");

const cityName = document.querySelector("#cityName");
const date = document.querySelector("#date");

const weatherIcon = document.querySelector("#weatherIcon");
const temperature = document.querySelector("#temperature");
const description = document.querySelector("#description");

const humidity = document.querySelector("#humidity");
const windSpeed = document.querySelector("#windSpeed");
const feelsLike = document.querySelector("#feelsLike");
const pressure = document.querySelector("#pressure");

const forecastContainer =
    document.querySelector("#forecastContainer");


// EVENT LISTENERS

searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        getWeather();
    }
});


// MAIN FUNCTION

async function getWeather() {

    const city = cityInput.value.trim();

    // Validate input

    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    // Show loading

    loading.classList.remove("hidden");
    errorMessage.classList.add("hidden");

    searchBtn.disabled = true;

    try {

        // Fetch current weather

        const weatherURL =
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const response = await fetch(weatherURL);

        if (!response.ok) {
            throw new Error(
                response.status === 404
                    ? "City not found."
                    : `Weather request failed (${response.status}).`
            );
        }

        const data = await response.json();

        // Display current weather

        displayWeather(data);

        // Fetch forecast

        await getForecast(data.coord.lat, data.coord.lon);

    } catch (error) {

        showError(error.message);

    } finally {

        loading.classList.add("hidden");
        searchBtn.disabled = false;

    }
}


// DISPLAY CURRENT WEATHER

function displayWeather(data) {

    cityName.textContent =
        `${data.name}, ${data.sys.country}`;

    date.textContent =
        new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

    temperature.textContent =
        `${Math.round(data.main.temp)}°C`;

    description.textContent =
        data.weather[0].description;

    humidity.textContent =
        `${data.main.humidity}%`;

    windSpeed.textContent =
        `${data.wind.speed} m/s`;

    feelsLike.textContent =
        `${Math.round(data.main.feels_like)}°C`;

    pressure.textContent =
        `${data.main.pressure} hPa`;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

}


// GET FORECAST

async function getForecast(lat, lon) {

    const forecastURL =
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    const response = await fetch(forecastURL);

    if (!response.ok) {
        throw new Error("Unable to load forecast.");
    }

    const data = await response.json();

    displayForecast(data.list);

}


// DISPLAY 5-DAY FORECAST

function displayForecast(forecastData) {

    forecastContainer.innerHTML = "";

    // Get one forecast entry for each day (around noon)

    const dailyForecast = forecastData.filter(item => {
        return item.dt_txt.includes("12:00:00");
    });

    dailyForecast.slice(0, 5).forEach(item => {

        const day = new Date(item.dt * 1000);

        const card = document.createElement("div");

        card.classList.add("forecast-card");

        const icon = item.weather[0].icon;

        card.innerHTML = `
            <p>${day.toLocaleDateString("en-US", {
                weekday: "short"
            })}</p>

            <img
                src="https://openweathermap.org/img/wn/${icon}.png"
                alt="Weather icon"
            >

            <h3>${Math.round(item.main.temp)}°C</h3>

            <p>${item.weather[0].description}</p>
        `;

        forecastContainer.appendChild(card);

    });

}


// ERROR FUNCTION

function showError(message) {

    errorMessage.textContent = message;

    errorMessage.classList.remove("hidden");

}
