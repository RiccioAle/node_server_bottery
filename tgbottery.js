
const Slimbot = require('slimbot');
const slimbot = new Slimbot('600516703:AAFnCfuojgh84YTzdd8jV9N0sdwkuc316nM');
const bottery = require('./bottery');

//bottery('meteobot', 222134193, 'Domani');
bottery('tesla', 60, 'prova');

// Register listeners
slimbot.on('message', message => {
  
  // reply when user sends a message
  console.log('Riceived message');
  bottery('mastermind', message.chat.id, message.text);
});

slimbot.on('edited_message', edited_message => {
  // reply when user edits a message
  console.log('Riceived edited_message');
  bottery('mastermind', message.chat.id, message.text);
});

// Call API
slimbot.startPolling();
