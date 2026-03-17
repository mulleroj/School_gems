# GemForge

Místo, kde se z nápadů stávají užitečné Gemy. Procházej, testuj a stav si vlastní sadu Gemů pro Google Gemini.

## Struktura projektu

- `index.html` – úvodní stránka
- `all-gems.html` – přehled všech 114 gemů
- `gem.html` – detail jednotlivého gemu
- `gems-data.js` – data gemů (slug, emoji, popisy, odkazy)
- `gems-inline.js` – záložní kopie dat pro stránku „Všechny gemy“
- `styles.css` – styly

## Lokální spuštění

```bash
python -m http.server 8080
```

Poté otevřete http://localhost:8080

## Nasazení na Netlify

1. Nahrajte repozitář na GitHub
2. Přihlaste se na [netlify.com](https://www.netlify.com)
3. **Add new site** → **Import an existing project** → **GitHub**
4. Vyberte repozitář
5. Build settings: **Publish directory** = `.` (nebo ponechte prázdné)
6. **Deploy**

Každý push na GitHub automaticky spustí nové nasazení.
