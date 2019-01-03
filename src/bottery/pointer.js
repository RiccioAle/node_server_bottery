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
var tracery = require('./tracery.js').tracery; 
var inQuotes = require('./tracery.js').inQuotes;
var isString = require('./tracery.js').isString; 
var BBO = require('./blackboard.js').BBO;
var performAction = require('./map.js').performAction;
var evaluateCondition = require('./map.js').evaluateCondition; 
var evaluateExpression = require('./map.js').evaluateExpression; 
var parseMapPath = require('./map.js').parseMapPath;  

// Riceve l'id della chat
var Pointer = function(chatId, message, map) {
  
  this.chatId = chatId;
  this.message = message;
  this.map = map;
  this.numberUpdate = 0;    
  this.outputQueue = []; 
  
  this.reply = {
    chatId: chatId,
    message: [],
    chips: {}
  };

  this.exitCountdown = 0;
  this.inputLog = [];
  this.analyzedExits = [];
  
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
    pointer.numberUpdate++;


    if (this.selectedExit)
      this.useExit(this.selectedExit);


    this.updateExits();

    // recursive recall
    if (pointer.numberUpdate < 10 && (
      this.previusState === undefined ||
      this.previusState !== this.currentState)) {
      this.previusState = this.currentState;
      this.update();
    } else {
       // save the last state and blackboard 
       this.blackboard.children.INPUT = null;
       this.blackboard.children.INPUT_NUMBER = null;
       this.blackboard.value = null;
       console.log(this.blackboard);
       admin.database().ref(pointer.map.name+'/chats/'+this.chatId).update({
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
    // TODO ra01 set star IDENTIFICATOR
    if (useExit.template.actions[0] &&
      useExit.template.actions[0].expression.raw == 'STAR') {
      let input = this.get('INPUT').toUpperCase();
      let posAst = useExit.template.conditions[0].rule.indexOf("*");
      let prefix = useExit.template.conditions[0].rule.substring(0, posAst).toUpperCase();
      let suffix = useExit.template.conditions[0].rule.substring(posAst+1).toUpperCase();
      let star = input.replace(prefix, "");
      star = star.replace(suffix, "");
      this.set('STAR', star.toLowerCase());
    }
    // $.each(useExit.template.actions, function(index, action) {
    useExit.template.actions.forEach(function(action) {
      performAction(action, pointer);
    });



  }


  if (nextState) {

    this.currentState = nextState;
    if (this.currentState) {
      
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
  
  var pointer = this;

  //$.each(this.currentState.onEnter, function(index, action) {
  if (this.currentState.key != this.resumeState) {
    this.currentState.onEnter.forEach(function(action) {      
      performAction(action, pointer);
    });
  }
  this.resumeState = null;


  // Make chips
  if (this.currentState.chips) {
    debugger;
    if (isString(this.currentState.chips))
      this.currentState.chips = [this.currentState.chips];
    
    this.currentState.chips = this.currentState.chips.map(chip => pointer.flatten(chip));
    if (pointer.currentState.chips.length > 0)
        pointer.reply.chips = pointer.currentState.chips;
  }


  // Clear inputs before triggering any exits
  pointer.clearInput();

  this.collectExits();
};

Pointer.prototype.selectExit = function(exit) {

  this.selectedExit = exit;
  // don't wait
  //this.exitCountdown = Math.ceil(10 * Math.pow(app.exitPause, 2));
  this.exitCountdown = 0;

};

Pointer.prototype.deselectExit = function(exit) {
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


  
};

Pointer.prototype.enterMap = async function(map, blackboard)  {
 
  var pointer = this; 
  this.map = map;
  this.currentState = undefined;
  this.previusState = undefined;      //Save previus state

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

  if (blackboard)
     this.blackboard = blackboard;
  else
     this.blackboard = new BBO();

  // load the blackboard
  this.blackboard.setFromPath([], map.initialBlackboard, map.blackboard);
  
  
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
    console.log(pointer.chatId + ': ' + section.data);
    
    if (isString(section.data)) {
      pointer.reply.message.push(section.data);
    }
    pointer.attemptOutput();
  }

}

function updateExit(exitAnalysis, pointer) {

  var val = true;
  for (var i = 0; i < exitAnalysis.conditions.length; i++) {
    if (!exitAnalysis.conditions[i].isFulfilled)
      val = false;
  }
  if (val !== exitAnalysis.isOpen) {

    exitAnalysis.isOpen = val;
  
  }

}

function updateCondition(conditionAnalysis, pointer) {

  var val;
  if (conditionAnalysis.manualOverride)
    val = true;
  else {

    val = evaluateCondition(conditionAnalysis.template, pointer);
  }

  if (val !== conditionAnalysis.isFulfilled) {
    
    conditionAnalysis.isFulfilled = val;
  }


  updateExit(conditionAnalysis.exitAnalysis, pointer);
}

module.exports = Pointer;
