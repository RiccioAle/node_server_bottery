module.exports = {
  grammar: {
    previsione: ["Sereno", "Poco nuvoloso", "Nuvoloso", "Pioggia", "Termporale"],
  },
  states: {
    origin: {
      onEnterSay: "Benvenuto in MeteoBot",
      exits: "->scegli_citta",
    },
    scegli_citta: {
      onEnterSay: "Inserisci la città per la quale\n vuoi conoscere le previsioni meteo",
      exits: "'*' ->scegli_giorno citta=INPUT",
    },
    scegli_giorno: {
      onEnterSay: "Per quale giorno ti interessa sapere che tempo farà a #/citta#",
      chips: ["Oggi", "Domani", "Dopodomani", "Cambia città"],
      exits: [
        "'Oggi' ->cerca_previsione giorno=INPUT",
        "'Domani' ->cerca_previsione giorno=INPUT",
        "'Dopodomani' ->cerca_previsione giorno=INPUT",
        "'Cambia città' ->scegli_citta",
        "'*' ->scelta_errata",
      ],
    },

    scelta_errata: {
      onEnterSay: "\nSpiacente non ho capito.",
      exits: "->scegli_giorno",
    },

    cerca_previsione: {
      exits: ["(lista_citta[citta][giorno]!=undefined) ->comunica_meteo",
              "->calcola_previsione",]
    },

    calcola_previsione: {
      onEnter: "lista_citta[citta][giorno]='#previsione#'",
      exits: "->comunica_meteo",
    },

    comunica_meteo: {
      onEnter: "tempo=lista_citta[citta][giorno]",
      onEnterSay: ["#/giorno# a #/citta# il tempo sarà #/tempo#"],
      exits: "->scegli_giorno",
    },

  },

};
