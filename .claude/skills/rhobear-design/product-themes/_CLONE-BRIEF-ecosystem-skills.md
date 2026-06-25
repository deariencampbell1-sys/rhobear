cd C:\Users\slang\rhobear

You are the second instance of the RHOBEAR marketing/design Iron Man — same designer, same
taste, same lane. We're building out the **product ecosystem theme skills** together. The
front-page relay (`.claude/skills/rhobear-design/ui_kits/marketing-site/index.html`, the
`#workflow` section) is the spine; it's done. Now each of the six relay stops gets a
**per-product theme-handoff skill** so every product's own surface reads as the same world.

I've authored the master map + my half. **Your half: author three skills.**

## Read these first (do not duplicate them, inherit from them)
1. `.claude/skills/rhobear-design/product-themes/ECOSYSTEM-MAP.md` — the relay graph,
   locked accents/bear-tints/verbs, and the exact handoff wording. This is the source of truth.
2. `.claude/skills/rhobear-design/product-themes/reviews.md` — the **format template + the
   gold-standard bar**. Match its YAML frontmatter and its section headings EXACTLY
   (§0 Inheritance · §1 The one feeling · §2 Theme layer tokens · §3 Motion · §4 Voice & the
   relay · §5 Components · §6 Acceptance · handoff footer).
3. `.claude/skills/rhobear-design/product-themes/hub.md` + `plans.md` — my two, for the house style.
4. The front-page card for each of your products (in `index.html #workflow`) — quote its real
   desc/chips/handoff; don't invent product facts.

## Your three skills (create these files)

### `product-themes/designs.md` — stop 2
- accent **red `#e94560`**, `--bear-tint: hue-rotate(180deg) saturate(1.25)`, verb **"Shape it"**.
- Name: **RHOBEAR Designs** · meta "Open source · MIT". Surface: `github.com/deariencampbell1-sys/rhobear-designs`.
- Shares navy `#1A1A2E` with SunSponge (they're a pair).
- One feeling: the infinite canvas where you **finish the last 10% by hand** — drag it, swap a
  font, fix the one color, no model round-trip; touches real JS/CSS/HTML with hidden embeds
  without wrecking them. Local-LLM stub or your own key via OpenRouter. MIT forever.
- Relay: **receives from Hub** ("Got something built? Hand it to Designs to make it yours.")
  · **hands off to SunSponge** ("Looks the way you want? Rest the finished site in SunSponge.").

### `product-themes/sunsponge.md` — stop 3
- accent **amber `#f5a524`**, `--bear-tint: hue-rotate(235deg) saturate(1.3)`, verb **"Capture it"**.
- Name: **SunSponge Captures** · meta "Open source · **not AI**" (deterministic capture tool,
  not an LLM — keep this honest). Surface: `github.com/deariencampbell1-sys/sunsponge`.
- Shares navy `#1A1A2E` with Designs.
- One feeling: the cheap, fast picture-taker. Feed it a map, it soaks a finished site into
  clean screenshots in one pass — every page, every state — for almost nothing. A swarm of
  captors; results pour into Remotion to cut hundreds of videos.
- Relay: **receives from Designs** ("Rest the finished site in SunSponge.") · runs **parallel
  to Reviews** ("All the while, every PR runs through Reviews.") — SunSponge captures while
  Reviews gates; not a sequential hand-off, a concurrent one.

### `product-themes/sales.md` — stop 6 (closes the loop)
- accent **blue `#60a5fa`**, `--bear-tint: hue-rotate(55deg) saturate(1.25)`, verb **"And it
  sells itself"**. Name: **Sales, by RHOBEAR** · meta "our sales chatbot". Surface: `sales.rhobear.ai`.
- One feeling: done-for-you, white-glove — "this page is me doing it." The greeting bot runs on
  a tiny **Qwen-3B**, no rented server, no hosting, just a domain. $47 one-time. **Saguaro is a
  client/example, never the brand. Never name a competitor.**
- Relay: **receives from Plans** ("And the rep that answers your leads? Sales proves it closes.")
  · **loops back to Hub** ("↺ … and back to the Hub for the next product.") — Sales closes the
  loop; say so, and link home.

## Rules (same as the page work)
- Branch **`teal-retheme`**. Active checkout is **`C:\Users\slang\rhobear`** only — never `D:\rhobear`.
- You author **only these three `.md` files** in `product-themes/`. Do NOT touch `shell.css`,
  `shell.js`, `colors_and_type.css`, `index.html`, or any other `.md` — those are mine.
- Every skill MUST carry its two relay lines from ECOSYSTEM-MAP §2 (inbound + outbound), a link
  home to `rhobear.ai`, and the front-page `.chips` recipe re-accented. A surface that doesn't
  name where work came from and where it goes is an orphan, not a stop.
- Honest framing (MAP §4): BYO-key / own-your-data, no fake numbers, no hype, allies named
  warmly, competitors never. Local models honest about themselves.
- Match `reviews.md` length and density (~110 lines). Voice = the front page is the bar.
- Commit to `teal-retheme` with a clear message + `Co-Authored-By`. **Do NOT push main. Do NOT
  deploy.** I do the unification + the single deploy after we meet in the middle.

When all three are committed, reply "ecosystem skills: designs / sunsponge / sales done on
teal-retheme" and stop.
