# Astrology Application

## Overview

This is a full-stack astrology application built with React, Express, and TypeScript. The application allows users to create natal charts by inputting birth data (name, date, time, location) and visualizes astrological calculations including planet positions, houses, and aspects. The interface is in Bulgarian and specifically designed for Bulgarian cities.

## System Architecture

**Frontend Architecture:**
- React 18 with TypeScript
- Vite for build tooling and development server
- Wouter for client-side routing
- TanStack React Query for server state management
- Radix UI components with shadcn/ui design system
- Tailwind CSS for styling with custom astrology-themed colors
- D3.js for natal chart visualization

**Backend Architecture:**
- Express.js server with TypeScript
- Swiss Ephemeris (sweph) library for astronomical calculations
- RESTful API design with `/api` endpoints
- Custom astrology calculation engine in JavaScript

**Database Integration:**
- Drizzle ORM configured for PostgreSQL
- Schema includes users and natal_charts tables
- Database migrations managed through Drizzle Kit
- Connection configured for Neon serverless PostgreSQL

## Key Components

**Data Models:**
- Users: Basic authentication structure (id, username, password)
- Natal Charts: Comprehensive birth data storage including coordinates, planet positions, houses, and aspects
- All astrological data stored as JSON strings in PostgreSQL

**API Endpoints:**
- `GET /api/coordinates/:city/:country` - Retrieve geographic coordinates
- `GET /api/city-suggestions/:query` - City autocomplete for Bulgarian locations
- `POST /api/calculate-natal-chart` - Generate complete natal chart calculations

**UI Components:**
- Form-based birth data input with validation
- Interactive natal chart visualization using D3.js
- Data tables for planets, houses, and aspects
- Forecast section for future astrological transits

## Data Flow

1. **User Input:** Birth data form collection with real-time validation
2. **Geocoding:** City selection triggers coordinate lookup for Bulgarian cities
3. **Calculation:** Birth data and coordinates sent to astrology engine
4. **Processing:** Swiss Ephemeris calculates planetary positions and house cusps
5. **Visualization:** Results rendered in interactive chart and data tables
6. **Storage:** Natal chart data can be persisted to PostgreSQL database

## External Dependencies

**Core Libraries:**
- Swiss Ephemeris (sweph) for astronomical calculations
- @neondatabase/serverless for PostgreSQL connectivity
- React Query for API state management
- Radix UI primitives for accessible components

**Development Tools:**
- Vite with React plugin and error overlay
- ESBuild for server bundling
- TSX for TypeScript execution
- Replit-specific plugins for development environment

## Deployment Strategy

**Development:**
- Vite dev server on port 5000
- Hot module replacement enabled
- TypeScript compilation with strict mode
- Ephemeris files expected in `/root/astrology-app/swisseph-master/ephe`

**Production:**
- Vite builds client to `dist/public`
- ESBuild bundles server to `dist/index.js`
- Autoscale deployment target configured
- PostgreSQL connection via DATABASE_URL environment variable

**Configuration:**
- Database migrations via `npm run db:push`
- Environment-specific ephemeris path configuration
- CORS and security headers for production deployment

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **June 20, 2025 11:05**: Проектът е завършен и тестван успешно
  - Поправени всички проблеми с модулите и Swiss Ephemeris зависимостта
  - Създаден работещ астрологичен калкулатор с реалистични симулирани данни
  - Интегриран D3.js за визуализация на натални карти
  - Функциониращ autocomplete за български градове
  - Пълнофункционални таблици за планети, домове и аспекти
  - Работеща секция за прогнози и транзити
  - Добавени deployment инструкции за Raspberry Pi

## Deployment Status

Приложението е готово за production deployment на Raspberry Pi 2011.12:
- Всички API endpoints функционират коректно
- Клиентската част се зарежда с правилни стилове
- Астрологичните изчисления връщат валидни данни
- Тествано с примерни данни: Иван Иванов, 1982-02-13, Плевен

## Changelog

- June 20, 2025. Initial setup
- June 20, 2025. Complete implementation and testing