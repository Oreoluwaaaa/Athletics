Smart Athletics Static Site
===========================

Generated on 2025-04-18T06:23:03.288393

Files:
- index.html       : Home page with team toggle, opponent selector, navigation buttons
- entry.html       : Stat entry page with interactive shot chart
- viewer.html      : Shot viewer page displaying recorded shots
- simulate.html    : Placeholder simulator launcher
- style.css        : Shared styles
- scripts/data.js  : Stub datasets (replace with full)
- scripts/app.js   : JS for home page
- scripts/storage.js : LocalStorage helpers
- scripts/entry.js : JS for stat entry
- scripts/viewer.js: JS for viewer

Persistence is accomplished client‑side via localStorage (`sa_shots_v1`). Replace
`assets/shot_chart.png`, `assets/basketball_bg.jpg`, and any other images with
your own artwork.

Tested on latest Chrome + Firefox.