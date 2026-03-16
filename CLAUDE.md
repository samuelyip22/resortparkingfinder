# CLAUDE.md — Project Briefing

## Who I Am
I am a complete beginner to coding. I understand concepts when explained clearly,
but I don't have prior experience with terminals, frameworks, or syntax. Assume I
need context on anything technical.

## How to Work With Me
- **Always show me a plan before writing any code.** List the steps you're about
  to take and ask me to confirm before proceeding.
- **Explain what you're building as you go.** One or two sentences per file or
  major decision is enough — just don't go silent.
- **When I need to make a choice, give me options as a numbered list** with a
  clear recommendation and why.
- **Never assume I know what a term means.** If you use a technical word, define
  it briefly in plain English the first time.
- **If something could break or delete data, stop and warn me explicitly.**

## My Priorities
1. Clean, readable code — no clever shortcuts that are hard to follow later
2. Ship fast — working beats perfect
3. Well-commented code — add inline comments so I can learn what each part does
4. Mobile-friendly by default — all UIs should work on phone and desktop

## Default Tech Stack
- **Framework:** Next.js (use this unless I say otherwise)
- **Styling:** Tailwind CSS
- **Database:** Supabase
- **Payments:** Stripe
- **Hosting:** Vercel (deploy via GitHub)
- **Language:** JavaScript (not TypeScript until I'm more comfortable)

## When Uncertain
If you're unsure about my intent, or if there are multiple valid approaches,
stop and ask. Don't guess on anything structural. For small decisions (variable
names, minor formatting), use your judgment.

## What I'm Building
I primarily build:
- Web apps and SaaS tools
- AI-powered products
- Content sites and directories
- Personal productivity tools

My current project focus is **web scraping tools** — things that monitor websites,
check for availability, and send alerts. My first project is a **resort parking
spot finder** that checks a reservation system for open spots and notifies me
when one becomes available.

## Web Scraping Rules
- Always check if a site has a public API before scraping the HTML directly
- Respect `robots.txt` and rate limits — never hammer a server
- Add delays between requests (minimum 2–3 seconds)
- Store scraped data cleanly — don't just dump raw HTML

## Project Folder Structure
Follow this structure for every project:
```
/my-project
  /app          → Next.js pages and routes
  /components   → Reusable UI pieces
  /lib          → Utility functions, API calls, scrapers
  /public       → Images and static files
  .env.local    → API keys (never commit this to GitHub)
  CLAUDE.md     → This file
```

## Environment Variables
Never hardcode API keys. Always use `.env.local` and reference them as
`process.env.VARIABLE_NAME`. Remind me to add new variables to `.env.local`
when they're needed.

## Git Habits
- After completing each meaningful feature, suggest a commit message
- Keep commits small and descriptive
- Never commit `.env.local`
- After each completed feature, run `git add .`, suggest a commit message,
  and ask me if I want to push to GitHub.