
// Importazione degli altri moduli
var parseMap = require('./src/map.js').parseMap;
const App = require('./src/app.js');

// Definizione della funzione bottery
var bottery = (botName, chatId, message) => {

  // carico il bot richiesto
  console.info('Load map ${botName}');
  var raw = require('./src/bots/'+botName +'.js');

  // Bot non trovato
  if (!raw) 
      throw new Error('Map ${botName} not found');
      
  console.info('Starting ${botName}');
  if (!raw.settings)
    raw.settings = {
      id: botName
    };

  var rawMap = raw;
  var map = parseMap(raw);
  map.name = botName;

  var app = new App(chatId, map);
       
};

module.exports = bottery;
