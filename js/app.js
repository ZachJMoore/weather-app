"use strict";


//set buttons for easy use
let weatherRefreshButton = document.querySelector("#weatherRefreshButton");
let changeLocationButton = document.querySelector("#changeLocationButton");


let buttonRateLimitOn = false
weatherRefreshButton.addEventListener("click", () => {
    console.log("refresh button clicked");
    // Max requests for my api key is 60 per minute. This limits refreshs from this button to only every 10 seconds.
    if (buttonRateLimitOn === false) {
        handler.sendInfo()
        buttonRateLimitOn = true
        setTimeout(() => {
            buttonRateLimitOn = false
        }, 10000)
    }
})

changeLocationButton.addEventListener("click", () => {
    console.log("change location button clicked");
    handler.setZip()
})


//handle all the data in this object
let data = {
    //fetch and return a json for a given link.
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
    //set the location using a zip code. Can be put in manually or by the one stored in localstorage
    openWeatherLink: function (zip = this.zip()) {
        return (`https://api.openweathermap.org/data/2.5/weather?zip=${zip}&units=imperial&APPID=92512e4bf262ab538384be4cf1c2ad73`)
    },
    zip: () => {
        return window.localStorage.getItem("zip")
    }
}

//handle all the brains and passing of data in this object
let handler = {

    //run at startup to check for a zip code and then update everything
    init: function () {
        if (handler.checkForZip() === false) {
            handler.setZip()
        }
        handler.sendInfo()
    },

    //Check the validity of the zip code and set a valid one inside of localstorage
    setZip: function () {
        swal({
            title: "Enter a 5 digit zip code.",
            content: "input",
            button: {
                text: "Go",
            },
        }).then((text) => {
            if (text === null) {
                return
            }
            text = parseInt(text)
            console.log(text)
            if (isNaN(text)) {
                swal("Please enter a number")
                    .then(() => {
                        handler.setZip();
                    })
            } else if (text.toString().length === 5) {
                swal({
                    title: "Zip Code Set!",
                    icon: "success",
                }).then(() => {
                    window.localStorage.setItem("zip", text);
                    handler.sendInfo()
                    return
                })
            } else {
                swal("Invalid Zip Code")
                    .then(() => {
                        handler.setZip();
                    })
            }
        })

    },
    //check to see if there is a zip code stored in localstorage
    checkForZip: function () {
        if (window.localStorage.getItem("zip") === null) {
            return false
        }
    },
    //retreive the weather json and pass it into the view object to update everything
    sendInfo: function () {
        data.getWeatherJson().then((response) => {
            console.log("sending this to view.setInfo", response)
            //there is probably a much better way to do this. But here I'm passing everything into the view.setInfo function by reading through the output of the json and deciding what I want to be included in the app. I should make a seperate filter function to take everything I want and place it inside of an object to then pass into view.setInfo
            //the order of items goes as such:
            // (name, current, low, high, description, humidity, pressure, wind, gust, direction, sunrise, sunset)
            view.setInfo(response.name, response.main.temp, response.main.temp_min, response.main.temp_max, response.weather[0].description, response.main.humidity, response.main.pressure, response.wind.speed, response.wind.gust, response.wind.deg, response.sys.sunrise, response.sys.sunset)
        })
    }
}

//handle everything that happens in the view in this object
let view = {
    //update all the info
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

        //        let sunriseText = document.querySelector("#sunriseText");
        //        let sunsetText = document.querySelector("#sunsetText");
        //        let sunriseObject = new Date(sunrise);
        //        let sunsetObject = new Date(sunset);

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

        //        sunriseText.textContent = sunriseObject.getHours() + ":" + sunriseObject.getSeconds();
        //        sunsetText.textContent = sunsetObject.getHours() + ":" + sunsetObject.getSeconds();
    }
}

handler.init()
console.log("Loaded")
