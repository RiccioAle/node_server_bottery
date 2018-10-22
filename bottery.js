
// Import other modules
var parseMap = require('./src/map.js').parseMap;
const App = require('./src/app.js');
var BBO = require('./src/blackboard3.js').BBO;

const serviceAccount = require('./serviceAccountKey.json')
global.admin = require('firebase-admin');
    
admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://"+serviceAccount.project_id+".firebaseio.com"
});    

// Definition of bottery async funciont
var bottery = async (botName, chatId, message) => {

  // load requested bot
  console.info('Load map '+botName);
  var raw = require('./src/bots/'+botName +'.js');

  // Bot not found
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

  var app = new App(chatId, message, map);
  await _loadState(app.pointer); 
 
  return app.pointer.reply;
  
};

// this function resume the last state for the chat
async function _loadState(pointer) {
  
  let chat = admin.database().ref(pointer.app.map.name+'/chats/'+pointer.app.chatId);
  let children = chat.child('blackboard').child('children');
  
  // Load blackboard with variables
  const snapBB = await children.on('child_added', snap =>  {  
      if (pointer.blackboard.children === undefined) {
        pointer.blackboard.children = {};   
      }
      if (pointer.blackboard.children[snap.key] === undefined) { 
        pointer.blackboard.children[snap.key] = new BBO();
      }
      if (snap.val().value !== undefined)
      pointer.blackboard.children[snap.key].value = snap.val().value;
      else {
        _loadBlackBoard(pointer.blackboard.children[snap.key], snap.val().children);
      }
  });
 
  const snap = await chat.child('currentState').once('value', function(snapshot) {
        if (snapshot.val() !== null) {
          pointer.resumeState = snapshot.val();
          pointer.goTo(snapshot.val());
        } else {
          pointer.goTo('origin');
        }
        // Gestisco il messaggio in input
        pointer.handleInput(pointer.app.message);
        pointer.update();
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
}

// Load blackboard with multidimensional array 
function _loadBlackBoard(bbo, snap) {
  for (var key in snap) {
  
    if (bbo.children === undefined) {
      bbo.children = {};   
    }
    if (bbo.children[key] === undefined) { 
      bbo.children[key] = new BBO();
    }
    if (snap[key].value !== undefined)
      bbo.children[key].value = snap[key].value;
    else {
      console.log(snap[key].children);
      _loadBlackBoard(bbo.children[key], snap[key].children);
    }
  }
}

module.exports = bottery;
