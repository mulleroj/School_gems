# GemForge – Projektová paměť

Tento dokument je praktická "paměť projektu", aby bylo kdykoliv jasné:
- jak web funguje,
- jaké principy jsme při úpravách používali,
- jak správně přidávat další gemy bez rozbití logiky.

## 1) Co je GemForge

GemForge je statický katalog gemů pro Google Gemini, lokalizovaný pro české školní prostředí.

Hlavní cíl:
- rychle najít vhodný gem podle tématu nebo cílové skupiny,
- otevřít detail a přejít do Gemini,
- průběžně přidávat nové gemy bez složitého refaktoru.

## 2) Architektura projektu

Klíčové soubory:
- `index.html` – homepage (hero + novinky + přehled kategorií)
- `all-gems.html` – kompletní katalog s filtry
- `gem.html` – detail gemu
- `gems-data.js` – hlavní zdroj dat
- `gems-inline.js` – fallback kopie dat (pro případy, kdy se hlavní data nenačtou)
- `styles.css` – sdílené styly

Dulezity princip:
- **zdroj pravdy je `gems-data.js`**,
- `gems-inline.js` se drží obsahově v sync jako bezpečnostní fallback.

## 3) Datový model jednoho gemu

Každý gem má standardně tato pole:
- `slug` – unikátní ID pro URL (`gem.html?slug=...`)
- `emoji` – ikona v kartách
- `title` – název (EN / interní)
- `titleCs` – název pro UI
- `shortDescCs` – krátký popis pro karty
- `descriptionCs` – dlouhý popis pro detail
- `category` – hlavní kategorie (jedna)
- `categories` – seznam štítků (více hodnot)
- `gemUrl` – přímý odkaz na Google Gemini gem
- `addedAt` – datum zařazení (YYYY-MM-DD), používá se pro řazení novinek

### Příklad

```js
"my-new-gem": {
  slug: "my-new-gem",
  emoji: "💎",
  title: "My New Gem",
  titleCs: "Můj nový gem",
  shortDescCs: "Krátký popis do karty.",
  descriptionCs: "Dlouhý popis do detailu.",
  category: "materials",
  categories: ["materials", "newest"],
  gemUrl: "https://gemini.google.com/gem/....?usp=sharing",
  addedAt: "2026-04-19"
}
```

## 4) Logika homepage (`index.html`)

### Hero
- obsahuje dynamický badge s počtem gemů (`Object.keys(GEMS).length`),
- má vizuální zvýraznění (glow/pulse) na count bublině a u hero obrázku.

### Sekce "Nejnovější gemy"
- zobrazuje max `HOME_NEWEST_LIMIT` (aktuálně 12),
- řadí podle `addedAt` sestupně (nejnovější první),
- filtry v horní liště sekce omezují výběr na tematický průřez.

### Přehled kategorií pod hero
- sekce jsou rozdělené na témata + publikum,
- každý blok má CTA na plný katalog (`all-gems.html#<filter>`),
- v každé kategorii se ukazují jen 3 preview karty (`HOME_CATEGORY_PREVIEW_LIMIT = 3`),
- pokud kombinace filtrů nic nevrátí, zobrazí se "empty state" s resetem.

## 5) Logika katalogu (`all-gems.html`)

- obsahuje kompletní výpis dat z `GEMS_DATA`,
- filtr se řídí:
  - hashem v URL (`#planning`, `#student`, ...),
  - případně query (`?filter=planning`),
- aktivní chip se synchronizuje s URL,
- zobrazený počet se přepočítává dynamicky.

## 6) Logika detailu (`gem.html`)

- detail se načítá podle `slug` z query (`gem.html?slug=...`),
- data bere z `gems-data.js`,
- pokud nejsou dostupná, fallbackne na `gems-inline.js` / inline data.

## 7) Jak správně přidat nový gem (checklist)

1. **Přidej záznam do `gems-data.js`**  
   - ideálně na konec objektu.
2. **Zkopíruj stejný záznam do `gems-inline.js`**  
   - obsah musí být shodný.
3. Nastav:
   - `slug` unikátní,
   - `category` (jedna hlavní),
   - `categories` (štítky, podle potřeby včetně `"newest"`),
   - `addedAt` s aktuálním datem, pokud má patřit mezi novinky.
4. Zkontroluj odkaz `gemUrl` (správný Gemini URL tvar).
5. Lokálně otestuj:
   - `index.html` (novinky + count),
   - `all-gems.html` (filtrace),
   - `gem.html?slug=...` (detail + odkaz).
6. Teprve potom commit + push.

## 8) Pravidla, která se osvědčila

- Home má být "rozcestník", ne plný katalog.
- Novinky mají být skutečně novinky (řazení podle `addedAt`).
- Kategorie a publikum držet odděleně (lepší orientace).
- Vizuální efekty držet jemné, ale čitelné.
- Hero měnit opatrně, spodní část lze iterovat častěji.

## 9) Rychlé příkazy pro kontrolu

Lokální běh:

```bash
python -m http.server 8080
```

Počet gemů v datech:

```bash
node -e "global.window={}; require('./gems-data.js'); console.log(Object.keys(window.GEMS_DATA).length)"
```

## 10) Poznámka k budoucím změnám

Pokud se změní UX strategie (napr. jiné členění kategorií), nejdřív upravit:
- texty a filtry na homepage,
- mapování filtrů v JS,
- teprve pak styly.

Tento dokument je určený k průběžné aktualizaci po větších změnách.

## 11) Release checklist (pred push)

Pouzij tento seznam pred kazdym pushem na `main`.

### A) Data gemu

- [ ] Novy/meneny gem je v `gems-data.js`.
- [ ] Stejna zmena je i v `gems-inline.js` (fallback sync).
- [ ] `slug` je unikatni.
- [ ] `gemUrl` je funkcni Gemini odkaz.
- [ ] `category` + `categories` odpovida zamyslene sekci.
- [ ] Pokud ma byt v novinkach, ma `addedAt` a pripadne `newest` v `categories`.

### B) Funkcnost stranek

- [ ] `index.html` se nacte bez JS chyby.
- [ ] Hero badge ukazuje realny pocet gemu.
- [ ] Sekce "Nejnovejsi gemy" vraci relevantni obsah.
- [ ] Filtry na homepage (tema/publikum) funguji a reset vraci vse.
- [ ] `all-gems.html` filtruje podle chipu i hash URL (`#student`, `#planning`, ...).
- [ ] `gem.html?slug=<slug>` zobrazi detail a funkcni tlacitko do Gemini.

### C) UX a obsah

- [ ] V homepage kategoriich jsou jen preview karty (max 3) + CTA.
- [ ] Texty v cestine jsou srozumitelne a bez preklepu.
- [ ] Pata stranky obsahuje konzistentni odkazy.
- [ ] Hero cast neni nechtene rozbita globalnim stylem.

### D) Technicka kontrola

- [ ] Lokalne otevreno pres `python -m http.server 8080`.
- [ ] Otestovano v prohlizeci po tvrdem refreshi (`Ctrl+F5`).
- [ ] `git status` obsahuje jen ocekavane soubory.
- [ ] Commit zprava popisuje proc byla zmena udelana.

### E) Po pushi

- [ ] Overit, ze branch je cista (`git status`).
- [ ] Overit, ze commit je na `origin/main`.
- [ ] Zkontrolovat nasazenou verzi na Netlify (homepage + katalog + detail).
- [ ] Rychly sanity check: novy gem lze najit pres `all-gems.html` i otevrit v `gem.html`.
