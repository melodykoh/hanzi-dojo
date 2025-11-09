# Hanzi Dojo (漢字道場)

A dojo-themed Mandarin learning companion for children to master Simplified and Traditional characters through disciplined practice.

## Overview

Hanzi Dojo helps children build consistent progress with:
- **Drill A (Zhuyin Recognition):** Practice pronunciation with tone accuracy
- **Drill B (Traditional Mapping):** Recognize Traditional forms for Simplified characters
- **Belt Progression:** Earn ranks through focused practice (White → Black)
- **Parent Console:** Track progress, add characters, monitor analytics

## Quick Start

### Prerequisites
- Node.js 16+
- Supabase account (free tier)

### Installation

```bash
# Clone repository
cd hanzi-dojo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Build for Production

```bash
npm run build
```

Output will be in `/dist` directory.

## Project Structure

```
/
├── src/               # Application source code
│   ├── components/    # React UI components
│   ├── lib/          # Services and business logic
│   ├── types/        # TypeScript definitions
│   └── test/         # Test utilities and mocks
├── docs/             # Product specifications
│   └── operational/  # QA and testing guides
├── supabase/         # Database migrations
└── data/             # Dictionary seed data
```

## Documentation

- **Product Overview:** [`docs/HANZI_DOJO_OVERVIEW.md`](docs/HANZI_DOJO_OVERVIEW.md)
- **Requirements:** [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md)
- **Design & UI Guide:** [`docs/DESIGN_AND_UI.md`](docs/DESIGN_AND_UI.md)
- **Technical Specs:** [`docs/TECH_AND_LOGIC.md`](docs/TECH_AND_LOGIC.md)
- **Development Setup:** [`docs/DEVELOPMENT_AND_DEPLOYMENT.md`](docs/DEVELOPMENT_AND_DEPLOYMENT.md)
- **Project Roadmap:** [`docs/ROADMAP.md`](docs/ROADMAP.md)
- **Current Progress:** [`CLAUDE.md`](Claude.md)

## Tech Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Supabase (Postgres + Auth + RLS)
- **Testing:** Vitest + React Testing Library
- **Deployment:** Vercel (frontend) + Supabase Cloud (backend)

## Key Features

✅ Character-first Zhuyin recognition drills with tone accuracy
✅ Simplified → Traditional character mapping practice
✅ Dictionary-assisted entry with auto-fill
✅ Familiarity scoring (+1.0 first try, +0.5 second try)
✅ Belt progression system (White → Black)
✅ Full-screen landscape training mode for kids
✅ Offline detection with dojo-themed pause modal
✅ Parent dashboard with metrics and analytics

## Current Status

**Version:** V1 (Epic 6 - QA & Release Readiness)
**Progress:** 119 of 145 story points complete (82%)

See [`CLAUDE.md`](Claude.md) for detailed status and next steps.

## Testing

```bash
# Run automated tests
npm run test

# Run tests in watch mode
npm run test:watch

# Manual QA checklist
See docs/operational/QA_MANUAL_ONLY.md
```

## Philosophy

> "The dojo is not a game; it's a place of practice."

Hanzi Dojo emphasizes **focus and accuracy over speed**, rewarding disciplined practice with visible progress through belt ranks. Each session builds toward mastery, one character at a time.

## License

Private project - Not licensed for public distribution

## Contact

For questions or feedback, contact the project owner.
