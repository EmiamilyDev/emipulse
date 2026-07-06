# SYSTEM_ARCHITECTURE

Version: 1.0
Status: Frozen
Owner: Product
Last Updated: 2026-07-06

---

# Purpose

This document defines the overall system architecture for Pulse MVP.

It describes how the application is structured, how data flows through the system, and how each layer interacts.

This document is the primary architectural reference for development.

---

# Architecture Overview

```
                    Public Website
                           │
                           │
                Next.js (App Router)
                           │
          ┌────────────────┴────────────────┐
          │                                 │
     Server Components                Client Components
          │                                 │
          └────────────────┬────────────────┘
                           │
                    Application Layer
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
     Supabase         Storage          Future APIs
     Database         (Images)      (YouTube, RSS)
```

---

# System Layers

## Presentation Layer

Responsible for the user interface.

Technology

- Next.js
- React
- Tailwind CSS
- shadcn/ui

Responsibilities

- Render pages
- Display components
- Responsive layouts

Business logic should not exist here.

---

## Application Layer

Responsible for coordinating data.

Responsibilities

- Read data
- Validate requests
- Connect services
- Transform responses

This layer acts as the bridge between UI and data.

---

## Data Layer

Primary data source

Supabase

Contains

- Database
- Authentication
- Storage

All business data originates from this layer.

---

## Storage Layer

Supabase Storage

Buckets

- avatars
- gallery
- logos

Only images are stored here.

Metadata remains inside the database.

---

# Database Architecture

```
artists
│
├── social_accounts
├── events
│     └── gallery
└── news

activity_logs

settings
```

---

# Data Flow

## Artist

```
Artist Configuration

↓

artists

↓

Homepage
```

---

## Event

```
Create Event

↓

events

↓

Featured Event

↓

Homepage Hero
```

---

## Gallery

```
Upload Image

↓

Storage

↓

gallery

↓

Event Detail
```

---

## News

```
Create News

↓

news

↓

Homepage
```

---

## Activity Timeline

```
Admin Action

↓

activity_logs

↓

Homepage Timeline
```

---

# Homepage Composition

Homepage consists of

- Greeting
- Hero (Featured Event)
- Activity Timeline
- Upcoming Events
- Latest News
- Gallery Preview

All sections retrieve data from Supabase.

No hardcoded content.

---

# Hero Architecture

The homepage hero is generated automatically.

Source

Featured Event

No dedicated Hero table exists.

Benefits

- No duplicated data
- Easier maintenance
- Single source of truth

---

# Authentication

Supabase Auth

Roles

Public

- Read only

Admin

- Create
- Update
- Delete

All administrative pages require authentication.

---

# Storage Strategy

Images

↓

Supabase Storage

↓

Image URL

↓

Database

↓

Frontend

Images are never stored directly inside database records.

---

# Automation

Automation is event-driven.

Examples

Publish Event

↓

Activity Log

↓

Homepage Update

Future automation should follow the same architecture.

---

# External Services

Current

Supabase

Future

- YouTube API
- RSS Feed

Future integrations must remain optional.

The application must continue functioning without external APIs.

---

# Design Principles

- Documentation First
- Modular Architecture
- Separation of Concerns
- Single Source of Truth
- Simplicity over Complexity
- Maintainability First

---

# Scalability

The architecture should support future additions without redesign.

Examples

- Archive
- Social Metrics
- Multi Artist Support
- API Integrations

Future modules should extend the architecture rather than replace it.

---

# Constraints

The system intentionally excludes

- AI Processing
- Real-time Social Metrics
- Notifications
- User Accounts
- Comments

These features belong to future versions.

---

# Completion Criteria

The architecture is complete when

- Every module has a clear responsibility.
- Data flows are well defined.
- Business logic is separated from UI.
- Database remains the single source of truth.
- New developers can understand the project from this document alone.