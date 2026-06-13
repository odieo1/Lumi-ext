var d="https://null.perchance.org/ai-text-to-image-generator?embed",s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
  <path fill-rule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909-.49-.49a.75.75 0 0 0-1.061 0L6.53 12.82 4.97 11.26a.75.75 0 0 0-1.06 0l-1.41 1.81ZM9 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" clip-rule="evenodd" /></svg>`;function c(o){let n=o.dom.addStyle(`
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
  `),e=o.ui.registerDrawerTab({id:"perchance-image-gen",title:"PerChance",shortName:"ImgGen",description:"Free AI image generation \u2014 no API key required",keywords:["image","generate","art","perchance","ai","picture","draw","diffusion"],iconSvg:s});e.root.classList.add("pc-root");let l=`<!DOCTYPE html>
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
    src="${d}"
    allow="accelerometer; autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen; geolocation; microphone; picture-in-picture; web-share"
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
    title="PerChance AI Image Generator"
    referrerpolicy="no-referrer"
  ></iframe>
</body>
</html>`,t=o.dom.createSandboxFrame({html:l,autoResize:!1,minHeight:400,maxHeight:99999});t.element.className="pc-iframe",e.root.appendChild(t.element);let r=()=>{let a=e.root.clientHeight;a>0&&(t.element.style.height=`${a}px`)},i=new ResizeObserver(r);return i.observe(e.root),r(),()=>{i.disconnect(),n(),t.destroy(),e.destroy()}}export{c as setup};
