# Samen Thuis — standalone test v2

Zelfstandige, frameworkloze local-first testversie van Samen Thuis. Local-first; synchronisatie via Supabase is optioneel en staat standaard uit (Instellingen: project-URL, publishable/anon key en huishoudcode, lokaal bewaard en versleuteld verstuurd). Weer heeft een eigen pagina (Open-Meteo) en de quote komt van de BrainyQuote RSS met lokale cache. Geen externe JavaScript-bibliotheken. Het dashboard (Vandaag) is volledig samen te stellen via Instellingen (aan/uit en volgorde, lokaal bewaard). De Weer-pagina toont een 7-daagse en een uurgrafiek met temperatuur en neerslag.

## Wat is nu uitgevoerd

- Vandaag met focus, slimme taakweergave en weekmenu-preview.
- Universele taken met persoon, categorie, datum, afvinken/verwijderen en drag-and-drop.
- Agenda met Kees/Daphne/Samen.
- Universele Challenges met categorie, voortgang, punten en voltooiing; dus niet alleen huishouden.
- Weekmenu, boodschappen en voorraad als echte lokale modules.
- Woning met flexibele frequentietekst in plaats van vaste weekdag.
- Budget met maandlimiet, uitgaven en voortgangsbalk.
- Date ideeën, Reizen en Extra/notities.
- Instellingen met licht/donker thema, lokale notificatievoorkeur en JSON export/import.
- Responsive desktop/iPad/iPhone UI met mobiele ondernavigatie.
- Visuele feedback/toasts, touchvriendelijke controls, focus states en reduced-motion ondersteuning uit de bestaande basis.

## Bewust nog niet uitgevoerd

De oorspronkelijke prompt noemt real-time synchronisatie, pushnotificaties, mobiele wrappers en databasekeuze als vragen. Omdat deze testversie expliciet local-first en zonder externe afhankelijkheden moet blijven, zijn die onderdelen hier niet als externe service ingebouwd. De lokale JSON backup is wel volledig bruikbaar als fundament voor een latere migratie.

De specifieke v16-logica voor flexibele taakfrequenties was niet aanwezig in de aangeleverde v3-code. Deze versie bootst die logica daarom niet stilzwijgend na; de taakstructuur is voorbereid met datum/persoon/categorie zodat de v16-regels later gecontroleerd kunnen worden geïntegreerd.

## Testen

Open `index.html` of publiceer de repository via GitHub Pages. Voor PWA-gedrag is een HTTPS-hosting zoals GitHub Pages beter dan `file://`.

Lokale data staat onder `samenThuisV2` in localStorage. Via Instellingen kan JSON worden geëxporteerd en geïmporteerd.

## Uitbreidingen (oktober 2026)
- **Acties & aanbiedingen:** handmatig winkel, actieprijs en geldigheidsdatum invoeren; matches met open boodschappen tonen op Vandaag; product aan boodschappenlijst toevoegen. Automatische retailerfeeds en meldingen zijn nog niet gekoppeld.
- **Schoonmaken, punten & streaks:** challenges hebben check-ins per dag en een 7-daags afvinkoverzicht met streaktelling. Punten worden als challenge-beloning bijgehouden.
- **Programma's:** eigen programma's met afvinkbare stappen; JSON-import ondersteunt een object met `title`, optioneel `category`, en `steps` als strings of objecten met `text`/`title` en optioneel `done`. Importeer alleen bestanden/content die je mag gebruiken.
- **Weer:** actuele gegevens, gevoelstemperatuur, uurlijkse en 7-daagse verwachting, neerslagkans/hoeveelheid, wind, luchtvochtigheid, UV, zicht en zonsondergang/-opkomst via Open-Meteo. Vereist internet; geolocatie is optioneel en na browsertoestemming. Bij fouten toont de app geen verzonnen voorspelling.
