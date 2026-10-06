# Samen Thuis — technische keuzes na uitvoering van de AI-prompt

## 1. Real-time synchronisatie

Niet opgenomen in deze standalone testversie. De huidige data-laag is bewust local-first via `localStorage`. Als gedeelde apparaten later nodig zijn, voeg een synchronisatielaag toe bovenop de bestaande state-functies (`loadState`, `saveState`) in plaats van UI-code aan een database te koppelen.

Aanpak voor een volgende fase:
1. Geef elk record een stabiele `id`, `updatedAt` en eventueel `deletedAt`.
2. Gebruik een remote datastore als tweede bron naast de lokale cache.
3. Synchroniseer op recordniveau en los conflicten op met een expliciete strategie.
4. Houd export/import altijd beschikbaar als herstelmechanisme.

## 2. Mobiele wrapper

Voor de huidige vanilla-app is een lichte WebView/PWA-route logischer dan de hele interface opnieuw schrijven in React Native of Flutter. De UI is al responsive en gebruikt geen framework-afhankelijke componenten. Een wrapper kan later worden gekozen wanneer native push, background tasks of App Store/Play Store distributie daadwerkelijk nodig zijn.

## 3. Pushnotificaties

De instelling `notifications` in de testversie is alleen een lokale voorkeur; er wordt bewust geen pushservice gesimuleerd. Echte push vereist een service worker + browser/device permission en voor betrouwbare servergestuurde notificaties een backend of pushprovider.

## 4. Export/backup

De app ondersteunt JSON export en import. Het volledige state-object wordt geëxporteerd, inclusief taken, challenges, menu, boodschappen, voorraad, woning, budget, reizen, ideeën en historie. Dit is bewust een transparant formaat dat later gemigreerd kan worden.

## 5. Databasekeuze

Voor de huidige use-case is localStorage voldoende als testopslag. Voor een echte gedeelde productie-app is een relationele datastore of documentdatabase met authenticatie en realtime subscriptions nodig. De keuze moet pas worden gemaakt nadat het definitieve gegevensmodel en de gewenste multi-device synchronisatie zijn vastgesteld. De aangeleverde prompt geeft onvoldoende informatie om één database als definitief beste keuze te verklaren.
