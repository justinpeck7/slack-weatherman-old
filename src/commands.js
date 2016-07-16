'use strict';

let channels;
const request = require('request'),
    secrets = require('./config/secrets'),
    safeEval = require('safe-eval'),
    api = secrets.weather_api,
    token = secrets.slack_token,
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

request(`https://slack.com/api/channels.list?token=${token}`, (cErr, cResponse, cBody) => {
    request(`https://slack.com/api/groups.list?token=${token}`, (gErr, gResponse, gBody) => {
        channels = JSON.parse(cBody).channels;
        let groups = JSON.parse(gBody).groups;
        for (let group of groups) {
            channels.push(group);
        }
        console.log(`${channels.length} Channels Found`);
    });
});

let weather = (bot, message) => {
    if (message.text.split(' ')[0] === '!weather') {
        const matches = message.text.match(ziptest);

        if (!!matches) {
            for (const zip of matches) {
                request(`http://api.openweathermap.org/data/2.5/weather?zip=${zip},us&appid=${api}&units=imperial`, (err, response, body) => {
                    try {
                        const data = JSON.parse(body);
                        bot.reply(message, `Weather in ${data.name}: ${data.main.temp} degrees, ${data.weather[0].description}, wind speed is ${data.wind.speed}mph`);
                    } catch (error) {
                        bot.reply(message, 'Server error, not my fault. Try again later I guess.');
                    }
                });
            }
        }
    }
};

let forecast = (bot, message) => {
    if (message.text.split(' ')[0] === '!forecast') {
        let day = message.text.split(' ')[1].toUpperCase() || '',
            zip = message.text.split(' ')[2] || '',
            forecastData;

        if (days[day] === undefined || !zip.match(ziptest)) {
            bot.reply(message, 'Usage:');
            bot.reply(message, '!forecast {day - within 4 of current day} {zipcode}');
        }
        else {
            request(`http://api.openweathermap.org/data/2.5/forecast?zip=${zip},us&appid=${api}&units=imperial`, (err, response, body) => {
                try {
                    const data = JSON.parse(body),
                        city = data.city.name;

                    for (const hourly of data.list) {
                        const d = new Date(hourly.dt_txt);

                        if (d.getDay() === days[day] && d.getHours() === 21) {
                            forecastData = hourly;
                            break;
                        }
                    }
                    if (!!forecastData) {
                        bot.reply(message, `It will be ${forecastData.main.temp_max} degrees in ${city} on ${day.charAt(0) + day.slice(1).toLowerCase()}`);
                    }
                    else {
                        bot.reply(message, 'No data');
                    }
                } catch (error) {
                    bot.reply(message, 'Server error, not my fault. Try again later I guess.');
                }
            });
        }
    }
};

let evaluate = (bot, message) => {
    if (message.text.split(' ')[0] === '!eval') {
        try {
            const strToEval = message.text
                .replace(/(!eval\b)/g, '')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/‘/g, '\'')
                .replace(/“/g, '"'),
                response = safeEval(strToEval);

            bot.reply(message, `${response}`);
        } catch (error) {
            bot.reply(message, `${error}`);
        }
    }
};

let define = (bot, message) => {
    const words = message.text.split(' ').splice(1);

    request(`http://api.urbandictionary.com/v0/define?term=${words}`, (err, response, body) => {
        const data = JSON.parse(body);

        if (data.result_type === 'exact') {
            bot.reply(message, `"${data.list[0].definition}"`);
            bot.reply(message, `Related: ${data.tags.join(', ')}`);
        }
        else {
            bot.reply(message, 'No results');
        }
    });
};

let say = (bot, message) => {
    if (message.text.split(' ')[0] === '!say') {
        let [inputChannel, ...rest] = message.text.split(' ').splice(1),
            text = rest.join(' '),
            sayChannel;

        for (const channel of channels) {
            if (channel.name.toUpperCase() === inputChannel.toUpperCase()) {
                sayChannel = channel;
                break;
            }
        }

        if (!!sayChannel) {
            bot.say({
                text: text,
                channel: sayChannel.id
            });
            bot.reply(message, 'Sent');
        }
        else {
            bot.reply(message, 'Channel not found');
        }
    }
};

module.exports = {
    weather: weather,
    forecast: forecast,
    evaluate: evaluate,
    define: define,
    say: say
};