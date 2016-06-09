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
}, 450000);

controller.on('direct_mention', (bot, msg) => {
    bot.reply(msg, 'Commands:');
    bot.reply(msg, '!forecast {zipcode}');
    bot.reply(msg, '!eval {javascript}');
});

controller.hears('!weather', 'ambient,direct_message', commands.forecast);

controller.hears('!eval', 'ambient,direct_message', commands.evaluate);
