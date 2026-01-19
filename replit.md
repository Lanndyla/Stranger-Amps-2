# DJENT SLAYER - Amp Simulator

https://replit.com/@strangerdangerd/Djent-Engine-X

## Overview

DJENT SLAYER is a web-based guitar amplifier simulator designed for extended range guitars and low tunings (7, 8, 9 string djent guitars). The application provides a skeuomorphic interface mimicking professional guitar amp hardware, featuring realistic rotary knobs, toggle switches, LED indicators, and cabinet simulation with impulse response (IR) selection.

The app is a single-screen, no-scroll experience that renders an amp head with controls (gain, EQ, overdrive, master volume) sitting on a virtual 4x12 speaker cabinet. Users can save and load presets for their amp settings.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React useState for local UI state
- **Styling**: Tailwind CSS with custom dark theme optimized for skeuomorphic amp design
- **UI Components**: shadcn/ui component library (New York style variant) with Radix UI primitives
- **Build Tool**: Vite with React plugin

**Design Pattern**: The frontend follows a component-based architecture with custom amp-specific components (RotaryKnob, ToggleSwitch, LEDIndicator, GainMeter) that provide tactile, realistic controls. The main page (`amp-simulator.tsx`) orchestrates the amp head and cabinet components.

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Style**: RESTful JSON API
- **Development**: Vite middleware for HMR during development

**Endpoints**:
- `GET /api/presets` - Fetch all presets
- `GET /api/presets/:id` - Fetch single preset
- `POST /api/presets` - Create new preset
- `DELETE /api/presets/:id` - Delete preset

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts`
- **Current Storage**: In-memory storage (`MemStorage` class) with factory presets initialized on startup
- **Database Ready**: PostgreSQL schema defined, ready for database provisioning via `drizzle-kit push`

**Data Models**:
- `Preset`: id, name, settings (JSONB), isFactory flag
- `AmpSettings`: Input gain, EQ (bass/mid/treble/presence), overdrive controls (drive/punish/+10dB/+LOW), master volume, IR selection, routing mode

### Validation
- **Library**: Zod for runtime schema validation
- **Integration**: drizzle-zod for database schema to Zod conversion
- **Shared Schemas**: Both frontend and backend share validation schemas from `@shared/schema`

### Build System
- **Client Build**: Vite outputs to `dist/public`
- **Server Build**: esbuild bundles server code with dependency optimization for cold start performance
- **Scripts**: `npm run dev` (development), `npm run build` (production build), `npm run db:push` (database migrations)

## External Dependencies

### Database
- PostgreSQL (configured via `DATABASE_URL` environment variable)
- Drizzle ORM for database operations
- connect-pg-simple for session storage (available but not currently used)

### UI Framework
- Radix UI primitives (dialog, select, slider, switch, toast, tooltip, etc.)
- Embla Carousel for carousel components
- Lucide React for icons
- class-variance-authority for component variants

### Fonts (Google Fonts)
- Rajdhani: Primary display font for amp labels
- Roboto Mono: Monospace font for parameter values
- Inter: Secondary font for settings/menus

### Development Tools
- Replit-specific Vite plugins for dev banner and error overlay
- TypeScript with strict mode
- Path aliases configured: `@/*` → client/src, `@shared/*` → shared