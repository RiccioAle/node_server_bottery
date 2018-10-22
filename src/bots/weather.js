module.exports = {
  grammar: {
    forecast: ["fair", "a little cloudy", "cloudy", "rain", "storm"],
  },
  states: {
    origin: {
      onEnterSay: "Wellcome in WeatherBot",
      exits: "->choose_city",
    },
    choose_city: {
      onEnterSay: "Please, enter the city for which you want to know the weather forecast",
      exits: "'*' ->choose_day city=INPUT",
    },
    choose_day: {
      onEnterSay: "Please, choose the day for which you want to know the weather",
      chips: ["today", "tomorrow", "day after tomorrow", "change city"],
      exits: [
        "'today' ->search_forecast day=INPUT",
        "'tomorrow' ->search_forecast day=INPUT",
        "'day after tomorrow' ->search_forecast day=INPUT",
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
