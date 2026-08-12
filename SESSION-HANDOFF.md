# SESSION-HANDOFF — Muper Sario 2.0

> **Updated:** 2026-08-12 PM  
> **Repo:** https://github.com/TheyCallMeHenry/muper-sario · **Live:** https://theycallmehenry.github.io/muper-sario/

## Read first

1. `docs/DOC-INDEX.md` 2. `DESIGN.md` 3. `docs/RESEARCH-NOTES.md` 4. `docs/QA-FINDINGS.md`

## Current phase

| Phase | Status |
|-------|--------|
| 0–7 Build, physics, scoring | ✅ Complete |
| **4b Deploy (GitHub Pages)** | ✅ Complete |

## Shipped state

- **20** modules · test **20/20** local + Pages
- Level: 4800 px · 2 pits · 11 pipes · 25 coins · 6 Bubas · flag 4720 · par 90 s
- Score: +1 coin/stomp · win `round(base × clamp(90/t, 0.5, 2.0))`
- Physics: SMB run+jump · coyote 0.15/0.22 s · Left Shift run
- BGM `assets/music/background.wav` committed · Pages from `main` · `GameEngine.js?v=3`

## Commands

```powershell
cd D:\Apps\Muper_Sario_2.0
.\launch.bat
Get-ChildItem -Recurse src -Filter *.js | ForEach-Object { node --check $_.FullName }
```

## Next

1. Level 2 / tuning via `levelData.js`
2. Optional: in-game elapsed timer HUD
3. Bump `?v=` after entry-script changes

## Do not

- Patch v1 · port **38472** · spawn timer · v1 GameScene/Pipe wholesale copy
