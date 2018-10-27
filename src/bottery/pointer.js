// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// ra01 - Minimizzato codice
var tracery = require('./tracery.js').tracery; //ra01
var inQuotes = require('./tracery.js').inQuotes; //ra01
var isString = require('./tracery.js').isString; //ra01
var BBO = require('./blackboard3.js').BBO;// Oggetti presenti nella lavagna
var performAction = require('./map.js').performAction; //ra01
var evaluateCondition = require('./map.js').evaluateCondition; //ra01
var evaluateExpression = require('./map.js').evaluateExpression; //ra01
var parseMapPath = require('./map.js').parseMapPath; //ra01   

// Riceve l'id della chat
var Pointer = function(app) {
  //var pointer = this;

  this.app = app;  //ra01 Aggiunto l'oggetto app
  this.outputQueue = [];  //ra01 preso da io
  
  this.reply = {
    chatId: app.chatId,
    message: [],
    chips: {}
  };

  this.exitCountdown = 0;
  this.inputLog = [];
  this.analyzedExits = [];
  this.chatRef = admin.database().ref(app.map.name+'/chats/'+app.chatId);
  
}

Pointer.prototype.get = function(path) {

  // ra01  The value must be set to undefined for recalculate
  if (path.type == 'path') {
    path.steps.forEach(function(step) {
      if (step.type == 'path' && step.value!==undefined) {
        step.value = null;
      }
    });
  }

  // Parse a plaintext path into steps
  if (isString(path))
    path = parseMapPath(path);
  var steps = path.steps.map(step => step.value !== undefined ? step.value : step);

  var v = this.blackboard.getFromPath(steps, this);

  return v;
}

Pointer.prototype.set = function(path, val) {

  // Parse a plaintext path into steps
  if (isString(path))
    path = parseMapPath(path);



  var steps = path.steps.map(step => step.value !== undefined ? step.value : step);

  var valid = this.blackboard.setFromPath(steps, val, this);

  // resave the bbo
  // Underscores save to localstorage
  var last = steps[steps.length - 1];

  if (steps.length === 1 && steps[0].startsWith("_")) {
    //io.saveData(app.map, steps[0], val)
  }
}

Pointer.prototype.handleInput = function(input) {
  if (input === "help") {
    // list various inputs

  } else if (input === "/start") {       //ra01 se start non elaboro ma avvio solo
  } else {
    console.log("INPUT: " + inQuotes(input));
    this.inputLog.push(input);
    this.lastInput = input;
    this.blackboard.setFromPath("INPUT", input);
    var val = parseFloat(input);
    if (!isNaN(val))
      this.blackboard.setFromPath("INPUT_NUMBER", val);
    this.updateExits();
  }
  
}

Pointer.prototype.clearInput = function() {
    this.lastInput = undefined;
    this.blackboard.setFromPath("INPUT", undefined);
    this.lastInputNumber = undefined;
    this.blackboard.setFromPath("INPUT_NUMBER", undefined);
  }

  Pointer.prototype.update = function() {
    var pointer = this;
    // number of loop for change state
    pointer.app.numberUpdate++;

    //ra01 ar t = Date.now() - app.start;
    var t = Date.now() - this.app.start;
    this.timeInState = t - this.timeEnteredState;
    this.timeInState *= .001;
    t *= .001;
    //this.blackboard.setFromPath("TIME_IN_STATE", this.timeInState);

    if (this.selectedExit)
      this.useExit(this.selectedExit);


    this.updateExits();

    // ra01 - riaggiornamento puntatore stato
    //if (t < this.app.chatId) {
    if (pointer.app.numberUpdate < 10 && (
      this.previusState === undefined ||
      this.previusState !== this.currentState)) {
      this.previusState = this.currentState;
      // setTimeout(function () {pointer.update()}, Math.pow(1 - 0.5, 2) * 450 + 100);
      //   setTimeout(function () {
      //     pointer.update()
      //    }, 100);
      this.update();
    } else {
       // salvo l'ultimo stato 
       this.blackboard.children.INPUT = null;
       this.blackboard.children.INPUT_NUMBER = null;
       this.blackboard.value = null;
       console.log(this.blackboard);
       admin.database().ref(pointer.app.map.name+'/chats/'+this.app.chatId).update({
         currentState: this.currentState.key,
         blackboard: this.blackboard
       });
    }
  }

Pointer.prototype.updateExits = function() {
  var pointer = this;

  // Check all the exits to see which are active
  this.analyzedExits.forEach(function(exit) {
    exit.priority = 1;

    if (exit.template.priority) {
      exit.priority = evaluateExpression(exit.template.priority, this);
    }
    exit.conditions.forEach(function(condition) {
      updateCondition(condition, pointer);
    });
    updateExit(exit, pointer);
  });

  var open = this.analyzedExits.filter(exit => exit.isOpen).sort(function(a, b) {
    return b.priority - a.priority;
  });



  // Select the first open exit
  if (open.length > 0 && this.selectedExit === undefined) {
    this.selectExit(open[0]);
  }



}



Pointer.prototype.useExit = function(key) {
  var pointer = this;

  if (pointer.selectedExit) {
    //ra01 pointer.selectedExit.div.addClass("active");

    pointer.exitCountdown--;
    if (pointer.exitCountdown <= 0) {
      // Calculate the target (for now, assume plaintext targets)
      var target = pointer.selectedExit.template.target.raw;
      this.goTo(target, this.selectedExit);
    }


  } else {
    console.warn("No exit selected!");
  }

}

Pointer.prototype.goTo = function(key, useExit) {


  console.log("----------------------\nGo to " + inQuotes(key));
  var pointer = this;

  pointer.selectedExit = undefined;
  var nextState = this.map.states[key];
  if (key == "*") {
    // pop from the stack
  }

  // reenter this state
  if (key == "@") {
    nextState = pointer.currentState;
    pointer.clearInput();

  }

  // don't go anywhere
  if (key == "/") {
    nextState = undefined;
  }

  if (nextState === undefined)
    console.warn("No state found: " + inQuotes(key));

  if (nextState) {
    if (this.currentState)
      this.exitState(this.currentState);
  }

  if (useExit) {
    //ra01 $.each(useExit.template.actions, function(index, action) {
    useExit.template.actions.forEach(function(action) {
      performAction(action, pointer);
    });



  }


  if (nextState) {

    this.currentState = nextState;
    if (this.currentState) {
     //ra01 viz.setClassesExclusive(this.currentState, "active");
      
      this.enterState(this.currentState);
    }
  }


}

Pointer.prototype.flatten = function(rule) {
  if (rule === undefined)
    return undefined;

  var node = this.grammar.expand(rule, {
    worldObject: this.blackboard
  });


  if (node.finished !== undefined)
    return node.finished;
  return node;

}

Pointer.prototype.exitState = function() {
  //  console.log("\nExit " + this.currentState.key);
}


Pointer.prototype.enterState = function() {
  
  //ra01 viz.removeExitClasses();

  //ra01 this.timeEnteredState = Date.now() - app.start;
  this.timeEnteredState = Date.now() - this.app.start;
  var pointer = this;

  // ra01 - non utilizzo jQuery
  //$.each(this.currentState.onEnter, function(index, action) {
  if (this.currentState.key != this.resumeState) {
    this.currentState.onEnter.forEach(function(action) {      //ra01
      performAction(action, pointer);
    });
  }
  this.resumeState = null;


  // Make chips
  if (this.currentState.chips) {
    if (isString(this.currentState.chips))
      this.currentState.chips = [this.currentState.chips];
    //ra01 tolto utilizzo della chat
    //chat.setChips(this.currentState.chips.map(function(chip) {
    // var s = pointer.flatten(chip);

    //  return {
    //    displayText: s,
    //    inputText: s
    //  }
    //}));
  }


  // Update the view
  //ra01 this.stateView.state.html(this.currentState.key);


  // Clear inputs before triggering any exits
  pointer.clearInput();

  this.collectExits();
};

Pointer.prototype.selectExit = function(exit) {

  //ra01 $(".mapinfo-exit").removeClass("selected");
  //ra01 $(".mapinfo-" + exit.template.key).addClass("selected");
  this.selectedExit = exit;
  //ra01 - Nessuna attesa
  //ra01this.exitCountdown = Math.ceil(10 * Math.pow(app.exitPause, 2));
  this.exitCountdown = 0;
  //ra01 viz.setClassesExclusive(this.selectedExit, "active");
};

Pointer.prototype.deselectExit = function(exit) {
  //ra01 $(".mapinfo-" + exit.template.key).removeClass("selected");
  this.selectedExit = undefined;
};


// Get all universal exits plus all exits from the current state
Pointer.prototype.collectExits = function() {
  var pointer = this;

  var availableExits = this.map.exits.slice().concat(this.currentState.exits);
  // Also add any universal exits

  if (this.map.states.universal && this.map.states.universal.exits)
    availableExits = availableExits.concat(this.map.states.universal.exits);


  // Create analysis objects for the exits
  this.analyzedExits = availableExits.map(function(exit) {
    if (exit === undefined)
      console.warn("empty exit");

    // Make an object that watches this condition for changes
    var exitAnalysis = {

      isOpen: false,
      template: exit
    };


    exitAnalysis.conditions = exit.conditions.map(function(condition) {
      if (condition === undefined)
        console.warn("empty condition in " + inQuotes(exit.raw));
      return {
        template: condition,
        isFulfilled: false,
        manualOverride: undefined,
        exitAnalysis: exitAnalysis
      };
    });

    return exitAnalysis;
  });


  //ra01 this.stateView.exits.html("");

  // create views for the avaiable exits
  // ra01 - tolto questa funzione
  //this.exitViews = this.analyzedExits.map(function(exit) {

    // Add to the state view (on the blackboard)


    // exit.div = $("<div/>", {
    //   class: "mapinfo-exit mapinfo-" + exit.template.key,
    // }).appendTo(pointer.stateView.exits).click(function() {
    //   if (pointer.selectedExit === exit) {
    //     pointer.deselectExit(exit);
    //   } else {
    //     pointer.selectExit(exit);
    //   }
    // });

    // var exitName = $("<div/>", {
    //   class: "mapinfo-exitname",
    //   html: exit.template.target.raw
    // }).appendTo(exit.div);
    //
    // var conditions = $("<div/>", {
    //   class: "mapinfo-conditions",
    // }).appendTo(exit.div);


  //   $.each(exit.conditions, function(index, conditionAnalysis) {
  //
  //     if (conditionAnalysis.template) {
  //       conditionAnalysis.div = $("<div/>", {
  //         html: conditionAnalysis.template.raw,
  //         class: "mapinfo-condition mapinfo-" + conditionAnalysis.template.key,
  //       }).appendTo(conditions).click(function() {
  //         console.log("Clicked condition " + conditionAnalysis.template.raw);
  //         conditionAnalysis.manualOverride = !conditionAnalysis.manualOverride;
  //         updateCondition(conditionAnalysis, pointer);
  //       });
  //     }
  //   });
  //
  // });
};

Pointer.prototype.enterMap = async function(map, blackboard)  {
 
  var pointer = this; //ra01
  this.map = map;
  this.currentState = undefined;
  this.previusState = undefined;      //ra01 Salva lo stato precedente

  if (!map.grammar)
    map.grammar = {};
  this.grammar = tracery.createGrammar(map.grammar, true);
  this.grammar.modifiers.hiphopify = function(s) {
    if (Math.random() > .8) {
      s = s.replace(/s/g, "z")
    }
    return s.split(" ").map(function(s2) {
      if (Math.random() > .7) {
        return s2.split("").map(s3 => s3.toUpperCase() + ".").join("");
      } else {
        return s2;
      }
    }).join(" ");


  }

  //ra01 $("#panel-blackboard .panel-content").html("");
  //ra01 $("#panel-stateview .panel-content").html("");

  //ra01 this.view = $("<div/>", {
  //ra01   class: "mapinfo-view"
  //ra01 }).appendTo($("#panel-blackboard .panel-content"));


  // ra01
  // this.stateView = $("<div/>", {
  //   class: "mapinfo-stateview"
  // }).appendTo($("#panel-stateview .panel-content"));

  // this.stateView.state = $("<div/>", {
  //   class: "mapinfo-state"
  // }).appendTo(this.stateView);
  //
  // this.stateView.exits = $("<div/>", {
  //   class: "mapinfo-exits"
  // }).appendTo(this.stateView);
  //
  //
  // this.blackboardView = $("<div/>", {
  //   class: "mapinfo-bbview"
  // }).appendTo(this.view);

  if (blackboard)
     this.blackboard = blackboard;
  else
     //this.blackboard = new BBO(this.blackboardView);
     this.blackboard = new BBO();

  // load the blackboard
  this.blackboard.setFromPath([], map.initialBlackboard, map.blackboard);
  
  //ra01 this.goTo("origin");
  
};

// Funzione presa da io per l'emissione dell'output
Pointer.prototype.output = function (s, onFinishEach, onFinish) {
  var pointer = this;
  if (!Array.isArray(s)) {
    if (!isString(s)) {
      s = [s + ""];
    } else {
      s = s.split("\n");
    }
  }

  // remove any empty strings
  s = s.filter(function(s2) {
    return s2.trim().length > 0;
  });

  // for each section to say, add it to the queue
  // with handlers on what to do when its done outputting
  for (var i = 0; i < s.length; i++) {

    var s2 = {
      data: s[i],
    }
    if (i < s.length - 1) {
      s2.onFinish = onFinishEach;
    } else {
      if (onFinish)
        s2.onFinish = function() {
          onFinish();
          if (onFinishEach)
            onFinishEach();
        }
    }
    pointer.outputQueue.push(s2);
  }

  pointer.attemptOutput();
}
// Funzione presa da io per l'emissione dell'output
// Gets queued text and outputs it.
// This is called recursively
Pointer.prototype.attemptOutput = function() {
  var pointer = this;
  var section = pointer.outputQueue.shift();
  if (section && !pointer.isOccupied) {
    console.log(pointer.app.chatId + ': ' + section.data);
    // Save message on firebase
    _saveMessage(section.data, pointer);
    pointer.attemptOutput();
  }
  // ra01 cancello la parte sotto perché emetto l'output tutto in una volta
  //if (section && !pointer.isOccupied) {

    // Occupy this channel when in use
    //pointer.isOccupied = true;

    // Callback on text if text-only

    // Activate Chat with timer
    //ra01 tolto utilizzo della chat
    //chat.say(0, section.data);
    
   // bottery.sendMessage(section.data);

    // on finish
    // function outputDone() {
    //    if (section.onFinish)
    //      section.onFinish();
    //      pointer.isOccupied = false;
    //      pointer.attemptOutput();
    // }

    // ra01 L'outputMode solo testo ma non lascio il tempo di leggere
    // if (bottery.app.outputMode === "text") {
    //    var readTime = Math.sqrt(section.data.length) * 50 + 200;
    //    setTimeout(function() {
    //     outputDone();
    // }, readTime);
    //} else {
      // ** both text+speech & speech should trigger this??
    //  io.textToSpeech(section.data, function() {
    //    outputDone();
    //  });
    //}

    //io.debugLog("Ouput" + inParens(io.outputMode) + ":" + inQuotes(section.data));
  // } else {
  //   // push it back on the queue
  //   if (section !== undefined)
  //   pointer.outputQueue.unshift(section);
  // }
}

function updateExit(exitAnalysis, pointer) {

  var val = true;
  for (var i = 0; i < exitAnalysis.conditions.length; i++) {
    if (!exitAnalysis.conditions[i].isFulfilled)
      val = false;
  }
  if (val !== exitAnalysis.isOpen) {

    exitAnalysis.isOpen = val;
    //ra01 if (exitAnalysis.isOpen)
    //ra01   exitAnalysis.div.addClass("open");
    //ra01 else
    //ra01  exitAnalysis.div.removeClass("open");
  }


   //ra01 viz.setClassesIf(exitAnalysis.template, "open", exitAnalysis.isOpen);
}

function updateCondition(conditionAnalysis, pointer) {

  var val;
  if (conditionAnalysis.manualOverride)
    val = true;
  else {

    val = evaluateCondition(conditionAnalysis.template, pointer);
  }

  if (val !== conditionAnalysis.isFulfilled) {
    // A change has occured, update and notify

    // ra01 - non aggiorno
    // if (val)
    //   conditionAnalysis.div.addClass("open");
    // else
    //   conditionAnalysis.div.removeClass("open");
    //
    // if (conditionAnalysis.manualOverride)
    //   conditionAnalysis.div.addClass("override");
    // else
    //   conditionAnalysis.div.removeClass("override");

    conditionAnalysis.isFulfilled = val;
  }


  updateExit(conditionAnalysis.exitAnalysis, pointer);
}


// save message on firebase
function _saveMessage (message, pointer) {
  if (isString(message)) {
    pointer.reply.message.push(message);
    if (pointer.currentState.chips.length > 0)
      pointer.reply.chips = pointer.currentState.chips;
  }
  
}
module.exports = Pointer;
