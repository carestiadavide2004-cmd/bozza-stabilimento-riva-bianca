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
L'onda della riva: nel logo RB, nell'intro, come linea che si disegna nel manifesto e come separatore nella fascia di testo. Più il tour fotogramma per fotogramma (mare → spiaggia → terrazza → tramonto).

## Animazioni
Livello 3 (GSAP + ScrollTrigger da cdnjs), SENZA scroll-jacking e senza Lenis. Titoli riga per riga, foto a tendina + parallasse, video spiaggia che si allarga, numeri che contano, fascia lenta, tour su canvas (sticky CSS). Riduci movimento: niente video automatici, niente parallasse, tour con 4 foto statiche.

## Regole da non violare
- Dati solo in config.js.
- Barra in basso su telefono: figlia del body, sfondo pieno, nessuna animazione.
- Ricalcoli solo al cambio di larghezza (tastiera iPhone).
- Video sempre con versione verticale per telefono; niente zoom/blur sui video.
- Foto con lo stesso grading (saturazione -10%, alte luci calde).
