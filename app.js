if (!process.env.token) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}

// Microsoft BotKit
var Botkit = require('botkit');

// NodeBots
var five = require("johnny-five");
var board = new five.Board();

// A promise to beep
function beep(horn, time_on, time_off) {
  var time_off = typeof time_off !== 'undefined' ? time_off : 0;

  horn.on();
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      horn.off();
      setTimeout(function() {
        resolve(true);
      }, time_off);
    }, time_on);
  });
}

board.on("ready", function() {
  // Create the software horn
  var horn = new five.Led(10);

  // Create the SlackBot
  var controller = Botkit.slackbot({ debug: false });
  var bot = controller.spawn({ token: process.env.token }).startRTM();

  controller.on("channel", function(message, user) {
    console.log("channel");
  });

  // Blast the horn when we hear @here or @channel in a message
  controller.hears(["@here", "@channel"], ['direct_message','direct_mention','ambient'], function(bot, message) {
    bot.reply(message, "<@" + message.user + ">: it looks like you're trying to get everyone's attention - I can help with that!!");
    beep(horn, 1000, 250)
    .then(function() { beep(horn, 1000, 250)
      .then(function() { beep(horn, 1000); })
    });
  });

  console.log("Ready!");
});
