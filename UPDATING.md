# Updating the Vision stack site

Everything on the page is drawn from **`data/stack.json`**. A daily refresh only edits that file and does not touch HTML or JS.

## Top-level keys
| Key | What |
|---|---|
| `schemaVersion` | Currently `1`. |
| `lastUpdated` / `lastUpdatedLabel` | ISO time with offset, plus the Eastern-time label shown in the header (e.g. `Oct 22, 2026, 8:55 AM ET`). |
| `projects[]` | `id`, `name`, `domain`, `filled` (true once mapped), `summary`. Tabs come from this list. |
| `layers[]` | Display order of stack layers: `id`, `name`, `icon` (globe, server, window, cpu, plug, db, mail, money, chart, code). |
| `components[]` | One entry per piece (see below). |
| `bots[]` | `id`, `name`, `role`, `touches[]` (component ids), `confirmed`, `notes`. People can be listed too (`kind: "person"`). |
| `flows{project: [steps]}` | Customer request flow: `step`, `title`, `icon`, `components[]`, `detail`. |
| `changes[]` | Recently added or changed strip: `date` (YYYY-MM-DD or null when unconfirmed), `project` (id or `shared`), `text`. Newest first on screen. |
| `watch{project: [text]}` | "Worth a look" notes (savings and risks). |

## Component fields
| Field | Meaning |
|---|---|
| `id` | Unique, kebab-case. |
| `projects[]` | Project ids that use it. Add `"shared"` for account-level tools. Anything in 2+ projects shows under "Shared across projects". |
| `layer` | One of the `layers[].id`. |
| `name` / `short` | Full name (detail sheet) and short label (tile). Keep `short` to 1-3 words. |
| `logo` | File name in `assets/logos/` without `.svg` (Simple Icons, white). Empty = generic layer icon. |
| `color` | Tile background (brand hex). |
| `status` | `live`, `test`, `not used`, `parked`, ... (non-live shows a badge). |
| `cost` | `{monthly: number or null, basis: "where the number came from", kind}`. `kind` is `list-price`, `free`, `included`, or `unknown`. Never guess. Use `unknown` + null when not verified. Subscription costs only, never revenue. |
| `owner` | `{bots: [names], person: "who owns the account"}`. |
| `lives` | `{repo, url, dashboard}`. Any can be omitted. |
| `links[]` | Extra `{label, url}`. |
| `confirmed` | `false` shows a red "unconfirmed" badge. |
| `notes` | Plain-language explanation (shown only in the detail sheet). |
| `lastVerified` | YYYY-MM-DD. |
| `connects[]` | Component ids this one sends to (drives the flowchart arrows). |
| `overlapGroup` | Same value on 2+ components = flagged as overlapping tools (e.g. `invoicing`, `email`). |

## Rules
- No secrets, keys, env var values, prices/markups, supplier names, or revenue. Env var **names** are OK.
- Totals are computed in the browser from known `cost.monthly` values.
- Site is noindex + robots.txt disallow. Keep it that way.
- `greyoakventures.github.io` is Vision itself (this site). Never list it as part of Grey Oak or any other project; it stays `projects: ["shared"]` (component `vision-pages`).
- `greyoakventures@gmail.com` is the account used only for website and service signups (Render, GoatCounter, Porkbun, etc.). Describe it that way when it appears as an account owner.
