'use strict';

// Importazione degli altri moduli
var io = require('./src/io.js'); // Gestione input ed output
var parseMap = require('./src/map.js').parseMap;
var Pointer = require('./src/pointer.js');

const EventEmitter = require('eventemitter3');

class Bottery extends EventEmitter {

  // Il costruttore riceve il nome del bot
  constructor(botName) {
    super();
    this.botName = botName;
    this.start();
  }

  start() {

    this.io.init();
    this.app = {
      start: Date.now(),
      autoprogress: false,  //ra01 veniva impostata da controls
      outputMode: 'text',   //ra01 veniva impostata da controls
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

      // invio risposta al messaggio
      sendMessage: function(message) {
        this.emit('message', message);
      },

      loadMapByID: function(id) {
        console.info("Load map by id: '%s', edited: %s", id);
        var raw = require('./src/bots/'+this.botName +'.js');

        if (raw) {
          app.loadMap(raw, id);
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

        app.rawMap = raw;
        app.map = parseMap(raw);
        app.map.name = id;

        app.pointer = new Pointer();

        app.pointer.enterMap(app.map);

      }

    };
    app.loadMapByID(startUpMapId, true);
  }

  // Riceve in input un testo
  inputText(text) {
      io.input("chat", s);
  }

  update() {
    if (!app.paused && !app.ioLocked) {
      app.pointer.update();
    }
    setTimeout(update, Math.pow(1 - app.updateSpeed, 2) * 450 + 100);
  }


}

module.export = Bottery;
