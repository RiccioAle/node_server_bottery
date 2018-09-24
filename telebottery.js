
const Slimbot = require('slimbot');
const slimbot = new Slimbot('');
const Bottery = require('./bottery');
global.bottery = new Bottery('amIpsychic');

bottery.on('message', message => {
  //Slimbot.message(message.chat.id, message);
})

// Register listeners
slimbot.on('message', message => {
  // reply when user sends a message
  console.log('Riceived message');
  bottery.inputText(message.chat.id, message.text);
});

slimbot.on('edited_message', edited_message => {
  // reply when user edits a message
  console.log('Riceived edited_message');
  bottery.inputText(edited_message.chat.id, edited_message.text);
});

// Call API
slimbot.startPolling();
