# Branch Automation Upgrade Deliverable

This document tracks the full discovery-to-documentation work for the new branch management tooling. All recommendations assume PowerShell 7+, `git`, and `gh` CLI availability inside the Portfolio OS repo root.

---

## 1. Baseline Audit & Gap Report

### 1.1 `create-branch-from-develop.ps1`

**Strengths**
- Enforces creation from `develop`, including automatic checkout/pull (`Ensure-DevelopBranch`).
- Generates semantic names that include issue number + sanitized GitHub issue title, and lets callers override via `-BranchName` / `-Type`.
- Provides dry-run switch and interactive safeguards when detecting existing branches.
- Emits next-step guidance to push branch and open PRs.

**Gaps / Risks**
- No remote interaction: does not push or set upstream, and does not detect diverged local state.
- Blocking prompts (`Read-Host`) make the script unfriendly for automation pipelines.
- Naming is limited to hard-coded `type/issue-title` format and duplicates logic that exists elsewhere (e.g., in `manage-branches.ps1`).
- Missing telemetry/log export, so larger workflows cannot consume structured results.

### 1.2 `manage-branches.ps1`

**Strengths**
- Multi-operation surface (`create`, `rename`, `update`, `validate`, `list`) backed by reusable helpers (`Validate-BranchName`, `Ensure-DevelopBase`, `Get-IssueTitle`).
- Supports presets (blog/dashboard/docs/infra) so operators can batch-create branches tied to curated issue ranges.
- Offers dry-run mode and per-branch validation feedback when listing branches.
- Provides rudimentary rename/update flows to enforce naming policy post-facto.

**Gaps / Risks**
- No awareness of remote branches: cannot prune, compare divergence, or clean up merged/stale branches.
- Batch creation still forces linear execution with no summary export besides stdout; failures stop momentum.
- Validation logic is embedded locally; other scripts (issue pipeline, automation) reimplement the same checks.
- No conflict-safe `develop` sync beyond `git pull origin develop`; no option to rebase/merge existing feature branches.
- Limited presets and no external configuration file for large campaigns.

### 1.3 Cross-Script Touchpoints

- `scripts/issue-management/management/run-issue-pipeline.ps1` hard-calls `create-branch-from-develop.ps1` during step 2 of the workflow, so any interface change there cascades through project automation.
- `scripts/issue-management/create-issue-enhanced.ps1` already generates branches (and pushes) while filing issues, duplicating functionality in branch tools.
- `scripts/housekeeping/clean-house-*.ps1` perform lightweight branch hygiene (ensuring caller is on `develop`, pruning caches), but lack deeper branch analytics.

**Pain Points Observed**
1. **Duplication** – branch naming, develop sync, and gh issue lookups exist in multiple scripts with slight differences, increasing drift risk.
2. **Lack of remote hygiene** – no tooling monitors merged/stale branches, mismatched upstreams, or orphaned remote refs.
3. **Manual conflict handling** – developers must rebase/merge manually; automation provides no guided helper.
4. **Limited reporting** – stakeholders cannot obtain structured reports (JSON/CSV) describing branch health or batch operations.

---

## 2. Designed Workflows & Scripts

### 2.1 `branch-health-audit.ps1`
| Aspect | Details |
| --- | --- |
| Inputs | `-Scope` (`local`, `remote`, `all`), `-MaxAgeDays`, `-NamingPattern`, `-Output` (`table`, `json`, `csv`), `-AutoFix` switches for pruning merged locals. |
| Flow | 1) `git fetch --prune`, 2) enumerate branches (with upstream when available), 3) compute metadata (last commit date, upstream status, ahead/behind), 4) run naming validation via shared helper, 5) flag stale branches beyond `MaxAgeDays` or with missing tracking refs, 6) optionally delete merged locals when `-AutoFix`. |
| Safety | Dry-run default, confirmation prompts for destructive actions, `--force` override. |
| Output | Colorized table plus machine-readable file for dashboards. |

### 2.2 `sync-feature-branch.ps1`
| Aspect | Details |
| --- | --- |
| Inputs | `-Branch` (defaults to current), `-Base develop`, `-Strategy` (`rebase`, `merge`), `-Push` (flag), `-ForceWithLease` (flag), `-SkipTests` (optional hook). |
| Flow | 1) Ensure working tree clean (or confirm `--force`), 2) fetch base, 3) rebase/merge onto base with conflict detection, 4) pause for user to resolve conflicts (auto-open instructions), 5) rerun `git status` to ensure clean, 6) optionally run smoke script/test command, 7) push with `--force-with-lease` if strategy was rebase and user opted-in. |
| Safety | Pre-flight checks (upstream set, base exists, local commits), ability to bail out gracefully on conflicts, automatic stash/restore (optional). |
| Output | Step-by-step log plus summary object (success, commits rebased, run duration). |

### 2.3 `batch-branch-orchestrator.ps1`
| Aspect | Details |
| --- | --- |
| Inputs | `-Source develop`, `-Preset` or `-IssueList <int[]>`, `-ConfigPath issues.json`, `-Push`, `-Concurrency` (logical groups), `-ReportPath`. |
| Flow | 1) Resolve issue set (preset, CLI list, or JSON descriptor containing additional metadata), 2) hydrate each issue via GitHub API (title, labels), 3) generate branch name via shared helper pattern syntax, 4) sequentially or batched create branches from source, 5) optionally push to origin and create draft PRs, 6) log structured results (success/error, branch name, timings). |
| Safety | Auto-skip existing branches unless `-Force`, dry-run for entire batch, per-issue retry ability. |
| Output | Console progress (spinners + statuses) and aggregated JSON summary for later ingestion. |

### 2.4 Shared Considerations
- All scripts should rely on a new `branch-utils.psm1` for: GitHub issue fetch, branch name sanitizer, develop/base sync, validation, structured logging, and colored output.
- Standard parameter naming (`-DryRun`, `-Force`, `-Verbose`) to keep UX consistent.
- Provide `Invoke-BranchWorkflow.ps1` meta-script later if needed to tie flows together.

---

## 3. Implementation Blueprint

### 3.1 File Layout
```
scripts/
  branch-management/
    branch-utils.psm1          # Shared helpers (naming, gh, git wrappers, logging)
    branch-health-audit.ps1
    sync-feature-branch.ps1
    batch-branch-orchestrator.ps1
    create-branch-from-develop.ps1
    manage-branches.ps1
    README.md                  # Usage overview + link to docs site
```

`branch-utils.psm1` exports:
- `Get-IssueTitle`, `Sanitize-Name`, `Generate-BranchName`
- `Ensure-BaseBranch` (generalized from existing scripts)
- `Invoke-Git` wrapper capturing stdout/stderr for structured logging
- `Write-Color` + `Write-JsonReport`
- `Test-WorkingTreeClean`, `Test-BranchTracking`

### 3.2 Script Pseudocode

**branch-health-audit**
1. `Import-Module branch-utils`
2. `Ensure-BaseFetch -Scope $Scope`
3. `$branches = Get-Branches -Scope $Scope`
4. `foreach ($branch in $branches)` gather metadata, validate naming/age/tracking
5. Accumulate issues array; if `-AutoFix`, delete merged locals after confirmation
6. Emit table + optional report file, exit non-zero when critical issues > 0

**sync-feature-branch**
1. Pre-flight: `Test-WorkingTreeClean` unless `-Force`
2. Resolve branch/base; ensure both exist locally
3. `git fetch origin $Base`
4. `if ($Strategy -eq "rebase") { git rebase origin/$Base $Branch } else { git merge origin/$Base }`
5. Handle conflicts: pause + instructions + rerun status
6. Optional test hook (script or command parameter)
7. `if ($Push) { git push --force-with-lease origin $Branch }`
8. Emit summary JSON for other automation consumers

**batch-branch-orchestrator**
1. Load issue set from CLI/preset/JSON
2. For each issue (optionally parallelized by preset group):
   - Fetch title, determine branch name via pattern
   - `Ensure-BaseBranch -Name $Source`
   - Create branch; if `-Push`, run `git push -u origin <branch>`
   - Record results
3. Aggregate stats (success %, elapsed time) and persist to `$ReportPath`

### 3.3 Testing Strategy
- **Unit-level**: mock `git`/`gh` calls via dependency injection or transcript logs to confirm pattern substitutions and validation logic.
- **Fixture repo**: use a lightweight bare repo under `worktrees/` to simulate multiple branches; run scripts with `-DryRun` and with temporary clones.
- **Integration smoke**: create GitHub issue stub, run orchestrator dry-run, ensure JSON outputs match schema.
- **Safety validation**: confirm destructive actions require explicit flags and respect dry-run.

---

## 4. Documentation Update Plan

- **Docs site** (`apps/docs/contents/docs/scripts-reference/complete-guide/index.mdx`):
  - Add a “Branch Automation Suite” section outlining the three new scripts, cross-linking to existing `create-branch-from-develop` instructions.
  - Include parameter tables and example invocations (dry-run vs. live).
  - Embed a flow diagram or step list describing when to use health audit vs. sync vs. batch orchestrator.

- **Quick references** (`scripts/documentation/QUICK_REFERENCE.md`, `scripts/documentation/README.md`):
  - Append cheat-sheet entries for each script with one-line purpose + core command.
  - Highlight prerequisites (gh auth, clean working tree) and guardrails (`DryRun`, `ForceWithLease`).

- **In-script help**:
  - Ensure each new script exposes `Get-Help` metadata and links back to docs site for deeper instructions.

- **Changelog / release notes**:
  - Note branch tooling expansion in `apps/docs/CHANGELOG.md` or centralized release log.

Delivering these additions will close the automation gap, align workflows, and provide a clear adoption path for contributors.

