
const Slimbot = require('slimbot');
const slimbot = new Slimbot('');
const Bottery = require('./bottery');
global.bottery = new Bottery('tesla');
bottery.start();

function update() {
  //if (!app.paused && !app.ioLocked) {
    bottery.app.pointer.update();
  //}
  setTimeout(update, Math.pow(1 - bottery.app.updateSpeed, 2) * 450 + 100);
}
update();

// Registro listener per le risposte di Bottery
bottery.on('message', message => {
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
