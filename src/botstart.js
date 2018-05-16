"use strict";

const secrets = require("./config/secrets");
const commands = require("./commands/commands");
const token = secrets.slack_token;
const botkit = require("botkit");
const dns = require("dns");
const controller = botkit.slackbot();
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;

let weatherman;

const loggerFormat = printf(info => {
  return `${info.timestamp}: ${info.message}`;
});

const logger = createLogger({
  format: combine(timestamp(), loggerFormat),
  transports: [
    new transports.File({ filename: "error.log", options: { flags: "w" } })
  ]
});

const startBot = () => {
  logger.info("Starting...");
  weatherman = controller
    .spawn({
      token: token
    })
    .startRTM();
};

startBot();

controller.on("rtm_close", () => {
  logger.info("RTM close");
  const intervalID = setInterval(() => {
    logger.info("Retrying connection");
    dns.lookupService("8.8.8.8", 80, (error, hostname) => {
      if (!!hostname) {
        logger.info("Connection found, restarting");
        startBot();
        clearInterval(intervalID);
      }
    });
  }, 60000);
});

controller.hears("!commands", "ambient,direct_message", (bot, message) => {
  const cmds = `How to order me around:
    !weather [zipcodes]
    !forecast [day] [zipcode]
    !define [word]
    !leaderboard
    !eval [javascript]
    [name] ++|--

    Trivia:
    !trebek -- get new question
    !question -- show current question
    !answer -- show answer to current question`;

  bot.reply(message, cmds);
});

controller.on("direct_mention", commands.sendMessage);
controller.hears("!weather", "ambient,direct_message", commands.weather);
controller.hears("!forecast", "ambient,direct_message", commands.forecast);
controller.hears("!eval", "ambient,direct_message", commands.evaluate);
controller.hears("!define", "ambient,direct_message", commands.define);
controller.hears("!say", "direct_message", commands.say);
controller.hears(
  "!leaderboard",
  "ambient,direct_message",
  commands.showLeaderboard
);
controller.hears("\\+\\+", "ambient,direct_message", commands.addRep);
controller.hears("--", "ambient,direct_message", commands.subtractRep);
controller.hears("!trebek", "ambient,direct_message", commands.getNewQuestion);
controller.hears("!question", "ambient,direct_message", commands.getQuestion);
controller.hears("!answer", "ambient,direct_message", commands.getAnswer);
