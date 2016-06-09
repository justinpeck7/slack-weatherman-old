'use strict';

const secrets = require('./secrets'),
    commands = require('./commands'),
    token = secrets.slack_token,
    botkit = require('botkit'),
    controller = botkit.slackbot(),
    weatherman = controller.spawn({
        token: token
    }).startRTM();

controller.on('direct_mention', (bot, msg) => {
    bot.reply(msg, 'Commands:');
    bot.reply(msg, '!forecast {zipcode}');
    bot.reply(msg, '!eval {javascript}');
});

controller.hears('!forecast', 'ambient,direct_message', commands.forecast);

controller.hears('!eval', 'ambient,direct_message', commands.evaluate);
