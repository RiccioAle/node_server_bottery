module.exports = {
  states: {
    origin: {
      onEnterSay: "Benvenuto in Mastermind\nProva ad indovinare la sequenza di 4 cifre, ognuna delle quali può valere tra 1 e 6",
      exits: "->inizializza_gioco",
    },

    inizializza_gioco: {
      onEnterSay: "Ho calcolato una nuova combinazione",
      onEnter: ["tentativi=0", "val1=randomInt(1,7)", "val2=randomInt(1,7)", "val3=randomInt(1,7)", "val4=randomInt(1,7)"],
      exits: "->richiedi_input"
    },

    richiedi_input: {
      onEnterSay: "\nIndovina la combinazione",
      onEnter: "errore_input=0",
      exits: ["INPUT_NUMBER>6666 ->input_errato", "'*' ->controlla tentativo=INPUT"],
    },

    input_errato: {

        onEnterSay: "Il valore immesso non è valido",
        exits: "->richiedi_input",
    },

    // Find the two highest scores
    controlla: {
      onEnterFxn: function() {
        var pointer = this;
        var postoGiusto =0;
        var postoSbagliato =0;

        // recupero le variabili
        var val = [];
        val[0] = pointer.get("val1");
        val[1] = pointer.get("val2");
        val[2] = pointer.get("val3");
        val[3] = pointer.get("val4");
        var tentativo = pointer.get("tentativo");

        // Espressione regolare per accettare 4 cifre che vadano da 1 a 6
        var regExp = new RegExp("[1-6]{4}");

        if (!regExp.test(tentativo)) {
          pointer.set("errore_input", 1);

        } else {

          // Calcolo numeri al posto giusto e sbagliato
          for (var i=0; i<val.length; i++) {
            if (val[i]==tentativo[i]) {
              postoGiusto++;
              tentativo[i]=0;
              val[i]=0;
            } else {
              for (var k=0; k<val.length; k++) {
                if (val[k]!=tentativo[k] && val[k]==tentativo[i]) {
                  postoSbagliato++;
                  tentativo[i]=0;
                  val[k]=0;
                  break;
                }
              }
            }
          }
        }

        pointer.set("giusto", postoGiusto);
        pointer.set("sbagliato", postoSbagliato);
      },
      exits: ["giusto==4 ->risolto tentativi++", "errore_input ->input_errato", "->comunica tentativi++"]
    },

    comunica: {
      onEnterSay: "#/giusto# al posto giusto\n #/sbagliato# al posto sbagliato",
      exits: "->richiedi_input",
    },

    risolto: {
      onEnterSay: "Bravo hai indovinato con #/tentativi# tentativi!!",
      exits: ["->inizializza_gioco"],
    },


  },

  initialBlackboard: {
    giusto: 0,
    sbagliato: 0
  },

};
