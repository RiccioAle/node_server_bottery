
// Importazione degli altri moduli
var parseMap = require('./src/map.js').parseMap;
const App = require('./src/app.js');

const serviceAccount = require('./serviceAccountKey.json')
global.admin = require('firebase-admin');
    
admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://"+serviceAccount.project_id+".firebaseio.com"
});    

const EventEmitter = require('eventemitter3');

class Bottery extends EventEmitter {

  // Il costruttore riceve il nome del bot
  constructor(botName) {
    super();

    // collego il database di firebase
    this.database = admin.database();

    // memorizzo nome del bot e id della chat
    this.botName = botName;
    this.chatId = 0;
    this.app = [];
    this.loadMapByID(botName);
    //update();
  }

  loadMapByID(id) {
        console.info("Load map by id: '%s', edited: %s", id);
        var raw = require('./src/bots/'+id +'.js');

        if (raw) {
          this.loadMap(raw, id);
          //ra01 localStorage.setItem("lastMap", id);
        } else {
          console.error("Map '%s' not found", id);
        }
  }

  loadMap(raw, id) {

      console.info("Starting '%s'", id)
        if (!raw.settings)
        raw.settings = {
          id: id
        };

        this.rawMap = raw;
        this.map = parseMap(raw);
        this.map.name = id;

  }

  // Riceve in input un testo
  inputText(chatId, text) {
      
      // salvo l'ultimo messaggio
      this.database.ref('chats/'+chatId).set({
         message: text
      });

      if (this.app[chatId] === undefined) {
        this.app[chatId] = new App(chatId);
        this.app[chatId].go();
      }

      //ra01 io.input("chat", text);
      bottery.app[chatId].pointer.handleInput(text);
      update();
  }

  // invio risposta al messaggio
  sendMessage(message) {
    this.emit('message', message);
  }
}

function update() {
  
    bottery.app.forEach(element => {
      element.pointer.update();
    });
  
  setTimeout(update, Math.pow(1 - 0.5, 2) * 450 + 100);
}



module.exports = Bottery;
