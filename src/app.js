var Pointer = require('./pointer.js');

class App {
      
    constructor(map) {
        this.start = Date.now();             
        this.map = map;
        this.autoprogress= false;    
        this.pointer = new Pointer(this);
        this.pointer.enterMap(map);
        this.pointer.goTo('origin');
        this.pointer.handleInput(message);
    }

}

module.exports = App;