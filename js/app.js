"use strict";

let placeholder

//set buttons for easy use
let weatherRefreshButton = document.querySelector("#weatherRefreshButton");
let changeLocationButton = document.querySelector("#changeLocationButton");


let buttonRateLimitOn = false
weatherRefreshButton.addEventListener("click", () => {
    console.log("refresh button clicked");
    // Max requests for my api key is 60 per minute. This limits refreshs from this button to only every 2 minutes.
    if (buttonRateLimitOn === false) {
        handler.sendInfo()
        buttonRateLimitOn = true
        setTimeout(() => {
            buttonRateLimitOn = false
        }, 120000)
    }
})

changeLocationButton.addEventListener("click", () => {
    console.log("change location button clicked");
    handler.setZip()
})


//handle all the data in this object
let data = {
    //fetch and return a json for a given link.
    getWeatherJson: function (url = this.openWeatherCurrent()) {
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
    openWeatherCurrent: function (zip = this.zip()) {
        return (`https://api.openweathermap.org/data/2.5/weather?zip=${zip}&units=imperial&APPID=92512e4bf262ab538384be4cf1c2ad73`)
    },
    openWeatherForecast: function (zip = this.zip()) {
        return (`https://api.openweathermap.org/data/2.5/forecast?zip=${zip}&units=imperial&APPID=92512e4bf262ab538384be4cf1c2ad73`)
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
        data.getWeatherJson(data.openWeatherForecast()).then((response) => {
            console.log(response);
            let passThrough = {
                first: [0, 0, response.list[3].weather[0].description, response.list[3].dt_txt.slice(5, 10)],
                second: [0, 0, response.list[11].weather[0].description, response.list[11].dt_txt.slice(5, 10)],
                third: [0, 0, response.list[19].weather[0].description, response.list[19].dt_txt.slice(5, 10)],
                forth: [0, 0, response.list[27].weather[0].description, response.list[27].dt_txt.slice(5, 10)],
                fifth: [0, 0, response.list[35].weather[0].description, response.list[35].dt_txt.slice(5, 10)]
            }
            response.list.forEach((item, index)=>{
                if (index >= 0 && index <= 7){
                    passThrough.first[0] += item.main.temp
                    passThrough.first[1]++
                } else if (index >= 8 && index <= 15){
                    passThrough.second[0] += item.main.temp
                    passThrough.second[1]++
                } else if (index >= 16 && index <= 23){
                    passThrough.third[0] += item.main.temp
                    passThrough.third[1]++
                } else if (index >= 24 && index <= 31){
                    passThrough.forth[0] += item.main.temp
                    passThrough.forth[1]++
                } else if (index >= 32 && index <= 39){
                    passThrough.fifth[0] += item.main.temp
                    passThrough.fifth[1]++
                }
            })
            passThrough.first[0] = (passThrough.first[0] / passThrough.first[1]).toFixed(2);
            passThrough.second[0] = (passThrough.second[0] / passThrough.second[1]).toFixed(2);
            passThrough.third[0] = (passThrough.third[0] / passThrough.third[1]).toFixed(2);
            passThrough.forth[0] = (passThrough.forth[0] / passThrough.forth[1]).toFixed(2);
            passThrough.fifth[0] = (passThrough.fifth[0] / passThrough.fifth[1]).toFixed(2);
            console.log(passThrough)

            let weatherFiveDayContainer = document.querySelector("#weatherFiveDayContainer");
            weatherFiveDayContainer.innerHTML = `<h2 class="weather-five-day-title">5 Day Forecast: </h2>`;

            view.createFiveDayItem({date: passThrough.first[3], temperature: passThrough.first[0], description: passThrough.first[2]})
            view.createFiveDayItem({date: passThrough.second[3], temperature: passThrough.second[0], description: passThrough.second[2]})
            view.createFiveDayItem({date: passThrough.third[3], temperature: passThrough.third[0], description: passThrough.third[2]})
            view.createFiveDayItem({date: passThrough.forth[3], temperature: passThrough.forth[0], description: passThrough.forth[2]})
            view.createFiveDayItem({date: passThrough.fifth[3], temperature: passThrough.fifth[0], description: passThrough.fifth[2]})

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
    },
    createFiveDayItem: (object) => {
        let weatherFiveDayContainer = document.querySelector("#weatherFiveDayContainer");
        let newSection = document.createElement("section");
        newSection.className = "weather-five-day-items flex-container column";
        newSection.innerHTML = `<span class="weather-five-day-date-text">${object.date}</span>
                                <span class="weather-five-day-temperature-text">${object.temperature}<span>º</span></span>
                                <span class="weather-five-day-description-text">${object.description}</span>`;
        weatherFiveDayContainer.appendChild(newSection)
    }
}

handler.init()
console.log("Loaded")
