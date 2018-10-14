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

    update() {
        
        // number of loop for change state
        this.numberUpdate++;
    
    
        if (this.pointer.selectedExit)
          this.pointer.useExit(this.pointer.selectedExit);
    
    
        this.pointer.updateExits();
    
        // Loop for update state
        if (this.numberUpdate < 100 && (
            this.pointer.previusState === undefined ||
            this.pointer.previusState !== this.pointer.currentState)) {
            this.pointer.previusState = this.pointer.currentState;
            this.update();
        } else {
            // save the last state 
            if (this.pointer.blackboard.children !== undefined) {
                this.pointer.blackboard.children.INPUT = null;
                this.pointer.blackboard.children.INPUT_NUMBER = null;
                this.pointer.blackboard.value = null;
            }
            console.log(this.pointer.blackboard);
            admin.database().ref(this.map.name+'/chats/'+this.chatId).set({
                currentState: this.pointer.currentState.key,
                blackboard: this.pointer.blackboard
            });
        }
      }


}

module.exports = App;