# SESSION-HANDOFF — Muper Sario 2.0

> **Updated:** 2026-08-12  
> **Repo:** https://github.com/TheyCallMeHenry/muper-sario · **Live:** https://theycallmehenry.github.io/muper-sario/

## Read first

1. `DESIGN.md` 2. `docs/EXTRACTION-MANIFEST.md` 3. `docs/V1-PITFALLS.md` 4. `docs/QA-FINDINGS.md` 5. `docs/RESEARCH-NOTES.md`

## Current phase

| Phase | Status |
|-------|--------|
| 0–6 Build + side-scroll + UX | ✅ Complete |
| 7 Scoring + SMB physics polish | ✅ Complete (2026-08-12 PM) |
| **4b Deploy (GitHub Pages)** | ✅ Complete (2026-08-12 PM) |

## Shipped state

- **20** modules · test.html **20/20** · `node --check` **20/20**
- Level: 4800 px · 2 pits · 11 pipes · 25 coins · 6 Bubas · flag x=4720 · par **90 s**
- Score: 1/coin + 1/Buba stomp · win: `base × clamp(par/elapsed, 0.5–2.0)`
- Physics: SMB run+jump · coyote 0.15 s / pipe 0.22 s · Left Shift run
- Pages: `main` branch root · cache bust `GameEngine.js?v=3`

## Commands

```powershell
cd D:\Apps\Muper_Sario_2.0
.\launch.bat
Get-ChildItem -Recurse src -Filter *.js | ForEach-Object { node --check $_.FullName }
```

## Next

1. Play-test live Pages URL after deploy propagates (~1–2 min)
2. Optional: `assets/music/background.wav` in repo for BGM on Pages
3. Level 2, progress bar, additional levels via `levelData.js`

## Do not

- Patch v1 archive · use port **38472** · reintroduce spawn timer
- Copy v1 `GameScene.js`/`Pipe.js` wholesale
