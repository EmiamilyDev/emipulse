# CODING_STANDARDS

Version: 1.0
Status: Frozen
Owner: Development
Last Updated: 2026-07-06

---

# Purpose

This document defines the coding standards for Pulse MVP.

Its purpose is to ensure that every contributor writes consistent, maintainable, scalable, and production-ready code.

These standards apply to all source code within the project.

---

# Core Principles

Code should always be

- Simple
- Readable
- Maintainable
- Modular
- Predictable
- Type-safe

Prefer clarity over cleverness.

Readable code is more valuable than short code.

---

# Documentation First

Documentation is the source of truth.

Before implementing any feature

1. Review PROJECT_VISION.md
2. Review SYSTEM_ARCHITECTURE.md
3. Review DATABASE.md
4. Review DATA_PIPELINE.md
5. Review AUTOMATION_MAP.md

Code must follow documentation.

Documentation does not follow code.

---

# Technology Stack

Frontend

- Next.js 15 (App Router)
- React 19
- TypeScript

UI

- Tailwind CSS
- shadcn/ui
- Lucide Icons

Backend

- Supabase

Storage

- Supabase Storage

Authentication

- Supabase Auth

---

# Project Structure

```
app/
components/
features/
hooks/
lib/
services/
types/
styles/
docs/
prompts/
```

Every folder must have a clear responsibility.

Avoid placing unrelated code together.

---

# Naming Convention

Files

kebab-case

Examples

event-card.tsx

artist-profile.tsx

create-event.ts

---

Components

PascalCase

Examples

EventCard

HeroBanner

GalleryGrid

---

Functions

camelCase

Examples

createEvent()

getArtist()

publishNews()

---

Variables

camelCase

Examples

eventDate

artistProfile

featuredEvent

---

Constants

UPPER_SNAKE_CASE

Examples

MAX_UPLOAD_SIZE

DEFAULT_THEME

---

Database

Tables

snake_case

Columns

snake_case

Primary Keys

UUID

---

TypeScript

Always define types.

Avoid using

```
any
```

Prefer

- interfaces
- type aliases
- generics

Strict mode must remain enabled.

---

# Components

Components must be

- Small
- Reusable
- Stateless whenever possible

Avoid components exceeding 250 lines.

Extract reusable logic.

---

# Business Logic

Business logic must never exist inside UI components.

Business logic belongs in

- services
- server actions
- utility functions

UI components should only render data.

---

# Data Fetching

Use Server Components whenever possible.

Client Components should only be used when interaction is required.

Prefer server-side rendering over unnecessary client-side fetching.

---

# State Management

Prefer

1. Server State
2. URL State
3. Local Component State

Avoid unnecessary global state.

Introduce global state only when clearly required.

---

# Forms

Use

React Hook Form

Validation

Zod

Forms must validate

- Client-side
- Server-side

---

# Error Handling

Every operation should handle

- Loading
- Success
- Error
- Empty

Errors should provide meaningful messages.

Never expose internal implementation details.

---

# Logging

Use

console.log()

only during development.

Remove unnecessary logs before production.

System events belong in

activity_logs

not browser console.

---

# API Design

API routes should

- Validate inputs
- Return typed responses
- Handle errors gracefully

Never expose sensitive data.

---

# Supabase

Always access the database through reusable services.

Avoid duplicated queries.

Prefer reusable helper functions.

---

# Storage

Store

Files

↓

Supabase Storage

Metadata

↓

Supabase Database

Never store image URLs without database references.

---

# Styling

Use

Tailwind CSS

Do not write inline styles unless unavoidable.

Prefer utility classes.

Avoid duplicated styling.

---

# UI Components

Use

shadcn/ui

as the primary UI library.

Create custom components only for Pulse-specific functionality.

---

# Accessibility

Every UI should support

- Keyboard navigation
- Focus states
- Semantic HTML
- Accessible labels

Accessibility is required, not optional.

---

# Performance

Optimize for

- Fast loading
- Small bundles
- Image optimization
- Server Components
- Lazy loading where appropriate

Avoid premature optimization.

---

# Security

Never

- Hardcode secrets
- Expose API keys
- Trust client input

Always validate data on the server.

Use environment variables for sensitive values.

---

# Git Standards

Commit frequently.

Each commit should represent one logical change.

Examples

feat(events): add event management

fix(auth): resolve session issue

docs(database): update relationships

refactor(gallery): simplify upload flow

Avoid generic commit messages.

---

# Code Review Checklist

Before merging

- Documentation matches implementation
- TypeScript passes
- Lint passes
- Build passes
- Responsive layout verified
- Accessibility considered
- No duplicated code
- No unnecessary dependencies

---

# Dependencies

Before adding a package ask

1. Can the existing stack solve this?

2. Is the dependency actively maintained?

3. Does it reduce complexity?

4. Is it necessary for MVP?

If not,

do not install it.

---

# Refactoring

Refactor only when

- Readability improves
- Complexity decreases
- Duplication is removed

Do not refactor unrelated code.

---

# Testing

Before release verify

- Happy Path
- Validation
- Error States
- Responsive Layout
- Authentication
- CRUD Operations

Testing should cover user workflows rather than implementation details.

---

# Development Rules

Always

- Reuse existing components
- Follow the Design System
- Follow the Database Schema
- Follow the Automation Map
- Keep code modular

Never

- Duplicate business logic
- Duplicate UI components
- Bypass the architecture
- Ignore documentation
- Introduce unnecessary abstractions

---

# Definition of Done

A feature is complete when

- Documentation is accurate
- Code follows project standards
- TypeScript passes
- Lint passes
- Build succeeds
- Responsive layout is verified
- Accessibility has been considered
- No duplicated business logic exists
- Feature satisfies MVP requirements

---

# Completion Criteria

The coding standards are complete when

- Every contributor follows the same conventions.
- GitHub Copilot generates consistent code.
- The codebase remains readable and maintainable.
- New features integrate without changing the existing architecture.