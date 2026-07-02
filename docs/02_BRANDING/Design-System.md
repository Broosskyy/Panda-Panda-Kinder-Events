# Design-System — Panda-Bande Kinderevents

> **Quelle:** Website-Mockup (Landing Page)  
> **Status:** Finalisiert als visuelle Referenz — noch nicht implementiert  
> **Letzte Aktualisierung:** Juli 2026

Dieses Dokument beschreibt das vollständige Design-System, abgeleitet aus dem genehmigten Mockup. Es dient als verbindliche Referenz für alle zukünftigen UI-Entscheidungen.

---

## 1. Mockup-Analyse

### 1.1 Gesamteindruck

Das Mockup zeigt eine **einspaltige Landing Page** mit klarer Sektionsstruktur. Der Stil verbindet **professionelle Vertrauenswürdigkeit** mit **warmherziger Kindlichkeit**:

- Naturnahe, gedämpfte Farbpalette (Olivgrün statt knalliges Grün)
- Elegante Serif-Überschriften für Seriosität
- Organische Formen (Blob-Masken, abgerundete Karten) für Verspieltheit
- Viel Weißraum und klare visuelle Hierarchie
- Dünne Line-Art-Icons statt ausgefüllter Illustrationen

**Designrichtung:** *Warm Professional Playful* — vertrauenswürdig für Eltern, einladend für Kinder.

### 1.2 Seitenstruktur (Top → Bottom)

| # | Sektion | Hintergrund | Beschreibung |
|---|---------|-------------|--------------|
| 1 | **Header** | Off-White | Logo links, Navigation zentriert, CTA rechts |
| 2 | **Hero** | Off-White | Zweispaltig: Text + CTAs links, Blob-Bild rechts, Team-Karte überlappend |
| 3 | **Trust Bar** | Off-White | 4 Vertrauens-Icons in einer Reihe unter dem Hero |
| 4 | **Leistungen** | Off-White | Überschrift mit Trennlinie, 4×2-Kartenraster |
| 5 | **Ablauf / Prozess** | Off-White | 5-Schritte-Flow mit Panda-Illustration |
| 6 | **Galerie** | Off-White | 5-spaltige Bilderreihe mit abgerundeten Ecken |
| 7 | **Testimonials** | Off-White | 3-Karten-Slider mit Sternebewertung |
| 8 | **FAQ** | Light Beige | Accordion-Fragen mit Plus-Icons |
| 9 | **Kontakt / Footer** | Light Beige + Olive Footer | Zweispaltig: Formular links, Kontakt + Logo rechts |
| — | **WhatsApp FAB** | — | Schwebender Button unten rechts |

### 1.3 Sektions-Trenner

Zwischen den Hauptsektionen erscheint ein wiederkehrendes Element:

```
────────────── ♥ Sektionsüberschrift ♥ ──────────────
```

- Horizontale Linie über die volle Content-Breite
- In der Mitte: kleines Herz-Icon + Sektionsüberschrift
- Dezente, dünne Linie in einem hellen Grauton
- Schafft Rhythmus und Orientierung auf der langen Landing Page

---

## 2. Farbsystem

### 2.1 Primärfarben

| Token | Name | Hex | RGB | Verwendung |
|-------|------|-----|-----|------------|
| `--color-primary` | Olivgrün | `#555D42` | 85, 93, 66 | Primär-Buttons, aktive Icons, Footer-Hintergrund, WhatsApp-FAB |
| `--color-primary-hover` | Olivgrün Dunkel | `#454D35` | 69, 77, 53 | Button-Hover, aktive Zustände |
| `--color-primary-light` | Olivgrün Hell | `#6B7455` | 107, 116, 85 | Sekundäre Akzente, Icon-Hintergründe |

### 2.2 Hintergrundfarben

| Token | Name | Hex | RGB | Verwendung |
|-------|------|-----|-----|------------|
| `--color-bg-primary` | Warm-Weiß | `#FDFCF9` | 253, 252, 249 | Haupthintergrund der Seite |
| `--color-bg-secondary` | Hell-Beige | `#F4F1EA` | 244, 241, 234 | FAQ-Sektion, Kontaktbereich, abwechselnde Sektionen |
| `--color-bg-card` | Rein-Weiß | `#FFFFFF` | 255, 255, 255 | Karten, Formularfelder, Testimonial-Karten |
| `--color-bg-footer` | Olivgrün | `#555D42` | 85, 93, 66 | Footer-Hintergrund (identisch mit Primary) |

### 2.3 Textfarben

| Token | Name | Hex | RGB | Verwendung |
|-------|------|-----|-----|------------|
| `--color-text-primary` | Anthrazit | `#2C2C2C` | 44, 44, 44 | Überschriften (H1–H3) |
| `--color-text-secondary` | Charcoal | `#4A4A4A` | 74, 74, 74 | Fließtext, Beschreibungen |
| `--color-text-muted` | Mittelgrau | `#7A7A7A` | 122, 122, 122 | Hilfstexte, Platzhalter, Metadaten |
| `--color-text-inverse` | Weiß | `#FFFFFF` | 255, 255, 255 | Text auf dunklem Hintergrund (Buttons, Footer) |
| `--color-text-accent` | Olivgrün | `#555D42` | 85, 93, 66 | Links, aktive Navigation |

### 2.4 Akzentfarben

| Token | Name | Hex | RGB | Verwendung |
|-------|------|-----|-----|------------|
| `--color-accent-gold` | Gold | `#E8B84A` | 232, 184, 74 | Sternebewertungen in Testimonials |
| `--color-accent-heart` | Herz-Rot | `#C45C5C` | 196, 92, 92 | Herz-Icon in Sektions-Trennern (dezent) |

### 2.5 Rahmen- und Linienfarben

| Token | Name | Hex | RGB | Verwendung |
|-------|------|-----|-----|------------|
| `--color-border` | Hellgrau | `#E5E2DB` | 229, 226, 219 | Input-Rahmen, Karten-Ränder, Sektions-Trennlinien |
| `--color-border-focus` | Olivgrün | `#555D42` | 85, 93, 66 | Fokus-Zustand bei Formularfeldern |
| `--color-divider` | Sehr Hellgrau | `#EDEAE4` | 237, 234, 228 | Horizontale Trennlinien |

### 2.6 Farbverwendung nach Kontext

```
Seitenhintergrund     →  #FDFCF9 (Warm-Weiß)
Abwechselnde Sektion   →  #F4F1EA (Hell-Beige)
Karten & Inputs        →  #FFFFFF (Rein-Weiß)
Primäre Aktion         →  #555D42 (Olivgrün) + weißer Text
Sekundäre Aktion       →  #FFFFFF + #2C2C2C Rahmen
Footer                 →  #555D42 (Olivgrün) + weißer Text
Sterne                 →  #E8B84A (Gold)
```

### 2.7 Kontrastverhältnisse (Barrierefreiheit)

| Kombination | Verhältnis | WCAG AA |
|-------------|------------|---------|
| Anthrazit auf Warm-Weiß | ~14:1 | ✅ |
| Charcoal auf Warm-Weiß | ~9:1 | ✅ |
| Weiß auf Olivgrün | ~6.5:1 | ✅ |
| Mittelgrau auf Warm-Weiß | ~4.6:1 | ✅ (großer Text) |

---

## 3. Typografie

### 3.1 Schriftfamilien

| Token | Schriftart | Fallback | Rolle |
|-------|------------|----------|-------|
| `--font-heading` | **Playfair Display** | Georgia, serif | H1, H2, H3 — elegant, etabliert |
| `--font-body` | **Montserrat** | Inter, sans-serif | Fließtext, Navigation, Labels, Buttons |
| `--font-accent` | **Caveat** oder **Dancing Script** | cursive | Dekorative Unterzeilen, Handschrift-Akzente |

### 3.2 Schriftgrößen-Skala

| Token | Größe | Line-Height | Letter-Spacing | Verwendung |
|-------|-------|-------------|----------------|------------|
| `--text-xs` | 12px / 0.75rem | 1.5 | 0.02em | Badges, rechtliche Hinweise |
| `--text-sm` | 14px / 0.875rem | 1.5 | 0.01em | Navigation, Labels, Metadaten |
| `--text-base` | 16px / 1rem | 1.6 | 0 | Fließtext, Formularfelder |
| `--text-lg` | 18px / 1.125rem | 1.6 | 0 | Lead-Text, Hero-Untertitel |
| `--text-xl` | 20px / 1.25rem | 1.5 | 0 | Karten-Titel, FAQ-Fragen |
| `--text-2xl` | 24px / 1.5rem | 1.4 | -0.01em | H3, Sektions-Unterüberschriften |
| `--text-3xl` | 32px / 2rem | 1.3 | -0.02em | H2, Sektionsüberschriften |
| `--text-4xl` | 40px / 2.5rem | 1.2 | -0.02em | H1 (Desktop) |
| `--text-5xl` | 48px / 3rem | 1.15 | -0.03em | Hero-Überschrift (Desktop) |
| `--text-script` | 22px / 1.375rem | 1.4 | 0 | Handschrift-Akzente |

### 3.3 Schriftgewichte

| Token | Gewicht | Verwendung |
|-------|---------|------------|
| `--font-regular` | 400 | Fließtext, Beschreibungen |
| `--font-medium` | 500 | Navigation, Labels, Button-Text |
| `--font-semibold` | 600 | Karten-Titel, Hervorhebungen |
| `--font-bold` | 700 | H1, H2, Hero-Überschriften |

### 3.4 Typografie-Hierarchie (Mockup)

| Element | Schrift | Größe | Gewicht | Farbe |
|---------|---------|-------|---------|-------|
| Hero H1 | Playfair Display | 48px | Bold | `#2C2C2C` |
| Hero Subline (Script) | Caveat | 22px | Regular | `#555D42` |
| Sektionsüberschrift H2 | Playfair Display | 32px | Bold | `#2C2C2C` |
| Karten-Titel | Montserrat | 18–20px | Semi-Bold | `#2C2C2C` |
| Fließtext | Montserrat | 16px | Regular | `#4A4A4A` |
| Navigation | Montserrat | 14px | Medium | `#4A4A4A` |
| Button-Text | Montserrat | 14–16px | Medium | je nach Variante |
| Footer-Text | Montserrat | 14px | Regular | `#FFFFFF` |
| Testimonial-Name | Montserrat | 16px | Semi-Bold | `#2C2C2C` |
| Testimonial-Event | Montserrat | 14px | Regular | `#7A7A7A` |

---

## 4. Abstände & Raster

### 4.1 Spacing-Skala (8px-Basis)

| Token | Wert | Verwendung |
|-------|------|------------|
| `--space-1` | 4px | Minimale Innenabstände, Icon-Padding |
| `--space-2` | 8px | Enge Abstände, Icon-zu-Text |
| `--space-3` | 12px | Button-Padding vertikal, kleine Gaps |
| `--space-4` | 16px | Standard-Gap, Karten-Innenpadding (klein) |
| `--space-5` | 20px | Karten-Innenpadding, Formularfeld-Padding |
| `--space-6` | 24px | Mittlere Abstände zwischen Elementen |
| `--space-8` | 32px | Abstand zwischen Karten, Grid-Gap |
| `--space-10` | 40px | Abstand zwischen Sektions-Inhalten |
| `--space-12` | 48px | Große Innenabstände |
| `--space-16` | 64px | Sektions-Padding vertikal (Mobile) |
| `--space-20` | 80px | Sektions-Padding vertikal (Desktop) |
| `--space-24` | 96px | Hero-Padding, große Sektionsabstände |

### 4.2 Layout-Raster

| Eigenschaft | Wert |
|-------------|------|
| Max-Content-Breite | `1200px` |
| Seiten-Padding (Desktop) | `40px` (links/rechts) |
| Seiten-Padding (Mobile) | `20px` (links/rechts) |
| Spalten (Desktop) | 12-Spalten-Raster |
| Grid-Gap (Karten) | `24px` (`--space-6`) |
| Grid-Gap (Galerie) | `16px` (`--space-4`) |

### 4.3 Sektions-Abstände

| Sektion | Padding oben/unten (Desktop) | Padding oben/unten (Mobile) |
|---------|------------------------------|-----------------------------|
| Hero | 80px / 64px | 48px / 40px |
| Trust Bar | 32px | 24px |
| Leistungen | 80px | 48px |
| Ablauf | 80px | 48px |
| Galerie | 64px | 40px |
| Testimonials | 80px | 48px |
| FAQ | 80px (auf Beige) | 48px |
| Kontakt/Footer | 80px (auf Beige) | 48px |

### 4.4 Breakpoints

| Token | Breite | Beschreibung |
|-------|--------|--------------|
| `--bp-sm` | 640px | Große Smartphones |
| `--bp-md` | 768px | Tablets |
| `--bp-lg` | 1024px | Kleine Desktops |
| `--bp-xl` | 1280px | Standard-Desktop |
| `--bp-2xl` | 1536px | Große Bildschirme |

---

## 5. Komponenten

### 5.1 Buttons

#### Primary Button
| Eigenschaft | Wert |
|-------------|------|
| Hintergrund | `#555D42` (Olivgrün) |
| Text | `#FFFFFF`, Montserrat Medium 14–16px |
| Form | Pill (vollständig abgerundet) |
| Border-Radius | `9999px` |
| Padding | `12px 28px` (vertikal × horizontal) |
| Icon | Optional links, 16–18px, weiß |
| Hover | Hintergrund `#454D35`, leichter Schatten |
| Active | Hintergrund `#3A4030`, Schatten reduziert |
| Disabled | Opacity 50%, kein Hover |
| Mindesthöhe | `44px` (Touch-Target) |

**Beispiele im Mockup:** „Jetzt anfragen" (Header), „Termin anfragen" (Hero)

#### Secondary / Ghost Button
| Eigenschaft | Wert |
|-------------|------|
| Hintergrund | `#FFFFFF` |
| Text | `#2C2C2C`, Montserrat Medium 14–16px |
| Rahmen | `1px solid #2C2C2C` oder `#E5E2DB` |
| Form | Pill |
| Border-Radius | `9999px` |
| Padding | `12px 28px` |
| Icon | Optional links, 16–18px, dunkel |
| Hover | Hintergrund `#F4F1EA`, Rahmen dunkler |

**Beispiel im Mockup:** „Mehr erfahren" (Hero)

#### Icon Button (WhatsApp FAB)
| Eigenschaft | Wert |
|-------------|------|
| Größe | `56px × 56px` |
| Form | Kreis |
| Hintergrund | `#555D42` oder WhatsApp-Grün `#25D366` |
| Icon | 24px, weiß |
| Position | Fixed, `bottom: 24px`, `right: 24px` |
| Schatten | `0 4px 12px rgba(0,0,0,0.15)` |
| Hover | Leicht vergrößert (scale 1.05) |

---

### 5.2 Karten

#### Service-Karte (Leistungen)
| Eigenschaft | Wert |
|-------------|------|
| Hintergrund | `#FFFFFF` |
| Border-Radius | `16px` |
| Padding | `32px 24px` |
| Schatten | Keiner oder sehr dezent: `0 1px 3px rgba(0,0,0,0.04)` |
| Rahmen | Optional: `1px solid #E5E2DB` |
| Icon | Line-Art, 32–40px, `#2C2C2C` oder `#555D42` |
| Titel | Montserrat Semi-Bold, 18px, `#2C2C2C` |
| Text | Montserrat Regular, 14–16px, `#4A4A4A` |
| Hover | Leichter Schatten `0 4px 12px rgba(0,0,0,0.08)`, translateY(-2px) |
| Grid | 4 Spalten × 2 Reihen (Desktop), 2 Spalten (Tablet), 1 Spalte (Mobile) |

#### Testimonial-Karte
| Eigenschaft | Wert |
|-------------|------|
| Hintergrund | `#FFFFFF` |
| Border-Radius | `16px` |
| Padding | `32px` |
| Schatten | `0 2px 8px rgba(0,0,0,0.06)` |
| Sterne | 5× Gold `#E8B84A`, 16–18px |
| Zitat | Montserrat Regular, 16px, `#4A4A4A`, kursiv optional |
| Profilbild | Kreis, `48px`, mit `2px` weißem Rahmen |
| Name | Montserrat Semi-Bold, 16px |
| Event-Typ | Montserrat Regular, 14px, `#7A7A7A` |
| Layout | 3 Karten nebeneinander (Desktop), Slider mit Pfeilen |

#### Team-Intro-Karte (Hero-Overlay)
| Eigenschaft | Wert |
|-------------|------|
| Hintergrund | `#FFFFFF` |
| Border-Radius | `12px` |
| Padding | `16px 20px` |
| Schatten | `0 4px 16px rgba(0,0,0,0.1)` |
| Profilbild | Kreis, `40–48px` |
| Name | Montserrat Semi-Bold, 14px |
| Rolle | Montserrat Regular, 12px, `#7A7A7A` |
| Position | Überlappend am unteren Rand des Hero-Bildes |

---

### 5.3 Formular-Elemente

#### Text-Input / Textarea
| Eigenschaft | Wert |
|-------------|------|
| Hintergrund | `#FFFFFF` |
| Rahmen | `1px solid #E5E2DB` |
| Border-Radius | `8px` |
| Padding | `12px 16px` |
| Schrift | Montserrat Regular, 16px |
| Placeholder | `#7A7A7A` |
| Fokus | Rahmen `#555D42`, optional leichter Schatten |
| Fehler | Rahmen `#C45C5C`, Hilfstext in Rot |
| Mindesthöhe (Input) | `44px` |

#### Label
| Eigenschaft | Wert |
|-------------|------|
| Schrift | Montserrat Medium, 14px |
| Farbe | `#2C2C2C` |
| Abstand zum Feld | `8px` darunter |

#### Checkbox / DSGVO-Einwilligung
| Eigenschaft | Wert |
|-------------|------|
| Größe | `18px` |
| Farbe (checked) | `#555D42` |
| Label | Montserrat Regular, 14px, `#4A4A4A` |

---

### 5.4 Navigation

#### Header
| Eigenschaft | Wert |
|-------------|------|
| Höhe | `72–80px` |
| Hintergrund | `#FDFCF9` (transparent möglich beim Scrollen) |
| Position | Sticky / Fixed top |
| Logo | Links, max. Höhe `48px` |
| Nav-Links | Zentriert, Montserrat Medium 14px, `#4A4A4A` |
| Nav-Links Hover | `#555D42`, leichte Unterstreichung |
| Nav-Links Active | `#555D42`, Semi-Bold |
| CTA-Button | Rechts, Primary Button (klein) |
| Schatten (beim Scrollen) | `0 1px 4px rgba(0,0,0,0.06)` |

**Navigationseinträge (Mockup):** Startseite · Leistungen · Ablauf · Galerie · FAQ · Kontakt

#### Mobile Navigation
- Hamburger-Icon rechts (oder links neben Logo)
- Fullscreen-Overlay oder Slide-in-Panel
- Hintergrund: `#FDFCF9`
- Links: Montserrat Medium, 18px, vertikal gestapelt
- CTA-Button am Ende der Liste

---

### 5.5 FAQ Accordion

| Eigenschaft | Wert |
|-------------|------|
| Hintergrund (Sektion) | `#F4F1EA` |
| Frage-Text | Montserrat Medium, 16–18px, `#2C2C2C` |
| Antwort-Text | Montserrat Regular, 16px, `#4A4A4A` |
| Icon (geschlossen) | Plus `+`, 20px, `#555D42` |
| Icon (geöffnet) | Minus `−` oder gedrehtes Plus |
| Trennlinie | `1px solid #E5E2DB` zwischen Einträgen |
| Padding pro Item | `20px 0` |
| Animation | Sanftes Auf-/Zuklappen (200–300ms ease) |

---

### 5.6 Sektions-Trenner

| Eigenschaft | Wert |
|-------------|------|
| Linie | `1px solid #EDEAE4`, volle Content-Breite |
| Herz-Icon | 12–16px, `#C45C5C` oder `#555D42` |
| Überschrift | Playfair Display, 32px, zentriert auf der Linie |
| Abstand | `80px` oberhalb, `48px` unterhalb der Überschrift |

---

### 5.7 Prozess-Schritte (Ablauf)

| Eigenschaft | Wert |
|-------------|------|
| Layout | Horizontal, 5 Schritte |
| Nummer-Kreis | `40px`, Hintergrund `#555D42`, weiße Zahl |
| Verbindung | Gestrichelte Linie oder Pfeil zwischen Schritten |
| Schritt-Titel | Montserrat Semi-Bold, 14–16px |
| Schritt-Text | Montserrat Regular, 14px, `#4A4A4A` |
| Illustration | Panda-Maskottchen rechts neben dem Flow |
| Mobile | Vertikal gestapelt |

---

### 5.8 Galerie

| Eigenschaft | Wert |
|-------------|------|
| Layout | 5 Spalten (Desktop), 3 (Tablet), 2 (Mobile) |
| Bild-Radius | `12px` |
| Gap | `16px` |
| Hover | Leichte Vergrößerung (scale 1.02), optional Overlay |
| Aspect Ratio | Variabel (Masonry) oder einheitlich 4:3 |

---

### 5.9 Trust Bar

| Eigenschaft | Wert |
|-------------|------|
| Layout | 4 Elemente horizontal, gleichmäßig verteilt |
| Icon | Line-Art, 24–28px, `#555D42` |
| Text | Montserrat Medium, 14px, `#2C2C2C` |
| Abstand Icon–Text | `8px` |
| Mobile | 2×2 Grid |

**Beispiele:** Erfahrenes Team · Sichere Betreuung · Individuelle Konzepte · Faire Preise

---

## 6. Icons

### 6.1 Stil

| Eigenschaft | Wert |
|-------------|------|
| Typ | Dünne Line-Art (Stroke-Icons) |
| Strichstärke | `1.5–2px` |
| Größen | 16px (inline), 24px (Standard), 32–40px (Karten), 48px+ (Hero) |
| Farbe | `#2C2C2C` (Standard), `#555D42` (aktiv/Akzent), `#FFFFFF` (auf dunklem BG) |
| Bibliothek (Empfehlung) | Lucide Icons, Phosphor Icons (Light), oder eigene SVGs |

### 6.2 Icon-Verwendung im Mockup

| Kontext | Icon-Typ | Größe |
|---------|----------|-------|
| Service-Karten | Line-Art (Kalender, Ballon, Stern, etc.) | 32–40px |
| Trust Bar | Line-Art (Schild, Team, Herz, Preisschild) | 24–28px |
| Buttons | Pfeil, Kalender (inline) | 16–18px |
| FAQ | Plus / Minus | 20px |
| Social Media | WhatsApp, Instagram (gefüllt, Markenfarbe) | 24px |
| Sektions-Trenner | Herz | 12–16px |
| Navigation (Mobile) | Hamburger, X | 24px |

---

## 7. Bilder & Formen

### 7.1 Hero-Bild (Blob-Maske)

| Eigenschaft | Wert |
|-------------|------|
| Form | Organische Blob-Form (keine harten Kanten) |
| Größe (Desktop) | ca. 480–560px breit |
| Position | Rechte Spalte des Heroes |
| Stil | Echtes Foto (Kinder bei Event) |
| Overlay-Element | Team-Intro-Karte am unteren Rand |

### 7.2 Profilbilder

| Eigenschaft | Wert |
|-------------|------|
| Form | Kreis (`border-radius: 50%`) |
| Größen | 40px (klein), 48px (Standard), 64px (groß) |
| Rahmen | Optional `2px solid #FFFFFF` mit Schatten |

### 7.3 Galerie-Bilder

| Eigenschaft | Wert |
|-------------|------|
| Border-Radius | `12px` |
| Object-Fit | `cover` |
| Lazy Loading | Ja |

### 7.4 Panda-Illustration (Prozess-Sektion)

| Eigenschaft | Wert |
|-------------|------|
| Stil | Vereinfacht, niedlich, flach oder leicht schattiert |
| Farben | Schwarz-Weiß mit grünen Akzenten |
| Größe | ca. 200–280px |
| Position | Rechts neben dem Prozess-Flow |

---

## 8. Schatten & Effekte

| Token | Wert | Verwendung |
|-------|------|------------|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.04)` | Dezente Karten |
| `--shadow-md` | `0 2px 8px rgba(0,0,0,0.06)` | Testimonial-Karten |
| `--shadow-lg` | `0 4px 16px rgba(0,0,0,0.10)` | Team-Overlay-Karte, FAB |
| `--shadow-hover` | `0 4px 12px rgba(0,0,0,0.08)` | Karten-Hover |
| `--shadow-header` | `0 1px 4px rgba(0,0,0,0.06)` | Sticky Header beim Scrollen |

### Animationen (für spätere Umsetzung)

| Effekt | Dauer | Easing |
|--------|-------|--------|
| Button-Hover | 150ms | ease |
| Karten-Hover (translateY) | 200ms | ease-out |
| Accordion auf/zu | 250ms | ease-in-out |
| Fade-in beim Scrollen | 400ms | ease-out |
| FAB-Pulsieren | 2s | infinite (dezent) |

---

## 9. Logo-Spezifikation

| Eigenschaft | Wert |
|-------------|------|
| Form | Kreis-Emblem mit zwei Panda-Gesichtern |
| Wortmarke | „PANDA-BANDE" — fette Sans-Serif, Großbuchstaben |
| Unterzeile | „KINDEREVENTS" — kleinere Serif-Schrift |
| Mindestgröße (Digital) | 120px breit |
| Mindestgröße (Print) | 30mm breit |
| Freiraum | Mindestens die Höhe des „P" als Abstand rundherum |
| Auf hellem BG | Vollfarbe |
| Auf dunklem BG (Footer) | Weiß / invertiert |

---

## 10. Responsive Verhalten

### Desktop (≥ 1024px)
- Volle Zweispalten-Layouts (Hero, Kontakt)
- 4-spaltiges Service-Grid
- 5-spaltige Galerie
- 3 Testimonials nebeneinander
- Horizontale Prozess-Schritte

### Tablet (768–1023px)
- Hero: Weiterhin zweispaltig, aber schmaler
- Service-Grid: 2 Spalten
- Galerie: 3 Spalten
- Testimonials: 2 sichtbar + Slider
- Prozess: Horizontal, kompakter

### Mobile (< 768px)
- Hero: Einspaltig (Text oben, Bild unten)
- Navigation: Hamburger-Menü
- Service-Grid: 1 Spalte
- Galerie: 2 Spalten
- Testimonials: 1 Karte + Slider
- Prozess: Vertikal gestapelt
- Trust Bar: 2×2 Grid
- Footer: Einspaltig (Formular oben, Kontakt unten)
- Buttons: Volle Breite (`width: 100%`)

---

## 11. Zusammenfassung der Design-Tokens

Alle Tokens auf einen Blick — bereit für die spätere Implementierung in CSS/Tailwind:

```
FARBEN
  primary:          #555D42
  primary-hover:    #454D35
  bg-primary:       #FDFCF9
  bg-secondary:     #F4F1EA
  bg-card:          #FFFFFF
  text-primary:     #2C2C2C
  text-secondary:   #4A4A4A
  text-muted:       #7A7A7A
  text-inverse:     #FFFFFF
  accent-gold:      #E8B84A
  border:           #E5E2DB
  divider:          #EDEAE4

TYPOGRAFIE
  font-heading:     Playfair Display
  font-body:        Montserrat
  font-accent:      Caveat
  text-xs:          12px
  text-sm:          14px
  text-base:        16px
  text-lg:          18px
  text-xl:          20px
  text-2xl:         24px
  text-3xl:         32px
  text-4xl:         40px
  text-5xl:         48px

ABSTÄNDE
  space-1:   4px    space-8:   32px
  space-2:   8px    space-10:  40px
  space-3:   12px   space-12:  48px
  space-4:   16px   space-16:  64px
  space-5:   20px   space-20:  80px
  space-6:   24px   space-24:  96px

RADIEN
  radius-sm:   8px   (Inputs)
  radius-md:   12px  (Bilder, kleine Karten)
  radius-lg:   16px  (Karten)
  radius-full: 9999px (Buttons, Pills)

SCHATTEN
  shadow-sm / shadow-md / shadow-lg / shadow-hover / shadow-header

LAYOUT
  max-width:   1200px
  padding-x:   40px (desktop) / 20px (mobile)
```

---

## 12. Abweichungen von der ursprünglichen Branding-Vorlage

Das Mockup hat die initiale Branding-Vorlage (`Branding.md`) in folgenden Punkten konkretisiert:

| Aspekt | Vorher (Vorschlag) | Jetzt (Mockup) |
|--------|-------------------|----------------|
| Primärfarbe | Bambus-Grün `#6BBF59` | Olivgrün `#555D42` |
| Hintergrund | Warm-Weiß `#FFF9F0` | Warm-Weiß `#FDFCF9` |
| Überschriften | Nunito / Quicksand (Sans) | Playfair Display (Serif) |
| Fließtext | Inter / Open Sans | Montserrat |
| Akzent-Schrift | Baloo 2 | Caveat (Handschrift) |
| Button-Form | Abgerundet (12–16px) | Pill (vollständig rund) |
| Icons | Rund, gefüllt | Dünn, Line-Art |
| Stil | Modern Playful | Warm Professional Playful |

> **Das Mockup ist ab sofort die verbindliche visuelle Referenz.**
