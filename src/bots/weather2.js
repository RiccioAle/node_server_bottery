module.exports = {
  grammar: {
    forecast: ["cloudless", "a little cloudy", "cloudy", "rain", "storm"],
  },
  states: {
    origin: {
      onEnterSay: "Wellcome in weatherBot",
      exits: "->choose_city",
    },
    choose_city: {
      onEnterSay: "Please, enter the city for which you want to know the weather forecast",
      exits: "'*' ->choose_day city=INPUT",
    },
    choose_day: {
      onEnterSay: "What do you want to know about #/city#?",
      chips: ["change city"],
      exits: [
        "'what is the weather *?' ->search_forecast day=STAR",
        "'how is the weather *?' ->search_forecast day=STAR",
        "'change city' ->choose_city",
        "'*' ->error_choose",
      ],
    },

    error_choose: {
      onEnterSay: "\nSorry, i don't understand.",
      exits: "->choose_day",
    },

    search_forecast: {
      exits: ["(list_city[city][day]!=undefined) ->send_forecast",
              "->ask_forecast",]
    },

    ask_forecast: {
      onEnter: "list_city[city][day]='#forecast#'",
      exits: "->send_forecast",
    },

    send_forecast: {
      onEnter: "weather=list_city[city][day]",
      onEnterSay: ["#/day# in #/city# the weather will be #/weather#"],
      exits: "->choose_day",
    },

  },

};
