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

/*
 * Chat functionality
 */

// ra01 - non utilizzata
// var labelEmoji = function() {
//   var start = 0;
//   var next = s.indexOf(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/, start)
//
// }

var chat = {
  bubbles: [],

  setChips: function(chips) {
    // var chat = this;
    // chat.chipRow.html("");
    // $.each(chips, function(index, chip) {
    //   var chipDiv = $("<div/>", {
    //     class: "chat-chip",
    //     html: chip.displayText,
    //   }).appendTo(chat.chipRow).click(function() {
    //     chat.say(1, chip.inputText);
    //     chat.clearChips();
    //   });
    //
    // });
    // chat.bubbleHolder.scrollTop(chat.bubbleHolder[0].scrollHeight);
  },

  clearChips: function() {
    //chat.chipRow.html("");
  },

  clear: function() {
    //chat.bubbleHolder.html("");
    //chat.clearChips();
  },

  say: function(who, s) {
    //console.log(who + ": " + s);
    chat.createBubble(who, s);


    //ra01 chat.bubbleHolder.scrollTop(chat.bubbleHolder[0].scrollHeight);

    // If human
    if (who === 1)
      io.input("chat", s);

      //ra01
    console.log(s);
    //app.sendMessage(s);
  },

  createBubble: function(who, s) {
    // var bubbleRow = $("<div/>", {
    //   class: "chat-bubblerow  chat-owner" + who,
    // }).appendTo(chat.bubbleHolder);
    //
    // var bubble = $("<div/>", {
    //   class: "chat-bubble",
    //   html: s,
    // }).appendTo(bubbleRow);
  }
}

// Esportazione dei moduli
module.exports = chat;
