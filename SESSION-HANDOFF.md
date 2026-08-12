# SESSION-HANDOFF — Muper Sario 2.0

> **Updated:** 2026-08-12 late evening (Phase 10b underlay revert + full doc sync)  
> **Repo:** https://github.com/TheyCallMeHenry/muper-sario · **Live:** https://theycallmehenry.github.io/muper-sario/

## Read first

1. `docs/DOC-INDEX.md` 2. `DESIGN.md` 3. `docs/RESEARCH-NOTES.md` § Phase 10b

## Current phase

| Phase | Status |
|-------|--------|
| 0–10 Procedural rogue-lite levels | ✅ Complete |
| **10b Parallax opacity + par-time research** | 🔬 Research complete · underlay **reverted** · per-style silhouettes **optional** |
| **Docs full sync (Phase 10b + revert)** | ✅ Complete |

## Shipped state

- **23** modules · test **23/23** local
- **26** chunks · **12**/run → 4800 px · `?seed=N` reproducible
- Cache bust: `GameEngine.js?v=5`
- SMB scale: player 48 px · pipe 96 px · platform y=404
- Tree underlay: `drawTreeOpaqueUnderlay` / `flattenTreeAlpha` **removed** (2026-08-12)

## Open (do not mark done)

1. **Tree sprite opacity** — per-style solid silhouettes if parallax bleed returns (underlay revert done; see QA #33–34)
2. **Par time revamp** — implement ground-path hybrid formula (research done; not coded)

## Commands

```powershell
cd D:\Apps\Muper_Sario_2.0
.\launch.bat
Get-ChildItem -Recurse src -Filter *.js | ForEach-Object { node --check $_.FullName }
```

http://localhost:38473/?seed=42 — regression layout · **Ctrl+F5** after module edits

## Do not

- Patch v1 · port **38472** · revert to monolithic LEVEL_1 at runtime
- Reintroduce generic green oval underlays for tree opacity (rejected + reverted — QA #34)
