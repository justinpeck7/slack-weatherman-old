'use strict';

const request = require('request'),
    api = require('./secrets').weather_api,
    ziptest = /(\b\d{5}\b)/g,
    days = {
        SUNDAY: 0,
        MONDAY: 1,
        TUESDAY: 2,
        WEDNESDAY: 3,
        THURSDAY: 4,
        FRIDAY: 5,
        SATURDAY: 6
    };

let weather = (bot, message) => {
    const matches = message.text.match(ziptest);

    if (!!matches) {
        for (const zip of matches) {
            request(`http://api.openweathermap.org/data/2.5/weather?zip=${zip},us&appid=${api}&units=imperial`, (err, response, body) => {
                const data = JSON.parse(body);
                bot.reply(message, `Weather in ${data.name}: ${data.main.temp} degrees, ${data.weather[0].description}, wind speed is ${data.wind.speed}mph`);
            });
        }
    }
};

let forecast = (bot, message) => {
    let day = message.text.split(' ')[1].toUpperCase() || '',
        zip = message.text.split(' ')[2] || '',
        forecastData;

    if(days[day] === undefined || !zip.match(ziptest)) {
        bot.reply(message, 'Usage:');
        bot.reply(message, '!forecast {day - within 4 of current day} {zipcode}');
    }
    else {
        request(`http://api.openweathermap.org/data/2.5/forecast?zip=${zip},us&appid=${api}&units=imperial`, (err, response, body) => {
            const data = JSON.parse(body),
                city = data.city.name;
            
            for(const hourly of data.list) {
                const d = new Date(hourly.dt_txt);
                
                if(d.getDay() === days[day] && d.getHours() === 21) {
                    forecastData = hourly;
                    break;
                }
            }

            if(!!forecastData) {
                bot.reply(message, `It will be ${forecastData.main.temp_max} degrees in ${city} on ${day.charAt(0) + day.slice(1).toLowerCase()}`);
            }
            else {
                bot.reply(message, 'No data');
            }
        });
    }
};

let evaluate = (bot, message) => {
    try {
        const strToEval = message.text
            .replace(/(!eval\b)/g, '')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&'),
            response = eval(strToEval);

        bot.reply(message, `${response}`);
    } catch (error) {
        bot.reply(message, `${error}`);
    }
};

module.exports = {
    weather: weather,
    forecast: forecas,
    evaluate: evaluate
};