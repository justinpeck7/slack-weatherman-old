'use strict';

const secrets = require('./secrets'),
    token = secrets.slack_token,
    api = secrets.weather_api,
    botkit = require('botkit'),
    request = require('request'),
    controller = botkit.slackbot(),
    ziptest = /\d{5}/;

const weatherman = controller.spawn({
    token: token
}).startRTM();

controller.on('direct_mention,direct_message', function(bot, msg) {

    const matches = msg.text.match(ziptest);

    if (!!matches) {
        const zip = matches[0];
        request(`http://api.openweathermap.org/data/2.5/weather?zip=${zip},us&appid=${api}&units=imperial`, function(err, response, body) {
            let info = JSON.parse(body);
            bot.reply(msg, `Weather in ${info.name}: ${info.main.temp} degrees, ${info.weather[0].description}, wind speed is ${info.wind.speed}mph`);
        });
    }
    else {
        bot.reply(msg, 'Include a zipcode ya idiot');
    }
});
