'use strict';

const secrets = require('./secrets'),
    token = secrets.slack_token,
    api = secrets.weather_api,
    botkit = require('botkit'),
    request = require('request'),
    controller = botkit.slackbot(),
    ziptest = /(\b\d{5}\b)/g,
    weatherman = controller.spawn({
        token: token
    }).startRTM();

controller.on('direct_mention,direct_message', (bot, msg) => {
    
    const matches = msg.text.match(ziptest);

    if (!!matches) {
        for (const zip of matches) {
            request(`http://api.openweathermap.org/data/2.5/weather?zip=${zip},us&appid=${api}&units=imperial`, (err, response, body) => {
                const info = JSON.parse(body);
                bot.reply(msg, `Weather in ${info.name}: ${info.main.temp} degrees, ${info.weather[0].description}, wind speed is ${info.wind.speed}mph`);
            });
        }
    }
});

controller.hears('eval', 'ambient,direct_message', (bot, msg) => {
    try {
        const response = eval(msg.text.replace('eval ', ''));
        bot.reply(msg, `${response}`);
    } catch (error) {
        bot.reply(msg, `${error}`);
    }
});