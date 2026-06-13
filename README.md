# PerChance Image Generator — Lumiverse Spindle Extension

Adds a **PerChance** tab to the Lumiverse side drawer containing a free AI image generator. No API key, no account, no cost.

![Tab shown in Lumiverse sidebar as "ImgGen"](https://img.shields.io/badge/Lumiverse-Extension-blue?style=flat-square)

---

## What it does

- Registers a drawer tab labelled **"PerChance"** (sidebar icon: `ImgGen`)
- Embeds [perchance.org/ai-text-to-image-generator](https://perchance.org/ai-text-to-image-generator) in embed mode (`?embed`) so the generator fills the panel with no navigation chrome
- Automatically resizes to fill whatever height Lumiverse gives the panel
- Searchable via the command palette with keywords: `image`, `generate`, `art`, `ai`, `draw`, `diffusion`
- Zero permissions required — no backend, no API keys, no storage

---

## Install (no build step required)

The `dist/frontend.js` is pre-compiled and ready to go.

### Option A — Lumiverse Extensions UI (recommended)

1. Open Lumiverse → **Settings → Extensions**
2. Click **"Install from GitHub"**
3. Paste: `https://github.com/Simplefanatic/perchance-image-gen`
4. Click **Install**

### Option B — Manual drag-and-drop

1. Download this repo as a `.zip` (GitHub → Code → Download ZIP)
2. In Lumiverse → **Settings → Extensions**, look for the upload / folder drop target
3. Drop the unzipped folder (or the `.zip` directly, if Lumiverse supports it)

### Option C — HuggingFace Spaces (self-hosted Lumiverse)

Mount the extension directory in your Space's `Dockerfile` or `extensions/` folder per your Lumiverse deployment's extension-path config, then restart the Space.

---

## Build from source (optional)

Requires [Bun](https://bun.sh/) (or swap `bun build` for the `esbuild` command below).

```bash
# Install deps
bun install

# Build (minified, browser target)
bun run build

# Or with esbuild
npx esbuild src/frontend.ts --bundle --format=esm --platform=browser --target=es2020 --minify --outfile=dist/frontend.js
```

Type-check only (no output):
```bash
npx tsc --noEmit
```

---

## Technical notes

### Why `createSandboxFrame` + nested `<iframe>`?

The Lumiverse Spindle API blocks raw `<iframe>` elements via `ctx.dom.createElement`. The approved path for embedding external documents is `ctx.dom.createSandboxFrame()`, which creates a host-managed sandboxed iframe. The sandbox frame's HTML document contains a second `<iframe>` pointed at the PerChance URL.

The inner iframe requests these sandbox flags:

| Flag | Why needed |
|---|---|
| `allow-scripts` | Run PerChance's JavaScript |
| `allow-same-origin` | PerChance scripts can access their own cookies / localStorage (settings persistence) |
| `allow-forms` | Submit the prompt input |
| `allow-popups` | Any popup the generator opens |
| `allow-popups-to-escape-sandbox` | Popups open as real browser windows |

### Height management

The outer sandbox frame uses `autoResize: false` (so it doesn't try to shrink/grow to content size) and a `ResizeObserver` on the tab root keeps the iframe's pixel height synchronized with the panel. This avoids the 100%-height propagation issue common in flex/stacking contexts.

### Teardown

The `setup()` function returns a cleanup callback. When the extension is disabled or Lumiverse unloads it, the observer is disconnected and all Spindle resources (`frame.destroy()`, `tab.destroy()`, `removeStyle()`) are released.

---

## Compatibility

| Lumiverse | Status |
|---|---|
| `≥ 0.1.0` | ✅ Supported |

---

## License

MIT — do whatever you want with it.
