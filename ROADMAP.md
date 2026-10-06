# Samen Thuis — opbouw in lagen

## Laag 1 — Achtergrond en frame (in deze testbasis aanwezig)
- Donkerblauwe achtergrond en rustige kleurverlopen.
- Sidebar op grote schermen, topbar en contentframe.
- Mobiele navigatie, veilige ondermarge en responsieve pagina-afstanden.

## Laag 2 — Design system (in deze testbasis aanwezig)
- Kleuren, typografie, spacing, afgeronde hoeken en schaduwen als centrale tokens.
- Primaire en secundaire knoppen, tekstvelden, kaarten, stat-blokken en feedbackmeldingen.
- Toegankelijke focus-states en ondersteuning voor reduced motion.

## Laag 3 — Navigatie en pagina-skeletten (in deze testbasis aanwezig)
- Vandaag, Agenda, Taken, Challenges, Weekmenu, Boodschappen, Voorraad, Woning, Budget, Date ideeën, Reizen, Extra en Instellingen.
- De nog niet gebouwde pagina's zijn duidelijk gemarkeerd als skelet.

## Laag 4 — Functies per pagina (volgende stappen)
1. Vandaag: slim dagoverzicht, focus, taken en snel toevoegen.
2. Taken en Huishouden: eerst de bestaande v16-flexibele frequenties en voltooiingslogica analyseren en daarna integreren.
3. Agenda: weekoverzicht en Kees/Daphne/Samen.
4. Challenges: universele doelen, dagelijkse vinkjes, streaks, punten en beloningen.
5. Weekmenu, boodschappen en voorraad: koppelingen en gedeelde data.
6. Budget, woning, reizen, date ideeën en documentenkluis.
7. Zoeken, herinneringen, export/import en kwaliteitscontrole.

## Laag 5 — Gegevens en privacy
- Local-first blijven als uitgangspunt.
- Gegevensschema en migraties documenteren.
- Export/import en herstel testen vóór eventuele synchronisatie.
- Geen Supabase-afhankelijkheid in deze testbranch.

## Laag 6 — Testen en releasen
- Desktop, iPad en iPhone controleren.
- Lege toestand, invoerfouten, verwijderen en verversen testen.
- Opslag na refresh controleren.
- Consolefouten en toegankelijkheid nalopen.
- Pas na akkoord functies naar een andere branch/repository overzetten.
