import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root {
    color-scheme: light;
    --bg:#F7F7FA;--surface:#FFFFFF;--soft:#F1F3F7;--line:#DFE4EC;--ink:#14243B;--muted:#4E5D72;
    --brand:#F87837;--on-brand:#251304;--brand-ink:#9B390A;--tint:#FFF0E6;
    --success:#146745;--success-bg:#E6F6ED;--error:#AA272A;--error-bg:#FDEDED;--focus:#3156CE;
  }
  :root[data-theme="dark"] {
    color-scheme: dark;
    --bg:#0D1625;--surface:#142237;--soft:#1B2C43;--line:#344962;--ink:#F4F7FB;--muted:#B1C0D3;
    --brand:#FF935B;--on-brand:#251304;--brand-ink:#FFB58A;--tint:#412D29;
    --success:#9AE1B8;--success-bg:#193C33;--error:#FFADAD;--error-bg:#422B35;--focus:#A5B7FF;
  }
  *, *::before, *::after { box-sizing: border-box; }
  body { margin:0; font:16px/1.38 Inter, sans-serif; color:var(--ink); background:var(--bg); }
  :lang(fa) body { font-family:Vazirmatn,Inter,sans-serif; line-height:1.55; }
  button, input, select, textarea { font:inherit; }
  button { cursor:pointer; }
  a { color:inherit; text-decoration:none; }
  :focus-visible { outline:2px solid var(--focus); outline-offset:3px; }
  h1,h2,p { margin:0; }
  .latin { font-family:Inter,sans-serif; }
  [dir="rtl"] .directional { transform:scaleX(-1); }
  .visually-hidden { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
`;
