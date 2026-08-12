# AGENTS.md — Muper Sario 2.0

Conventions for AI agents working in this repository.

## Project

Greenfield extraction from v1 (`Laguna-S-2.1-MuperSario`). SMB-inspired HTML5 canvas platformer. **Procedural sprites/SFX** + **`.wav` BGM**. **No bundler** — ES6 modules over HTTP.

| Item | Value |
|------|-------|
| Workspace | `D:\Apps\Muper_Sario_2.0` |
| GitHub | https://github.com/TheyCallMeHenry/muper-sario |
| Live (Pages) | https://theycallmehenry.github.io/muper-sario/ |
| v1 archive (read-only) | `D:\Apps\Laguna-S-2.1-MuperSario` |
| Canvas | 800×600 viewport; **4800 px** default run (12 × 400 px chunks) |
| Local port | **38473** (v1 uses 38472) |
| Modules | **23** JS files under `src/` |
| Level QA | `?seed=42` for reproducible layout — see QA-FINDINGS § Phase 10–10b |
| Architecture | [`DESIGN.md`](DESIGN.md) — read before gameplay changes |

## Session start

1. Read [`SESSION-HANDOFF.md`](SESSION-HANDOFF.md)
2. Read [`docs/DOC-INDEX.md`](docs/DOC-INDEX.md) for full doc map + locked values
3. Read [`DESIGN.md`](DESIGN.md)
4. Read [`docs/EXTRACTION-MANIFEST.md`](docs/EXTRACTION-MANIFEST.md)
5. Read [`docs/V1-PITFALLS.md`](docs/V1-PITFALLS.md)
6. Read [`docs/QA-FINDINGS.md`](docs/QA-FINDINGS.md)
7. Read [`docs/RESEARCH-NOTES.md`](docs/RESEARCH-NOTES.md)
8. Call MCP `memory_session_start` with project `Muper_Sario_2.0`
9. Do not invent paths/commands — use this file

## Local development (Windows)

```powershell
cd D:\Apps\Muper_Sario_2.0
.\launch.bat
```

Manual: `python -m http.server 38473 --bind 127.0.0.1`

Open http://localhost:38473 · http://localhost:38473/test.html

**Linux/Mac:** `./launch.sh`

## Validation

```powershell
Get-ChildItem -Recurse src -Filter *.js | ForEach-Object { node --check $_.FullName }
```

Module test: http://localhost:38473/test.html — expect **23/23** pass.

Reproducible run: http://localhost:38473/?seed=42

Live test: https://theycallmehenry.github.io/muper-sario/test.html

After edits: **Ctrl+F5**. Bump `GameEngine.js?v=` in `index.html` when changing entry script (currently **v=4**).

## Documentation index

| Doc | Purpose |
|-----|---------|
| [`docs/DOC-INDEX.md`](docs/DOC-INDEX.md) | Master index + all locked determinations |
| [`DESIGN.md`](DESIGN.md) | Locked architecture |
| [`SESSION-HANDOFF.md`](SESSION-HANDOFF.md) | Phase status, commands |
| [`docs/EXTRACTION-MANIFEST.md`](docs/EXTRACTION-MANIFEST.md) | Copy vs rewrite checklist |
| [`docs/V1-PITFALLS.md`](docs/V1-PITFALLS.md) | v1 mistakes to avoid |
| [`docs/PROGRESS.md`](docs/PROGRESS.md) | Task tracker + module inventory |
| [`docs/QA-FINDINGS.md`](docs/QA-FINDINGS.md) | QA + post-QA fix log |
| [`docs/RESEARCH-NOTES.md`](docs/RESEARCH-NOTES.md) | Research + geometry + SMB scale + **Phase 10b** |
| [`assets/README.md`](assets/README.md) | BGM path, mute, design reference images |

## Implementation rules

- Follow **DESIGN.md** — update it before architectural changes
- **Minimize scope** — smallest correct diff
- **Copy manifest** — copy proven modules; rewrite listed files fresh
- **Do not patch v1** — read-only reference
- **Do not copy** v1 `GameScene.js` or `Pipe.js` wholesale
- **Do not reintroduce** spawn timer or `player.x + 400` pipe spawn
- **Free tools only**
- **Do not commit** unless user explicitly asks
- Keep `SESSION-HANDOFF.md` ≤80 lines
- **Do not** use generic green oval underlays for tree opacity (rejected Phase 10b — see RESEARCH-NOTES §10b)

## Do not

- Use port **38472** (v1)
- Contradict locked scoring: base = coin + stomp; final = base × time mult on win only
- Mix NES absolute pixel counts with v2 counts without the 3× scale factor (see RESEARCH-NOTES § SMB visual scale)
