# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Soroban for School is a React-based Progressive Web App (PWA) that teaches mental math using the Soroban (Japanese abacus) method. The app is structured as a gamified learning platform with multiple books, chapters, and difficulty levels for students.

## Development Commands

```bash
# Development
npm run dev              # Start Vite dev server (default: http://localhost:5173)

# Build & Deploy
npm run build           # Build for production (outputs to ./dist)
npm run preview         # Preview production build locally
npm run deploy          # Deploy to GitHub Pages (runs build then gh-pages)

# Linting
npm run lint            # Run ESLint on the codebase
```

## Architecture

### Frontend Structure

- **React 19** with **Vite** as the build tool
- **React Router (HashRouter)** for client-side routing
  - Uses HashRouter specifically for GitHub Pages deployment compatibility
  - Routes: `/login`, `/` (home), `/quiz`
- **Supabase** for backend services (authentication, edge functions)
- **Tailwind CSS** for styling (v4 with Vite plugin)
- **PWA Support** via vite-plugin-pwa with offline capabilities

### Authentication Flow

The app uses Supabase Auth with a custom `<Protected>` component wrapper:
- Unauthenticated users are redirected to `/login`
- Auth state is managed globally via Supabase's `onAuthStateChange` listener
- Session checking happens on mount with a loading state
- Client initialization in `src/supabaseClient.js` using environment variables

### Internationalization (i18n)

Bilingual support (English/Thai) implemented via React Context:
- `src/LanguageContext.jsx` contains:
  - `translations` object with all UI strings
  - `chapterTitlesTH` for Thai chapter titles
  - `useLanguage()` hook for accessing current language and toggle function
- All UI text should use the `t` object from `useLanguage()`

### Quiz Generation System

The quiz system has a unique architecture:

1. **Frontend Request** (`src/api/questionApi.js`):
   - `generateQuestions()` calls Supabase Edge Function with parameters: `book`, `chapter`, `numQuestions`, `numNumbers`

2. **Backend Generation** (`supabase/functions/quiz-generator/index.ts`):
   - Deno-based edge function that generates questions algorithmically
   - Each book/chapter combination has a dedicated generation function
   - Questions are generated with validation to ensure they're mathematically valid for the Soroban method
   - Functions use a two-phase approach: attempt to generate unique questions, then fill with repeats if needed
   - Returns array of `{q: string, a: string}` objects

3. **Quiz Display** (`src/pages/QuizPage.jsx`):
   - Displays questions with Soroban board visualization
   - Supports flash cards, voice dictation, timer modes
   - Uses audio feedback for correct/incorrect answers

### Key Components

- `src/components/quiz/SorobanBoard.jsx`: Visual representation of the Soroban abacus
- `src/pages/HomePage.jsx`: Main navigation hub with chapter selection, settings, lessons
- `src/pages/QuizPage.jsx`: Quiz interface with question display, answer input, results
- `src/pages/LoginPage.jsx`: Authentication interface

### Environment Variables

Required in `.env.local`:
```
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

These are consumed via `import.meta.env.VITE_*` (Vite's env variable pattern).

### Styling Approach

- Tailwind CSS v4 (using @tailwindcss/vite plugin)
- Component-specific CSS files exist for complex layouts:
  - `src/components/quiz/quiz.css`
  - `src/components/quiz/soroban.css`
- Global styles in `src/index.css`

### Supabase Configuration

Local development setup exists in `supabase/` directory:
- `config.toml`: Local Supabase configuration
- `functions/quiz-generator/`: Edge function for question generation
- Run local Supabase: `supabase start` (if Supabase CLI is installed)

## Important Patterns

### Adding New Chapters

When adding new chapter functionality:
1. Create generation function in `supabase/functions/quiz-generator/index.ts` following naming pattern `randomChapter{N}{Description}`
2. Add function to the appropriate book's generator mapping
3. Update `chapterTitlesTH` in `src/LanguageContext.jsx` if needed
4. Ensure the function validates question constraints for the Soroban method (e.g., digits 0-4 for lower beads only)

### PWA Configuration

PWA manifest is configured in `vite.config.js`:
- Icons must exist in `/public` folder
- Theme color matches the dark theme: `#111827`
- Update manifest when changing app name or description

### Deployment

The app deploys to GitHub Pages:
- Base path is `/` (configured in vite.config.js)
- Uses HashRouter for proper routing on static hosting
- Deploy command: `npm run deploy` (builds then pushes to gh-pages branch)

## Code Conventions

- Component files use `.jsx` extension
- Components are in PascalCase
- API/utility files use camelCase
- Imports use relative paths from `src/`
- Supabase client is imported from `src/supabaseClient.js` (singleton instance)
