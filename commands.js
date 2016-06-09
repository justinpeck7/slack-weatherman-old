'use strict';

const request = require('request'),
    api = require('./secrets').weather_api,
    ziptest = /(\b\d{5}\b)/g;

let forecast = (bot, message) => {
    const matches = message.text.match(ziptest);

    if (!!matches) {
        for (const zip of matches) {
            request(`http://api.openweathermap.org/data/2.5/weather?zip=${zip},us&appid=${api}&units=imperial`, (err, response, body) => {
                const info = JSON.parse(body);
                bot.reply(message, `Weather in ${info.name}: ${info.main.temp} degrees, ${info.weather[0].description}, wind speed is ${info.wind.speed}mph`);
            });
        }
    }
};

let evaluate = (bot, message) => {
    try {
        const strToEval = message.text.replace(/(!eval\b)/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'),
            response = eval(strToEval);

        bot.reply(message, `${response}`);
    } catch (error) {
        bot.reply(message, `${error}`);
    }
};

module.exports = {
 forecast: forecast,
 evaluate: evaluate   
};