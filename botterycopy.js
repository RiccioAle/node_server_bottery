
// Importazione degli altri moduli
var chat = require('./src/chat.js'); // Oggetti presenti nella lavagna
var io = require('./src/io.js'); // Gestione input ed output
var parseMap = require('./src/map.js').parseMap;
var Pointer = require('./src/pointer.js');


// Default map id
var defaultMapID = "tesla";

var testMaps = {}
testMaps[defaultMapID] =  require('./src/bots/tesla.js');
console.log(testMaps);


// app deve essere una variabile globale perché usata in altri moduli
global.app = {
  start: Date.now(),
  autoprogress: false,  //ra01 veniva impostata da controls
  outputMode: 'text',   //ra01 veniva impostata da controls
  autoprogress: false,  //ra01 veniva impostata da controls
  exitPause: 0.5,       //ra01 veniva impostata da controls
  pause: false,         //ra01 veniva impostata da controls
  updateSpeed: 0.5,     //ra01 veniva impostata da controls

  togglePause: function() {
    // app.paused = !app.paused;
    // console.log(app.paused);
    // if (app.paused)
    //   $(".toggle").html("unpause");
    // else
    //   $(".toggle").html("pause");
  },

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
    slimbot.sendMessage('222134193', message);
  },

  loadMapByID: function(id, edited) {
    console.info("Load map by id: '%s', edited: %s", id, edited);
    var raw = testMaps[id];

    // if (edited) {
    //   var found = localStorage.getItem("map_" + id);
    //
    //   if (found !== null) {
    //     raw = JSON.parse(found);
    //     console.info("Successfully loaded edited '%s'", id);
    //   }
    // }

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


    var loaded = mapCount++;

    // clear current
    chat.clear();

    app.rawMap = raw;
    app.map = parseMap(raw);
    app.map.name = id;

    app.pointer = new Pointer();

    app.pointer.enterMap(app.map);

}

};

const Slimbot = require('slimbot');
const slimbot = new Slimbot('258994103:AAH1ZQ4hwdrrA3f5ewO2lNLmOdrODXd9YMA');

// Register listeners

// Register listeners
slimbot.on('message', message => {
  // reply when user sends a message
  slimbot.sendMessage(message.chat.id, 'Message received');
});

slimbot.on('edited_message', edited_message => {
  // reply when user edits a message
  slimbot.sendMessage(edited_message.chat.id, 'Message edited');
});
// Call API

slimbot.startPolling();

var mapCount = 0;
var updateSpeed = 20;


io.init();
chat.init();

// Get the startUpMapId before we load the controls so we can assign the
// dropdown properly
//ra01  var startUpMapId = localStorage.getItem("lastMap");
//ra01 if (startUpMapId === null) {
//ra01  startUpMapId = defaultMapID;
//ra01 }
var startUpMapId = defaultMapID;

//ra01 controls.init(startUpMapId);

function update() {
  if (!app.paused && !app.ioLocked) {
    app.pointer.update();
  }
  setTimeout(update, Math.pow(1 - app.updateSpeed, 2) * 450 + 100);
}


app.loadMapByID(startUpMapId, true);
update();
