'use strict';

const request = require('request'),
    secrets = require('../config/secrets'),
    noresults = require('../config/noresults'),
    services = require('../services/services'),
    safeEval = require('safe-eval'),
    appId = secrets.weather_appid,
    token = secrets.slack_token,
    ziptest = /(\b\d{5}\b)/g,
    parser = require('../plusplus/utils/parser'),
    plusplus = require('../plusplus/plusplus'),
    days = {
        SUNDAY: 0,
        MONDAY: 1,
        TUESDAY: 2,
        WEDNESDAY: 3,
        THURSDAY: 4,
        FRIDAY: 5,
        SATURDAY: 6
    };

let channels, users = {};

request(services.slackChannelApi(token), (cErr, cResponse, cBody) => {
    request(services.slackGroupApi(token), (gErr, gResponse, gBody) => {
        channels = JSON.parse(cBody).channels;
        let groups = JSON.parse(gBody).groups;
        for (let group of groups) {
            channels.push(group);
        }
        request(services.slackUsers(token), (uErr, uResponse, uBody) => {
            const members = JSON.parse(uBody).members;
            for (const member of members) {
                users[member.id] = member.name;
            }
            console.log(`${Object.keys(users).length} Users Found across ${channels.length} channels`);
        });
    });
});

let weather = (bot, message) => {
    if (message.text.split(' ')[0].toLowerCase() === '!weather') {
        const matches = message.text.match(ziptest);

        if (!!matches) {
            for (const zip of matches) {
                request(services.weatherDataApi(zip, appId), (err, response, body) => {
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
    if (message.text.split(' ')[0].toLowerCase() === '!forecast') {
        let day = message.text.split(' ')[1].toUpperCase() || '',
            zip = message.text.split(' ')[2] || '',
            forecastData;

        if (days[day] === undefined || !zip.match(ziptest)) {
            bot.reply(message, 'Usage:');
            bot.reply(message, '!forecast {day - within 4 of current day} {zipcode}');
        }
        else {
            request(services.forecastDataApi(zip, appId), (err, response, body) => {
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
    if (message.text.split(' ')[0].toLowerCase() === '!eval') {
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
    if (message.text.split(' ')[0].toLowerCase() === '!define') {
        const words = message.text.split(' ').splice(1).join(' ');

        request(services.urbanDictApi(words), (err, response, body) => {
            const data = JSON.parse(body);

            if (data.result_type === 'exact') {
                bot.reply(message, `"${data.list[0].definition}"`);
                if (data.tags.length > 0) {
                    bot.reply(message, `Related: ${data.tags.join(', ')}`);
                }
            }
            else {
                let response = noresults.responses[Math.random() * noresults.responses.length >> 0];
                bot.reply(message, response);
            }
        });
    }
};

let say = (bot, message) => {
    if (message.text.split(' ')[0].toLowerCase() === '!say') {
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

const addRep = (bot, message) => {
    if (parser.isValidInput(message.text.split(' '))) {
        plusplus.updateRep(message, users, true).then(updated => {
            if (updated.sameUser) {
                bot.reply(message, `${updated.user}'s rep decreased to ${updated.rank}`);
            }
            else {
                bot.reply(message, `${updated.user}'s rep increased to ${updated.rank}`);
            }
        });
    }
};

const subtractRep = (bot, message) => {
    if (parser.isValidInput(message.text.split(' '))) {
        plusplus.updateRep(message, users, false).then(updated => {
            bot.reply(message, `${updated.user}'s rep decreased to ${updated.rank}`);
        });
    }
};

const showLeaderboard = (bot, message) => {
    const sortable = [],
        space = ' ',
        divider = '|';

    plusplus.getRanks().then(stored => {
        for (const key in stored) {
            sortable.push([key, stored[key]]);
        }
        sortable.sort((a, b) => b[1] - a[1]);
        bot.reply(message, 'Rankings:');
        bot.reply(message, '-'.repeat(20));
        for (const entry of sortable) {
            bot.reply(message, `${entry[1]}${space.repeat(Math.abs(4 - entry[1].toString().length))}${divider} ${entry[0]}`);
        }
    });
};

module.exports = {
    weather,
    forecast,
    evaluate,
    define,
    say,
    addRep,
    subtractRep,
    showLeaderboard
};