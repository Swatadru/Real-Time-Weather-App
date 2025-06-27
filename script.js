const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');
const weatherInfoSection = document.querySelector('.weather-info');
const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');
const forecastItemsContainer = document.querySelector('.forecast-items-container')

const apiKey = '07bdf306c2bde2ed54c94d5127837cec';

// Search button click event
searchBtn.addEventListener('click', () => {
	if (cityInput.value.trim() !== '') {
		updateWeatherInfo(cityInput.value);
		cityInput.value = '';
		cityInput.blur();
	}
});

// Enter key press event
cityInput.addEventListener('keydown', (event) => {
	if (event.key === 'Enter' && cityInput.value.trim() !== '') {
		updateWeatherInfo(cityInput.value);
		cityInput.value = '';
		cityInput.blur();
	}
});

async function getFetchData(endPoint, city) {
	const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;

	try {
		const response = await fetch(apiUrl);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching weather data:', error);
		return null;
	}
}

function getWeatherIcon(id) {
	if (id <= 232) return 'thunderstorm.svg'
	if (id <= 321) return 'drizzle.svg'
	if (id <= 531) return 'rain.svg'
	if (id <= 622) return 'snow.svg'
	if (id <= 781) return 'atmosphere.svg'
	if (id <= 800) return 'clear.svg'
	else return 'clouds.svg'
}

function getCurrentDate() {
	const currentDate = new Date()
	const options = {
		weekday: 'short',
		day: '2-digit',
		month: 'short'
	}
	return currentDate.toLocaleDateString('en-GB', options)
}

async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city);

    if (weatherData.cod != 200) {
        showDisplaySection(notFoundSection);
        return;
    }

    console.log('Full weather data:', weatherData); // Debug log

    const {
        name: country,
        main: { temp, humidity },
        weather: weatherArray,
        wind: { speed },
        sys: { country: countryCode }
    } = weatherData;

    // Safely extract weather description
    const weatherCondition = weatherArray[0]?.description || 'N/A';
    
    countryTxt.textContent = `${country}, ${countryCode}`;
    tempTxt.textContent = `${Math.round(temp)} °C`;
    conditionTxt.textContent = weatherCondition.charAt(0).toUpperCase() + weatherCondition.slice(1); // Capitalize first letter
    humidityValueTxt.textContent = `${humidity}%`;
    windValueTxt.textContent = `${speed} m/s`;

    currentDateTxt.textContent = getCurrentDate();
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(weatherArray[0].id)}`;

    await updateForecastsInfo(city);
    showDisplaySection(weatherInfoSection);
}

async function updateForecastsInfo(city) {
    const forecastsData = await getFetchData('forecast', city);
    
    // Check if forecast data is valid
    if (!forecastsData || !forecastsData.list) {
        console.error('Invalid forecast data:', forecastsData);
        return;
    }

    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];
    forecastItemsContainer.innerHTML = '';
    
    forecastsData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) && 
            !forecastWeather.dt_txt.includes(todayDate)) {
            createForecastItem(forecastWeather);
        }
    });
}

function createForecastItem(weatherData) {
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = weatherData;
    
    // Format the date (e.g., "05 Aug")
    const forecastDate = new Date(date);
    const formattedDate = forecastDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short'
    });

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${formattedDate}</h5>
            <img src="assets/weather/${getWeatherIcon(id)}" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>
    `;
    
    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}

function showDisplaySection(section) {
	[weatherInfoSection, searchCitySection, notFoundSection].forEach(sec => {
		sec.style.display = 'none';
	});
	section.style.display = 'flex';
}