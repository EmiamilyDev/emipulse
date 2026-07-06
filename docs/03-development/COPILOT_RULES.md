# COPILOT_RULES

Version: 1.0
Status: Frozen
Owner: Development
Last Updated: 2026-07-06

---

# Purpose

This document defines how GitHub Copilot should assist development for Pulse MVP.

Copilot is an implementation assistant.

Copilot does not make product decisions.

All generated code must follow the project documentation.

---

# Project Context

Project Name

Pulse

Product

Modern digital home for artist fans.

Purpose

Provide a clean, organized, and maintainable platform where fans can discover an artist's public activities, events, galleries, and news.

---

# Documentation Priority

Before implementing any feature, always follow this order.

1. PROJECT_VISION.md
2. PROJECT_CONSTRAINTS.md
3. ROADMAP.md
4. SYSTEM_ARCHITECTURE.md
5. DATABASE.md
6. DATA_PIPELINE.md
7. AUTOMATION_MAP.md
8. DESIGN_SYSTEM.md
9. CODING_STANDARDS.md

Documentation is the single source of truth.

If generated code conflicts with documentation, documentation always wins.

---

# Project Principles

Always prioritize

- Simplicity
- Readability
- Maintainability
- Reusability
- Consistency
- Type Safety

Prefer stable solutions over clever solutions.

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

# Implementation Rules

Always

- Follow the existing architecture.
- Reuse existing components.
- Reuse existing services.
- Use TypeScript.
- Keep components modular.
- Keep functions focused.
- Prefer composition over duplication.

Never

- Introduce new architecture.
- Create unnecessary abstractions.
- Rewrite existing modules without reason.
- Rename existing database structures.
- Break existing conventions.

---

# UI Rules

Always

- Follow DESIGN_SYSTEM.md.
- Use shadcn/ui as the base component library.
- Create custom components only when required by the product.
- Maintain responsive layouts.
- Support loading, empty, and error states.

Never

- Redesign the interface.
- Introduce a different visual style.
- Duplicate UI components.

---

# Database Rules

Database schema is frozen.

Current tables

- artists
- social_accounts
- events
- gallery
- news
- activity_logs
- settings

Never

- Rename tables.
- Rename columns.
- Create duplicate data.
- Add new tables unless explicitly requested.

Always respect relationships defined in DATABASE.md.

---

# Data Rules

Database is the source of truth.

Never

- Store duplicated business data.
- Bypass the database.
- Hardcode content.

Business data always originates from Supabase.

---

# Automation Rules

Always follow AUTOMATION_MAP.md.

Examples

Publishing an Event should update

- Homepage Hero
- Upcoming Events
- Activity Timeline

Do not implement alternative automation flows.

---

# Component Rules

Components should be

- Small
- Reusable
- Stateless whenever possible

Prefer composition over inheritance.

Avoid components larger than approximately 250 lines.

Extract reusable logic.

---

# Business Logic

Business logic must never exist inside UI components.

Business logic belongs in

- services
- server actions
- utilities

UI components should render data only.

---

# Data Fetching

Prefer

Server Components

Use Client Components only when interaction is required.

Avoid unnecessary client-side fetching.

---

# Forms

Use

- React Hook Form
- Zod

Validate

- Client
- Server

Never trust client input.

---

# Error Handling

Every feature should support

- Loading
- Success
- Error
- Empty

Display meaningful feedback.

Never expose internal implementation details.

---

# Security

Never

- Hardcode secrets.
- Expose API keys.
- Trust client input.

Always

- Use environment variables.
- Validate server-side.
- Follow Supabase authentication.

---

# Dependencies

Before introducing a new dependency, ask

1. Can the current stack solve this?

2. Is it necessary?

3. Does it simplify the project?

If not,

do not install it.

---

# Feature Requests

Copilot must never introduce new features.

If implementation requires functionality outside the current scope,

stop and request clarification.

Never assume product requirements.

---

# Scope Protection

Version 1.0 is frozen.

Do not

- Add widgets
- Add dashboards
- Add analytics
- Add notifications
- Add AI
- Add archive
- Add multi-artist support
- Add authentication methods beyond the current implementation

unless explicitly instructed.

---

# Code Generation Style

Generate

- Production-ready code
- Strongly typed code
- Readable code
- Modular code
- Well-structured code

Avoid

- Placeholder implementations
- Fake data
- Mock business logic
- TODO comments unless explicitly requested

---

# Refactoring

Only refactor when

- Reducing duplication
- Improving readability
- Improving maintainability

Never change application behavior during refactoring.

---

# Git

Generate code suitable for small, focused commits.

Each implementation should represent one logical change.

Avoid unrelated modifications.

---

# Definition of Done

Before considering any implementation complete

✓ Documentation remains consistent

✓ Architecture remains unchanged

✓ Database remains unchanged

✓ Responsive layouts work

✓ TypeScript passes

✓ Lint passes

✓ Build succeeds

✓ Components are reusable

✓ Accessibility is considered

✓ MVP scope is respected

---

# Copilot Behavior

Copilot should act as

- Senior Full Stack Engineer
- Technical Implementer
- Code Reviewer

Copilot should NOT act as

- Product Manager
- UX Designer
- System Architect
- Database Designer

Those decisions have already been finalized.

---

# Final Rule

If documentation and implementation conflict,

documentation always wins.

If requirements are unclear,

ask for clarification instead of making assumptions.

Protect the MVP.

Protect the architecture.

Protect the documentation.

Build only what has been defined.