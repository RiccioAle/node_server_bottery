
const Slimbot = require('slimbot');
const slimbot = new Slimbot('600516703:AAFnCfuojgh84YTzdd8jV9N0sdwkuc316nM');
const bottery = require('./bottery');


// Register listeners
slimbot.on('message', message => {
  // reply when user sends a message
  console.log('Riceived message');
  bottery('weather', message.chat.id, message.text)
  .then((reply) => {
    console.log('reply:'+reply);
    let msg = '';
    reply.message.forEach(element => {
      msg += element.concat("\n");     
    });
    // Defining optional parameters
    let optionalParams = {};
    let keyboard = [[]];
    if (Array.isArray(reply.chips)) {
      console.log(reply.chips);
      reply.chips.forEach(element => {
        keyboard[0].push({text: element});
      });
      optionalParams = {
        parse_mode: "Markdown",
        reply_markup: JSON.stringify({
          keyboard : keyboard,
          resize_keyboard: true
        })
      }
    } else {
      optionalParams = {
        parse_mode: "Markdown",
        reply_markup: JSON.stringify({
          remove_keyboard : true,
        })
      }
    }
    
    slimbot.sendMessage(reply.chatId, msg, optionalParams);
  
  });
});

// Call API
slimbot.startPolling();
