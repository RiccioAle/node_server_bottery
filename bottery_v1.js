
// Importazione degli altri moduli
// var io = require('./src/io.js'); // Gestione input ed output
var parseMap = require('./src/map.js').parseMap;
var Pointer = require('./src/pointer.js');

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

    this.app = {
      start: 0,             //ra01 inizialmente il bot è fermo
      autoprogress: false,  //ra01 veniva impostata da controls
      //outputMode: 'text',   //ra01 rimossa perché l'output è sempre text
      autoprogress: false,  //ra01 veniva impostata da controls
      exitPause: 0.5,       //ra01 veniva impostata da controls
      pause: false,         //ra01 veniva impostata da controls
      updateSpeed: 0.5,     //ra01 veniva impostata da controls

      // Time
      time: {
        start: Date.now() * .001,
        current: 0,
        elapsed: .1,
        frame: 0,
      },

      updateTime: function() {
        var temp = Date.now() * .001 - app.time.start;
        app.time.elapsed = temp - app.time.current;
        app.time.current = temp;
      },

      

      loadMapByID: function(id) {
        console.info("Load map by id: '%s', edited: %s", id);
        var raw = require('./src/bots/'+id +'.js');

        if (raw) {
          this.loadMap(raw, id);
          //ra01 localStorage.setItem("lastMap", id);
        } else {
          console.error("Map '%s' not found", id);
        }
      },

      loadMap: function(raw, id) {
        console.info("Starting '%s'", id)
        if (!raw.settings)
        raw.settings = {
          id: id
        };

        this.rawMap = raw;
        this.map = parseMap(raw);
        this.map.name = id;

        this.pointer = new Pointer();
        this.pointer.enterMap(this.map);
        this.pointer.goTo('origin');

      }

    };

  }

  start() {
    this.app.start = Date.now(),
    this.app.loadMapByID(this.botName, true);
    
    update();
  }

  // Riceve in input un testo
  inputText(chatId, text) {
      
      // salvo l'ultimo messaggio
      this.database.ref('chats/'+chatId).set({
         message: text
      });
    
      // Se non ancora avviato faccio partire il bot
      if (this.app.start == 0)
        this.start();


      //ra01 io.input("chat", text);
      bottery.app.pointer.handleInput(text);
  }

  // invio risposta al messaggio
  sendMessage(message) {
    this.emit('message', message);
  }
}

function update() {
  //if (!app.paused && !app.ioLocked) {
    bottery.app.pointer.update();
  //}
  setTimeout(update, Math.pow(1 - bottery.app.updateSpeed, 2) * 450 + 100);
}

module.exports = Bottery;
