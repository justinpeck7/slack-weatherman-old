'use strict';

const secrets = require('./config/secrets'),
    commands = require('./commands'),
    token = secrets.slack_token,
    botkit = require('botkit'),
    dns = require('dns'),
    controller = botkit.slackbot();

let weatherman = controller.spawn({
    token: token
}).startRTM();

const resetBot = function () {
    weatherman = controller.spawn({
        token: token
    }).startRTM();
};

controller.on('rtm_close', () => {
    const intervalID = setInterval(() => {
        dns.lookupService('8.8.8.8', 80, (error, hostname) => {
            if (!!hostname) {
                resetBot();
                clearInterval(intervalID);
            }
        });
    }, 30000);
});

controller.on('direct_mention', (bot, message) => {
    bot.reply(message, 'Commands:');
    bot.reply(message, '!weather {space separated zipcodes}');
    bot.reply(message, '!forecast {day} {zipcode}');
    bot.reply(message, '!eval {javascript}');
});

controller.hears('!weather', 'ambient,direct_message', commands.weather);
controller.hears('!forecast', 'ambient,direct_message', commands.forecast);
controller.hears('!eval', 'ambient,direct_message', commands.evaluate);
controller.hears('!say', 'direct_message', commands.say);