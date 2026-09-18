# Komilfo Beauty & Aesthetic Studio — site static (HTML)

Varianta statică a site-ului, gata de publicat pe **GitHub Pages**. Nu are nevoie de server sau bază de date.

## Conținut

- `index.html` — pagina principală (tot site-ul)
- `style.css` — stilurile
- `booking.js` — calendarul de programări + trimiterea pe email
- `assets/` — logo, favicon și imaginile site-ului

## Cum îl pui pe GitHub Pages

1. Creează un repository nou pe GitHub (de exemplu `komilfo-site`).
2. Încarcă toate fișierele și folderul `assets/` în repository (butonul **Add file → Upload files**, sau `git push`).
3. În repository mergi la **Settings → Pages**.
4. La **Source** alege **Deploy from a branch**, branch-ul `main`, folderul `/ (root)`, apoi **Save**.
5. După 1–2 minute site-ul este live la adresa `https://<utilizatorul-tau>.github.io/komilfo-site/`.

## Cum funcționează programările

Formularul trimite fiecare programare pe email la **graphics.andreea@gmail.com** prin [FormSubmit](https://formsubmit.co) (gratuit, fără cont).

**Important — activare unică:** la prima programare trimisă vreodată, FormSubmit trimite un email de activare la graphics.andreea@gmail.com. Trebuie apăsat o singură dată butonul de confirmare din acel email; după aceea, toate programările ajung automat în inbox. Recomandarea: fă o programare de test chiar după publicare și confirmă activarea.

Emailul primit de salon conține: serviciu, dată, oră, durată, preț, nume, email și telefon client, note. Răspunzând direct la email (Reply), răspunsul ajunge la client (câmpul Reply-To e setat pe emailul clientului).

## Limitări față de varianta full-stack

- Nu există bază de date — programările ajung doar pe email, nu se salvează nicăieri pe site.
- Clientul nu primește email automat de confirmare (GitHub Pages nu poate trimite emailuri); salonul confirmă manual, prin reply sau telefon.
- Calendarul nu știe ce ore sunt deja ocupate — arată toate sloturile libere de regulă (Lun–Joi, 17:00–21:00); suprapunerile se rezolvă la confirmare.

## Modificări rapide

- **Lista serviciilor / prețuri / durate:** în `booking.js`, sus, în lista `SERVICES` (se reflectă automat și în secțiunea Services și în formular).
- **Emailul salonului:** în `booking.js`, constanta `STUDIO_EMAIL`.
- **Program (zile/ore):** în `booking.js`, `OPEN_DAYS`, `OPEN_HOUR`, `CLOSE_HOUR`, și în `index.html` la secțiunea Visit.
