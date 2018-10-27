var Pointer = require('./pointer.js');

class App {
      
    constructor(chatId, message, map) {
        this.start = Date.now();   
        this.numberUpdate = 0;      
        this.map = map;
        this.chatId = chatId;
        this.message = message;
        this.autoprogress= false; 
        this.pointer = new Pointer(this);
        this.pointer.enterMap(map);       
    }

}

module.exports = App;