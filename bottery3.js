
// Importazione degli altri moduli
var parseMap = require('./src/map.js').parseMap;
const App = require('./src/app.js');

const serviceAccount = require('./serviceAccountKey.json')
global.admin = require('firebase-admin');
    
admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://"+serviceAccount.project_id+".firebaseio.com"
});    

// Definizione della funzione bottery
var bottery = async (botName, chatId, message) => {

  // carico il bot richiesto
  console.info('Load map '+botName);
  var raw = require('./src/bots/'+botName +'.js');

  // Bot non trovato
  if (!raw) 
      throw new Error('Map '+botName+' not found');
      
  console.info('Starting '+ botName);
  if (!raw.settings)
    raw.settings = {
      id: botName
    };

  var rawMap = raw;
  var map = parseMap(raw);
  map.name = botName;

  var app = new App(chatId, map);
  app.pointer.handleInput(message);
  app.pointer.update();

};

module.exports = bottery;
