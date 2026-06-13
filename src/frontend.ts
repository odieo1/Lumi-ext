/**
 * PerChance Image Generator — Lumiverse Spindle Frontend Extension
 *
 * Adds a drawer tab that embeds the PerChance AI text-to-image generator
 * at https://null.perchance.org/ai-text-to-image-generator?embed
 *
 * Architecture notes:
 *  - Drawer tabs require no permission declarations (free-tier).
 *  - Raw <iframe> elements are blocked by the Spindle DOM helper; we use
 *    ctx.dom.createSandboxFrame() to get a host-managed sandboxed iframe.
 *  - The sandbox frame's HTML document contains a second <iframe> pointed
 *    at the PerChance URL. The inner iframe uses the most permissive sandbox
 *    flags available, within the bounds the outer sandbox allows.
 *  - A ResizeObserver keeps the sandbox frame height flush with the tab root
 *    so the generator fills the panel without clipping or scrollbars.
 */

import type { SpindleFrontendContext } from 'lumiverse-spindle-types'

// ── Constants ──────────────────────────────────────────────────────────────────

const PERCHANCE_URL = 'https://null.perchance.org/ai-text-to-image-generator?embed'

/** Image/camera icon — shown in the sidebar tab and command palette. */
const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
  <path fill-rule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909-.49-.49a.75.75 0 0 0-1.061 0L6.53 12.82 4.97 11.26a.75.75 0 0 0-1.06 0l-1.41 1.81ZM9 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" clip-rule="evenodd" /></svg>`

// ── Spindle entry point ────────────────────────────────────────────────────────

export function setup(ctx: SpindleFrontendContext): () => void {

  // ── 1. Inject scoped styles ──────────────────────────────────────────────────
  //
  // .pc-root:    The tab's root element, made into a flex column that fills
  //              whatever height Lumiverse gives the panel.
  //
  // .pc-iframe:  The outer Spindle sandbox frame element. flex:1 makes it
  //              consume all remaining vertical space within .pc-root.
  //              We also hard-set height via ResizeObserver (see below) because
  //              some host layouts don't propagate height to flex children
  //              across shadow/stacking boundaries.
  //
  const removeStyle = ctx.dom.addStyle(`
    .pc-root {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      overflow: hidden;
      padding: 0 !important;
      margin: 0;
      box-sizing: border-box;
    }
    .pc-iframe {
      flex: 1 1 0;
      width: 100% !important;
      border: none;
      display: block;
      background: transparent;
      /* height is set dynamically by ResizeObserver */
    }
  `)

  // ── 2. Register the drawer tab ───────────────────────────────────────────────
  const tab = ctx.ui.registerDrawerTab({
    id: 'perchance-image-gen',
    title: 'PerChance',
    shortName: 'ImgGen',
    description: 'Free AI image generation — no API key required',
    keywords: ['image', 'generate', 'art', 'perchance', 'ai', 'picture', 'draw', 'diffusion'],
    iconSvg: ICON_SVG,
  })

  tab.root.classList.add('pc-root')

  // ── 3. Build the sandbox HTML ────────────────────────────────────────────────
  //
  // The outer sandbox frame is Lumiverse-managed and has allow-scripts at
  // minimum. Inside it we place an <iframe src="...perchance..."> with the
  // most permissive sandbox we can request:
  //
  //   allow-scripts           — run JS on the perchance page
  //   allow-same-origin       — let perchance's scripts access their own cookies
  //                             and localStorage (needed for settings persistence)
  //   allow-forms             — form submits (prompt input)
  //   allow-popups            — any pop-up the generator opens
  //   allow-popups-to-escape-sandbox — let pop-ups open as real windows
  //
  // The inner iframe also gets a broad Permissions Policy via the `allow`
  // attribute so perchance features (clipboard, fullscreen, etc.) aren't
  // blocked by the browser's feature-gating layer.
  //
  // Note: the HTML is inlined as a template string; no external fetches.
  const sandboxHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
    }
    iframe {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
  </style>
</head>
<body>
  <iframe
    src="${PERCHANCE_URL}"
    allow="accelerometer; autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen; geolocation; microphone; picture-in-picture; web-share"
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
    title="PerChance AI Image Generator"
    referrerpolicy="no-referrer"
  ></iframe>
</body>
</html>`

  // ── 4. Create and mount the sandbox frame ────────────────────────────────────
  const frame = ctx.dom.createSandboxFrame({
    html: sandboxHtml,
    autoResize: false,    // we manage height ourselves via ResizeObserver
    minHeight: 400,
    maxHeight: 99999,
  })

  frame.element.className = 'pc-iframe'
  tab.root.appendChild(frame.element)

  // ── 5. Height sync via ResizeObserver ────────────────────────────────────────
  //
  // Keep the sandbox iframe's pixel height equal to the tab root's client
  // height. This is necessary because percentage heights can break through
  // certain host stacking contexts.
  //
  const syncHeight = () => {
    const h = tab.root.clientHeight
    if (h > 0) {
      frame.element.style.height = `${h}px`
    }
  }

  const observer = new ResizeObserver(syncHeight)
  observer.observe(tab.root)
  // Run once immediately in case the tab is already visible
  syncHeight()

  // ── 6. Teardown ──────────────────────────────────────────────────────────────
  //
  // Lumiverse calls the returned function when the extension is disabled or
  // unloaded. We must clean up all host-registered resources to avoid leaks.
  //
  return () => {
    observer.disconnect()
    removeStyle()
    frame.destroy()
    tab.destroy()
  }
}
