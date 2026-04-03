# MOS Milano Offre Servizi — E-commerce

## Stack tecnico
- **Framework**: Next.js 15 App Router, TypeScript strict
- **ORM**: Drizzle ORM + PostgreSQL (Supabase)
- **Deploy**: Vercel Hobby plan — i build falliscono su errori TypeScript
- **Animazioni**: GSAP + ScrollTrigger (scroll reveal), Framer Motion (micro-interazioni)
- **Font**: Space Grotesk (heading), Inter (body)
- **CSS**: Tailwind CSS v4 con `@theme inline`

## Struttura progetto
```
src/
  app/            → Pages (App Router)
    (shop)/       → Frontend pubblico (catalogo, servizi, login, checkout...)
    (account)/    → Area utente autenticato (ordini, profilo, preferiti)
    admin/        → Pannello admin (ordini, prodotti, clienti, statistiche...)
    api/          → Route API (auth, cart, orders, products, migrations...)
  components/
    layout/       → Header, Footer
    ui/           → Componenti riutilizzabili (ScrollReveal, CountUp, MotionCard, MotionButton)
    shop/         → Componenti shop specifici
  db/             → Schema Drizzle, connessione DB
  lib/            → Utility, csv-import, auth
public/           → Assets statici (logo, immagini prodotto)
brand-assets/     → Immagini sorgente brand (logo HD, foto ambientate, foto Davide)
```

## Convenzioni codice
- Tutte le pagine e i componenti in italiano dove possibile (nomi variabili, UI copy)
- API routes in inglese
- Commit message in inglese con prefisso (feat:, fix:, refactor:, redesign:)

---

## DESIGN SYSTEM & IDENTITÀ VISIVA

### Filosofia
Ogni interfaccia deve essere **distintiva, professionale e memorabile**.
Evitare qualsiasi estetica generica o che sembri generata dall'AI.
L'estetica è **light** — bianco dominante, spazi aperti, tipografia forte.

### Brand MOS
- **MOS** = Milano Offre Servizi
- Settore: forniture ufficio B2B/B2C — caffè, acqua, cancelleria
- Tone: professionale ma umano, diretto, milanese
- Davide Mareggini è il fondatore e volto dell'azienda

### Palette colori

| Token               | Hex       | Uso                                      |
|----------------------|-----------|------------------------------------------|
| `--color-mos-red`    | `#D51317` | Primario brand — CTA principali, accenti |
| `--color-mos-red-hover` | `#B81013` | Hover su CTA rosse                    |
| `--color-mos-red-light` | `#FEF2F2` | Badge, sfondi leggeri rossi           |
| `--color-dark`       | `#1A1A1A` | Testi primari, navbar, footer            |
| `--color-dark-soft`  | `#2D2D2D` | Testi secondari importanti               |
| `--color-gray-600`   | `#6B7280` | Testi secondari, descrizioni             |
| `--color-gray-300`   | `#D1D5DB` | Bordi, separatori                        |
| `--color-gray-100`   | `#F3F4F6` | Sfondi sezioni alternate                 |
| `--color-gray-50`    | `#F9FAFB` | Sfondo pagina, hover leggero             |
| `--color-white`      | `#FFFFFF` | Sfondo dominante                         |
| `--color-blue`       | `#1D4ED8` | Link, elementi interattivi secondari     |

> Il **rosso MOS (#D51317)** è il colore identificativo.
> Ogni pagina deve avere almeno un elemento rosso MOS visibile (logo, CTA, accento).
> Il blu è secondario, usato per link e stati attivi nel catalogo.

### Tipografia
- **Heading**: Space Grotesk — geometrico, bold, tracking stretto (-0.02em), professionale
- **Body**: Inter — leggibilissimo, moderno, standard di settore per UI
- Classe CSS: `.font-heading` per applicare Space Grotesk
- Dimensioni: titoli hero `text-4xl md:text-5xl`, sezione `text-2xl md:text-3xl`
- Mai usare font-weight light sui titoli. Sempre **bold** o **extrabold**.

### Animazioni

**GSAP + ScrollTrigger** (scroll reveal):
- Componente `<ScrollReveal>` in `src/components/ui/scroll-reveal.tsx`
- Elementi entrano con fade-in dal basso (40px) quando entrano nel viewport
- Stagger di 0.15s tra elementi di una griglia
- Easing: `power3.out`
- Prop `single` per animare come un unico blocco

**CountUp** (statistiche animate):
- Componente `<CountUp>` in `src/components/ui/count-up.tsx`
- I numeri contano da zero quando la sezione è visibile
- Supporta prefix, suffix, decimali

**Framer Motion** (micro-interazioni):
- `<MotionCard>`: hover scale-up 1.02, tap scale-down 0.98, durata 300ms
- `<MotionButton>`: hover scale-up 1.03, tap scale-down 0.97, durata 200ms
- Tutte le transizioni usano `cubic-bezier(0.4, 0, 0.2, 1)` — fluide e naturali

### Spacing & Layout
- Max width contenuto: `max-w-7xl` (1280px)
- Padding sezioni: `py-16 md:py-24`
- Gap tra elementi: multipli di 4 (`gap-4`, `gap-6`, `gap-8`)
- Bordi arrotondati: `rounded-xl` per card, `rounded-lg` per bottoni
- Ombre: leggere (`shadow-sm`, `shadow-lg`) — mai pesanti. L'estetica è flat/light.

### Componenti chiave

**Bottoni primari** (`MotionButton variant="primary"`): sfondo `mos-red`, testo bianco, `rounded-lg`, `px-7 py-3.5`, hover `mos-red-hover` + scale 1.03
**Bottoni secondari** (`variant="outline"`): bordo `gray-300`, testo `dark`, hover bordo `dark`
**Card** (`MotionCard`): sfondo bianco, bordo `gray-200`, `rounded-xl`, hover `shadow-lg` + bordo `mos-red/30` + scale 1.02
**Header**: sfondo bianco (sticky con shadow on scroll), logo-dark, search con focus rosso, nav bar `bg-dark`
**Footer**: sfondo `dark` (#1A1A1A), testo grigio, icone contatti in rosso MOS

### Immagini brand disponibili (in `/brand-assets/`)
- `NEW cube jpg.jpg` — Logo MOS rosso su sfondo chiaro (quadrato, social)
- `logo new sfondi scuri small.png` — Logo MOS outline bianco per sfondi scuri
- `Home 1.png` — Davide nello showroom con macchine (hero)
- `davide 3 camicia2.png` — Ritratto Davide (circolare, trust section)
- `dr. coffee drf10 SILVER2.png` — Dr.Coffee silver in ufficio
- `dr.coffee.png` — Dr.Coffee nero in ufficio
- `DR.COFFEE CENTER2.png` — Dr.Coffee Center nero con hopper
- `home x4_1a.png` — Macchina Lavazza nera
- `home x4_2.png` — Macchina Necta automatica
- `MOS_4_ambienti_unica.png` — Strip 3 macchine professionali
- `servizio acqua uffici 5.png` — Ambientazione servizio acqua con logo MOS

### Regole per il design
1. **Mai** usare gradient vistosi o colori saturi che non siano il rosso MOS
2. **Mai** icone Lucide giganti come visual principale — usare sempre foto reali
3. **Sempre** mantenere gerarchia visiva: titolo → sottotitolo → corpo → CTA
4. **Sempre** verificare contrasto testo/sfondo (WCAG AA minimo)
5. Lo sfondo dominante è **bianco**. Le sezioni alternate usano `gray-50` o `gray-100`.
6. Le card non devono avere bordi spessi o ombre pesanti.
7. Il pannello admin può mantenere uno stile più funzionale ma deve usare la stessa palette.
8. **Sempre** usare `<ScrollReveal>` per sezioni sotto il fold
9. **Sempre** usare `<MotionButton>` e `<MotionCard>` per elementi interattivi
10. I numeri/statistiche devono usare `<CountUp>` con animazione allo scroll

---

## Database
- Le migrazioni sono API routes (`/api/migrate-v*`) con `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
- Schema principale in `src/db/schema.ts`
- Tabelle principali: products, categories, orders, orderItems, customers, cartItems, quoteRequests, csvImports

## Importazione prodotti
- 25.947 prodotti importati da `listino_completo.csv` (semicolon-delimited)
- Import via `/api/import-csv` con logica in `src/lib/csv-import.ts`

## Gestione ordini (E-Sell legacy)
- Campi aggiuntivi per inoltro fornitori, tipo spedizione, opzioni ordine
- Migrazione v10 applica le colonne E-Sell a orders e order_items
