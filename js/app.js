"use strict";

let data = {
    getWeatherJson: function (url = this.openWeatherLink()) {
        return new Promise((resolve, reject) => {
            fetch(url)
                .then((response) => {
                    return response.json()
                })
                .then((data) => {
                    resolve(data)
                })
                .catch((error) => {
                    console.log(error)
                })
        })
    },
    openWeatherLink: function (zip = this.zip) {
        return (`http://api.openweathermap.org/data/2.5/weather?zip=${zip}&units=imperial&APPID=92512e4bf262ab538384be4cf1c2ad73`)
    },
    zip: window.localStorage.getItem("zip")
}


let handler = {
    init: function () {
        if (handler.checkForZip() === false) {
            handler.setZip()
        }
        handler.sendInfo()
    },

    setZip: function () {
        let zip = prompt("Enter 5 digit zip code")
        window.localStorage.setItem("zip", parseInt(zip))
    },
    checkForZip: function () {
        if (window.localStorage.getItem("zip") === null) {
            return false
        }
    },
    sendInfo: function () {
        data.getWeatherJson().then((response) => {
            view.setInfo(response.name, response.main.temp, response.main.temp_min, response.main.temp_max, response.weather[0].description, response.main.humidity, response.main.pressure, response.wind.speed, response.wind.gust, response.wind.deg, response.sys.sunrise, response.sys.sunset)
            // (name, current, low, high, description, humidity, pressure, wind, gust, direction, sunrise, sunset)
        })
    }
}

let view = {
    setInfo: (name, current, low, high, description, humidity, pressure, wind, gust, direction, sunrise, sunset) => {
        let weatherLocationText = document.querySelector("#weatherLocationText");
        let temperatureText = document.querySelector("#temperatureText");
        let temperatureHighText = document.querySelector("#temperatureHighText");
        let temperatureLowText = document.querySelector("#temperatureLowText");
        let descriptionText = document.querySelector("#descriptionText");

        let humidityText = document.querySelector("#humidityText");
        let pressureText = document.querySelector("#pressureText");

        let windSpeedText = document.querySelector("#windSpeedText");
        let windGustText = document.querySelector("#windGustText");
        let windDirectionText = document.querySelector("#windDirectionText");

        let sunriseText = document.querySelector("#sunriseText");
        let sunsetText = document.querySelector("#sunsetText");
        let sunriseObject = new Date(sunrise);
        let sunsetObject = new Date(sunset);

        weatherLocationText.textContent = name;
        temperatureText.textContent = current;
        temperatureHighText.textContent = low;
        temperatureLowText.textContent = high;
        descriptionText.textContent = description;
        humidityText.textContent = humidity;
        pressureText.textContent = (pressure * 0.02952998751).toFixed(2);
        windSpeedText.textContent = wind;
        windGustText.textContent = gust;
        windDirectionText.textContent = direction;
        sunriseText.textContent = sunriseObject.getHours() + ":" + sunriseObject.getSeconds();
        sunsetText.textContent = sunsetObject.getHours() + ":" + sunsetObject.getSeconds();
    }
}

window.onload = () => {
    handler.init()
}