class App {
      
    constructor() {
        this.start = Date.now();             
        this.autoprogress= false;    
        this.pointer = new Pointer();
        this.pointer.enterMap(bottery.map);
        this.pointer.goTo('origin');
    }

}