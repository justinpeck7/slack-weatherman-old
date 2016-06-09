'use strict';

const secrets = require('./secrets'),
    commands = require('./commands'),
    token = secrets.slack_token,
    botkit = require('botkit'),
    controller = botkit.slackbot();

let weatherman = controller.spawn({
        token: token
    }).startRTM();

setInterval(() => {
    weatherman.closeRTM();
    weatherman = controller.spawn({
        token: token
    }).startRTM();
}, 600000);

controller.on('direct_mention', (bot, message) => {
    bot.reply(message, 'Commands:');
    bot.reply(message, '!weather {space separated zipcodes}');
    bot.reply(message, '!forecast {day} {zipcode}');
    bot.reply(message, '!eval {javascript}');
});

controller.hears('!weather', 'ambient,direct_message', commands.weather);
controller.hears('!forecast', 'ambient,direct_message', commands.forecast);
controller.hears('!eval', 'ambient,direct_message', commands.evaluate);
