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
        for (let zip of matches) {
            request(`http://api.openweathermap.org/data/2.5/weather?zip=${zip},us&appid=${api}&units=imperial`, function(err, response, body) {
                let info = JSON.parse(body);
                bot.reply(msg, `Weather in ${info.name}: ${info.main.temp} degrees, ${info.weather[0].description}, wind speed is ${info.wind.speed}mph`);
            });
        }

    } else {
        bot.reply(msg, 'Give me a zipcode ya idiot');
    }
});
