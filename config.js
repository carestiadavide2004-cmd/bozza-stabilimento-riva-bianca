/* =========================================================
   RIVA BIANCA — DATI DEL SITO
   Per un cliente vero cambia SOLO questo file.
   Tutti i dati qui sotto sono SEGNAPOSTO DI ESEMPIO.
   ========================================================= */
window.RB = {
  nome: "Riva Bianca",
  slogan: "Stabilimento balneare e ristorante di mare a Pescara",
  url: "https://carestiadavide2004-cmd.github.io/bozza-stabilimento-riva-bianca/",

  indirizzo: {
    via: "Lungomare Esempio 1",
    cap: "65122",
    citta: "Pescara",
    provincia: "PE",
    // testo usato per Google Maps
    mappa: "Lungomare Matteotti, Pescara"
  },

  telefono: { testo: "085 000 0000", link: "+390850000000" },
  whatsapp: "393330000000",            // solo cifre, con prefisso 39
  email: "info@rivabianca.example",

  social: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    tiktok: "https://www.tiktok.com/"
  },

  // Chiave pubblica Web3Forms (web3forms.com). Vuota = moduli in modalità demo.
  // È una chiave pubblica di invio, non una password: va bene tenerla qui.
  web3formsKey: "",

  // Fuso orario usato per "Aperto ora / Chiuso" e per le date dei moduli
  fusoOrario: "Europe/Rome",

  orari: {
    // Ristorante aperto tutto l'anno. Giorni: 0 = domenica … 6 = sabato
    ristorante: {
      giorniChiusura: [2],                 // martedì
      fasce: [
        { nome: "Pranzo", da: "12:30", a: "15:00" },
        { nome: "Cena",   da: "19:30", a: "23:30" }
      ]
    },
    spiaggia: { da: "08:30", a: "19:30" }
  },

  // Stagione balneare (mese-giorno)
  stagione: { inizio: "05-01", fine: "09-30" },

  // Orari prenotabili per il tavolo (l'ultimo ingresso è prima della chiusura)
  turni: {
    Pranzo: ["12:30", "13:00", "13:30", "14:00"],
    Cena:   ["19:30", "20:00", "20:30", "21:00", "21:30", "22:00"]
  },

  numeri: [
    { valore: 300, unita: "m",  testo: "di spiaggia sulla riva" },
    { valore: 120, unita: "",   testo: "coperti in terrazza sul mare" },
    { valore: 25,  unita: "",   testo: "anni di cucina di mare" },
    { valore: 60,  unita: "",   testo: "eventi privati all'anno" }
  ],

  chef: {
    nome: "Andrea Marini",
    citazione: "Il mare decide il menù. Io scelgo come non rovinarlo."
  },

  servizi: [
    { icona: "doccia",  nome: "Docce calde",          testo: "Cabine in legno e docce calde fino alla chiusura." },
    { icona: "bar",     nome: "Bar in spiaggia",      testo: "Caffè, centrifughe e aperitivo dalle 8:30." },
    { icona: "vassoio", nome: "Servizio al lettino",  testo: "Ordini dal lettino, ti portiamo tutto in riva." },
    { icona: "wifi",    nome: "Wi-Fi gratuito",       testo: "Copertura su tutta la spiaggia." },
    { icona: "telo",    nome: "Teli in cotone",       testo: "Teli puliti ogni giorno, inclusi nel prezzo." }
  ],

  // Prezzi per 1 ombrellone + 2 lettini
  listino: [
    { nome: "Giornaliero", nota: "dall'apertura al tramonto",
      righe: [["Prima fila", "45 €"], ["Seconda fila", "38 €"], ["Dalla terza fila", "30 €"]] },
    { nome: "Settimanale", nota: "7 giorni consecutivi",
      righe: [["Prima fila", "260 €"], ["Seconda fila", "220 €"], ["Dalla terza fila", "180 €"]] },
    { nome: "Stagionale", nota: "dal 1 maggio al 30 settembre",
      righe: [["Prima fila", "1.900 €"], ["Seconda fila", "1.600 €"], ["Dalla terza fila", "1.300 €"]] }
  ],

  // Mappa della spiaggia per "Prenota l'ombrellone".
  // Le file vanno dal mare (fila 1) verso il bar. "passerella" = dopo quale ombrellone
  // passa il corridoio centrale. Prezzi al giorno, in euro.
  mappa: {
    ombrelloniPerFila: 12,
    passerella: 6,
    file: [
      { fila: 1, prezzo: 45 },
      { fila: 2, prezzo: 38 },
      { fila: 3, prezzo: 30 },
      { fila: 4, prezzo: 30 },
      { fila: 5, prezzo: 30 }
    ],
    // Postazioni speciali dietro l'ultima fila. "colonna" va da 1 a 12 come gli ombrelloni
    // (si possono usare i decimali per stare a metà tra due colonne).
    speciali: [
      { tipo: "palma", numero: 1, colonna: 1.4 },
      { tipo: "palma", numero: 2, colonna: 3 },
      { tipo: "gazebo", numero: 1, colonna: 5 },
      { tipo: "gazebo", numero: 2, colonna: 8 },
      { tipo: "palma", numero: 3, colonna: 10 },
      { tipo: "palma", numero: 4, colonna: 11.6 }
    ],
    tipi: {
      ombrellone: { nome: "Ombrellone", comprende: ["1 ombrellone", "2 lettini", "1 tavolino"] },
      palma: { nome: "Palma", prezzo: 70, comprende: ["l'ombra di una palma", "2 lettini", "1 sdraio", "1 tavolino", "zona più riservata"] },
      gazebo: { nome: "Gazebo", prezzo: 140, comprende: ["gazebo in legno con tende", "4 lettini", "1 divanetto", "servizio al posto"] }
    },
    // Solo per la demo: quota di posti occupati (i posti cambiano con la data, ma sono sempre uguali per la stessa data)
    occupatiDemo: 0.34
  },

  // Menù: ogni sezione è una doppia pagina del "libro di bordo"; nota = frase sotto il titolo
  menu: [
    { id: "crudi", nome: "Crudi e ostriche", nota: "Aperti al banco con il pescato della mattina.", piatti: [
      ["Crudo dell'Adriatico", "Scampi, mazzancolle, tartare di tonno e carpaccio del giorno", "38"],
      ["Ostrica Gillardeau n. 2", "Al pezzo, con limone e mignonette allo scalogno", "6"],
      ["Tartare di tonno", "Stracciatella, limone candito e capperi di Pantelleria", "22"],
      ["Carpaccio di ricciola", "Agrumi, finocchietto selvatico e olio nuovo", "20"],
      ["Scampi crudi", "Quattro pezzi, sale Maldon e lime", "24"],
      ["Ostrica Fine de Claire", "Al pezzo", "4"]
    ]},
    { id: "antipasti", nome: "Antipasti", nota: "Per cominciare, da dividere al centro del tavolo.", piatti: [
      ["Polpo arrosto", "Crema di patate affumicate e olive intosso", "18"],
      ["Alici marinate", "Limone di Sorrento, mentuccia e pane tostato", "14"],
      ["Cozze e vongole in guazzetto", "Pomodorino, aglio dolce e pane bruscato", "16"],
      ["Calamaretti spillo fritti", "Maionese al lime", "17"],
      ["Fiori di zucca", "Ripieni di baccalà mantecato", "15"],
      ["Insalata di mare tiepida", "Sedano, patate e prezzemolo", "18"]
    ]},
    { id: "primi", nome: "Primi di mare", nota: "Pasta trafilata al bronzo e sughi di mare.", piatti: [
      ["Spaghetti alle vongole veraci", "Bottarga di muggine e limone", "22"],
      ["Chitarra all'astice blu", "Pomodorino del piennolo e basilico", "32"],
      ["Paccheri con lo scorfano", "Pomodorini confit e olive taggiasche", "24"],
      ["Tagliolini ai ricci di mare", "Solo in stagione", "28"],
      ["Linguine allo scoglio", "Cozze, vongole, gamberi e calamari", "24"],
      ["Risotto ai frutti di mare", "Minimo due persone, al cucchiaio", "22"]
    ]},
    { id: "secondi", nome: "Secondi", nota: "Il pescato del giorno, intero o in trancio.", piatti: [
      ["Brodetto alla pescarese", "Pescato del giorno, peperone dolce e pane", "34"],
      ["Rombo al forno", "Patate, olive e pomodorini", "32"],
      ["Pescato del giorno alla griglia", "All'etto, chiedi al personale", "7 / hg"],
      ["Frittura dell'Adriatico", "Paranza, calamari e mazzancolle", "24"],
      ["Trancio di ricciola", "Caponata di verdure e basilico", "28"],
      ["Grigliata mista", "Scampi, calamaro, gamberi e pesce del giorno", "36"]
    ]},
    { id: "pizze", nome: "Pizze gourmet", nota: "Impasto a 72 ore, cotta nel forno a legna.", piatti: [
      ["Margherita di Riva", "San Marzano DOP, fiordilatte di Agerola, basilico", "11"],
      ["Cruda di mare", "Base bianca, stracciatella, tartare di gambero e lime aggiunti a crudo", "22"],
      ["Ventricina e miele", "Fiordilatte, ventricina vastese e miele di castagno", "16"],
      ["Pomodoro giallo e burrata", "Pomodorino giallo del piennolo, burrata, basilico", "15"],
      ["Alici e scarola", "Fiordilatte, scarola ripassata, alici del Cantabrico, olive", "16"],
      ["Mortadella e pistacchio", "Fiordilatte, mortadella IGP, stracciatella, pistacchio", "17"]
    ]},
    { id: "dolci", nome: "Dolci", nota: "Fatti in casa, ogni mattina.", piatti: [
      ["Semifreddo al parrozzo", "Cioccolato fondente e mandorle tostate", "9"],
      ["Tiramisù espresso", "Preparato al momento", "8"],
      ["Babà al rum", "Crema chantilly e frutti rossi", "9"],
      ["Sorbetto al limone", "Limone e basilico", "6"],
      ["Crostata di stagione", "Frutta fresca e crema pasticcera", "8"]
    ]},
    { id: "bere", nome: "Cocktail e vini", nota: "Aperitivo al tramonto e vini d'Abruzzo.", piatti: [
      ["Spritz Riva", "Bitter, prosecco e soda alla pesca bianca", "10"],
      ["Negroni", "Classico, con arancia", "11"],
      ["Gin tonic al rosmarino", "Gin italiano e tonica secca", "12"],
      ["Pecorino d'Abruzzo", "Al calice", "7"],
      ["Cerasuolo d'Abruzzo", "Al calice", "7"],
      ["Trebbiano d'Abruzzo", "Al calice", "7"],
      ["Franciacorta Brut", "Al calice", "10"]
    ]}
  ],

  // Piantina dei tavoli: zone dal mare verso la sala. Ogni fila elenca i posti dei tavoli
  // (2, 4 o 6); un tavolo con nome è un oggetto { nome, posti, romantico }.
  tavoli: {
    zone: [
      { id: "riva", nome: "In riva al mare", nota: "Sulla sabbia, a pochi passi dall'acqua", file: [[
        { nome: "Tavolo Conchiglia", posti: 2, romantico: true },
        { nome: "Tavolo Faro", posti: 2, romantico: true },
        { nome: "Tavolo Stella Marina", posti: 2, romantico: true },
        { nome: "Tavolo Tramonto", posti: 2, romantico: true }
      ]] },
      { id: "terrazza", nome: "Terrazza", nota: "All'aperto, sul pontile con vista mare", file: [
        [2, 4, 4, 4, 4, 2],
        [4, 6, 6, 4],
        [2, 4, 4, 4, 4, 2]
      ] },
      { id: "sala", nome: "Sala", nota: "Al coperto, con le vetrate sul mare", file: [
        [4, 4, 4, 4, 4],
        [2, 6, 6, 2]
      ] }
    ],
    occupatiDemo: 0.32   // quota di tavoli occupati nella demo (casuale ma fissa per data e fascia)
  },

  // foto: [nome file senza misura, larghezza piccola, larghezza grande]
  eventi: [
    { titolo: "Matrimoni in spiaggia", testo: "Rito in riva, cena in terrazza e taglio della torta al tramonto. Fino a 180 ospiti.", foto: ["ev-matrimoni", 640, 1200] },
    { titolo: "Lauree", testo: "Aperitivo con crudi e bollicine o cena riservata per famiglia e amici.", foto: ["ev-lauree", 640, 1200] },
    { titolo: "Compleanni", testo: "Una tavolata sulla sabbia, il menù lo scegliamo insieme.", foto: ["ev-compleanni", 640, 1200] },
    { titolo: "Eventi aziendali", testo: "Cene di gala, presentazioni e giornate di team building sul mare.", foto: ["ev-aziendali", 800, 1600] },
    { titolo: "Aperitivo al tramonto", testo: "Ogni mercoledì dalle 18:30, con crudi al banco.", foto: ["ev-aperitivo", 640, 1200] },
    { titolo: "Cena con musica dal vivo", testo: "Il venerdì sera: sax, voce e chitarra in terrazza.", foto: ["ev-live", 800, 1600] },
    { titolo: "DJ set", testo: "Il sabato dal tramonto a mezzanotte, a volume da conversazione.", foto: ["ev-dj", 800, 1600] }
  ],

  serate: [
    { giorno: "Mercoledì", titolo: "Aperitivo al tramonto", ora: "18:30 – 21:00" },
    { giorno: "Giovedì",   titolo: "Crudo e bollicine",     ora: "19:30 – 23:00" },
    { giorno: "Venerdì",   titolo: "Cena con musica dal vivo", ora: "21:00 – 23:30" },
    { giorno: "Sabato",    titolo: "DJ set al tramonto",    ora: "19:00 – 24:00" },
    { giorno: "Domenica",  titolo: "Pranzo lungo in riva",  ora: "12:30 – 16:00" }
  ],

  recensioni: [
    { testo: "Abbiamo prenotato in prima fila per una settimana: ombrelloni distanziati, personale attento e un crudo che a pranzo ci ha fatto dimenticare il lettino.", nome: "Giulia R.", origine: "Recensione di esempio" },
    { testo: "La chitarra all'astice vale il viaggio. La sera, con la musica dal vivo in terrazza, sembra di essere da un'altra parte.", nome: "Marco D.", origine: "Recensione di esempio" },
    { testo: "Ci siamo sposati in riva al mare: hanno pensato a tutto loro, dal rito al buffet di dolci. Gli ospiti ne parlano ancora.", nome: "Elena e Paolo", origine: "Recensione di esempio" },
    { testo: "Pizza leggerissima, impasto profumato. Il pomodoro giallo con la burrata è da ordinare due volte.", nome: "Luca P.", origine: "Recensione di esempio" }
  ],

  faq: [
    ["Come prenoto un tavolo o un ombrellone?", "Dai moduli di questa pagina, su WhatsApp o per telefono. Ti confermiamo la prenotazione entro poche ore."],
    ["C'è un parcheggio?", "Sì, il parcheggio convenzionato è a 100 metri sul lungomare. Per chi pranza o cena la sosta è gratuita per tre ore."],
    ["Posso portare il mio cane?", "In terrazza sono benvenuti i cani di piccola e media taglia, al guinzaglio. In spiaggia segue le regole dell'ordinanza comunale."],
    ["Avete piatti senza glutine?", "Sì: pasta e pizza senza glutine preparate in un'area separata. Segnalalo nella prenotazione e al personale."],
    ["Organizzate eventi privati?", "Matrimoni, lauree, compleanni ed eventi aziendali, fino a 180 ospiti. Compila la richiesta di preventivo nella sezione Eventi."],
    ["Quando è aperta la spiaggia?", "Dal 1 maggio al 30 settembre, tutti i giorni dalle 8:30 alle 19:30."],
    ["Il ristorante è aperto tutto l'anno?", "Sì, a pranzo dalle 12:30 alle 15:00 e a cena dalle 19:30 alle 23:30. Chiuso il martedì."],
    ["La spiaggia è accessibile in carrozzina?", "Sì: passerella fino alla riva, bagno e doccia accessibili e una sedia da mare su richiesta."]
  ]
};
