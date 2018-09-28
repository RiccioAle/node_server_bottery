
const Slimbot = require('slimbot');
const slimbot = new Slimbot('600516703:AAFnCfuojgh84YTzdd8jV9N0sdwkuc316nM');
const Bottery = require('./bottery2');

// Creo un oggetto per ogni chat
global.bottery = new Bottery('tesla');

bottery.on('message', message => {
  slimbot.sendMessage(bottery.chatId, message);
});


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
