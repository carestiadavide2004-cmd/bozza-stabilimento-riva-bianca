# Design — Riva Bianca

**Tipo:** stabilimento balneare + ristorante di pesce + pizza gourmet + eventi · **Zona:** Pescara · **Stato:** bozza demo

## Direzione
"La linea della riva": lusso mediterraneo sobrio e cinematografico. Bianco caldo e sabbia di giorno, blu abisso la sera, turchese solo come accento. Video a tutto schermo, titoli Bodoni grandi, tanto spazio.

## Font
- Titoli: Bodoni Moda (400, corsivo 400) — carattere italiano, grande e contrastato
- Testo: Jost (400, 500)

## Palette
| Ruolo | Hex |
|---|---|
| Sfondo (Bianco Riva) | #F8F6F1 |
| Superficie (Sabbia) | #E9DFCE |
| Linee (Duna) | #B9A182 |
| Scuro (Blu Abisso) | #0B2633 |
| Primario (Blu Adriatico) | #123F55 |
| Accento (Turchese) | #2FB5B0 (su chiaro: #0E7C78) |

## Firma visiva
L'onda della riva: nel logo RB, nell'intro, come linea che si disegna nel manifesto e come separatore nella fascia di testo. Più il tour a capitoli video (mare → spiaggia → terrazza → tramonto) e la mappa della spiaggia vista dall'alto per prenotare l'ombrellone.

## Animazioni
Livello 3 (GSAP + ScrollTrigger da cdnjs), SENZA scroll-jacking e senza Lenis; solo transform, opacity e clip-path. Effetti diversi per sezione (vedi js/scene.js): titoli lettera per lettera o riga per riga in maschera, foto da sinistra/destra alternate con zoom, tendine dall'alto/dal basso/diagonale, sipario dal centro, parallasse a più livelli nel ristorante, carte a ventaglio, linee che si disegnano, numeri che contano, foto della terrazza che si restringe in cornice, galleria orizzontale solo su computer. Tour: sezione sticky CSS con 4 video in dissolvenza incrociata, si carica/riproduce solo il capitolo visibile + il successivo. Telefono: durate ×0,7, parallasse ×0,4. Riduci movimento: solo dissolvenze brevi, tour con 4 foto statiche.

## Mappa ombrelloni
js/mappa.js; struttura e prezzi in config.js (RB.mappa). Disponibilità demo deterministica per data (hash). Pannello = dialog; su telefono zoom +/− e trascinamento solo dentro il riquadro.

## Menù e prenotazione tavolo (dal 30/10/2026, terza versione)
- Menù = "Libro del marinaio" (js/libro.js): copertina in tela blu con RB e bussola oro, pagine color carta con doppia riga da giornale di bordo, disegni a tratto (conchiglia, stella, onde, pesce, ancora, faro). Computer: doppia pagina per sezione, fogli 3D che girano sulla costola; telefono: una pagina per sezione. Segnalibri = nastri in alto. Riduci movimento: dissolvenza.
- Piantina tavoli (js/tavoli.js, dati in RB.tavoli): mare → In riva (4 tavoli romantici con candela) → passerella → Terrazza in legno → vetrate → Sala → Cucina e bar. Stessi stati e stesso zoom della mappa ombrelloni (window.rbMapKit in mappa.js).
- Video: un solo video in riproduzione alla volta (window.rbVideos in main.js, il tour si iscrive da scene.js). Codifica a fps originale, GOP 1 s, +faststart.
- Chi siamo: testo su pannello sabbia pieno, effetto lettura mai sotto opacità 0,7.

## Regole da non violare
- Dati solo in config.js.
- Barra in basso su telefono: figlia del body, sfondo pieno, nessuna animazione.
- Ricalcoli solo al cambio di larghezza (tastiera iPhone).
- Video sempre con versione verticale per telefono; niente zoom/blur sui video.
- Foto con lo stesso grading (saturazione -10%, alte luci calde).
