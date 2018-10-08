var Pointer = require('./pointer.js');

class App {
      
    constructor(chatId, map) {
        this.start = Date.now();             
        this.map = map;
        this.chatId = chatId;
        this.autoprogress= false;    
        this.pointer = new Pointer(this);
        this.pointer.enterMap(map);
        
        
    }

}

module.exports = App;