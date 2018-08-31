
const Slimbot = require('slimbot');
const slimbot = new Slimbot('258994103:AAH1ZQ4hwdrrA3f5ewO2lNLmOdrODXd9YMA');
const Bottery = require('./bottery');
const bottery = new Bottery('tesla');


// Registro listener per le risposte di Bottery
Bottery.on('message', message => {
    // Configuro il messaggio per Telegram
    let telegramMessage = message;
    slimbot.sendMessage(message.chat.id, telegramMessage);
});


// Register listeners

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
