# DATA_PIPELINE

Version: 1.0
Status: Frozen
Owner: Product
Last Updated: 2026-07-06

---

# Purpose

This document defines how data flows throughout Pulse MVP.

It identifies the source of every piece of data, how it is processed, where it is stored, and where it is displayed.

The goal is to ensure that every feature follows a predictable and maintainable data flow.

---

# Data Pipeline Principles

1. Every data element has one source of truth.

2. Data flows in one direction.

3. UI never owns business data.

4. Database is the primary source of application data.

5. External services are optional enhancements.

---

# Data Sources

## Internal Sources

- artists
- social_accounts
- events
- gallery
- news
- activity_logs
- settings

Primary Source

Supabase Database

---

## Storage

Supabase Storage

Buckets

- avatars
- gallery
- logos

Purpose

Store media files only.

Metadata belongs in the database.

---

## External Sources

Current

None (MVP)

Future

- RSS Feed
- YouTube API

External integrations are optional.

The application must remain functional without them.

---

# Core Data Flow

```
Admin

↓

CMS

↓

Supabase Database

↓

Next.js Server Components

↓

UI
```

Business data always passes through the database before reaching the frontend.

---

# Artist Pipeline

```
Artist Configuration

↓

artists

↓

Homepage

↓

Artist Profile

↓

UI
```

Source of Truth

artists

---

# Social Account Pipeline

```
Artist Configuration

↓

social_accounts

↓

Artist Profile

↓

External Links

↓

UI
```

Source of Truth

social_accounts

---

# Event Pipeline

```
Create Event

↓

events

↓

Featured Event

↓

Homepage Hero

↓

Upcoming Events

↓

Event Detail

↓

UI
```

Source of Truth

events

---

# Gallery Pipeline

```
Upload Image

↓

Supabase Storage

↓

gallery

↓

Gallery Page

↓

Event Detail

↓

Homepage Preview
```

Files

Supabase Storage

Metadata

gallery

---

# News Pipeline

```
Create News

↓

news

↓

Homepage

↓

News Listing

↓

UI
```

Source of Truth

news

---

# Activity Pipeline

```
Admin Action

↓

activity_logs

↓

Homepage Timeline

↓

UI
```

Activity Logs are automatically generated.

They are never manually edited.

---

# Website Settings Pipeline

```
Update Settings

↓

settings

↓

Global Layout

↓

UI
```

Source of Truth

settings

---

# Homepage Data Sources

| Homepage Section | Data Source |
|------------------|-------------|
| Artist Profile | artists |
| Social Links | social_accounts |
| Hero | Featured Event |
| Activity Timeline | activity_logs |
| Upcoming Events | events |
| Gallery Preview | gallery |
| Latest News | news |

Homepage contains no manually entered content.

---

# Read Flow

```
Database

↓

Server Components

↓

React Components

↓

Browser
```

The frontend only consumes prepared data.

Business logic should not exist inside UI components.

---

# Write Flow

```
Admin

↓

CMS Form

↓

Validation

↓

Supabase

↓

Activity Log

↓

Automatic UI Update
```

Every write operation follows the same lifecycle.

---

# Data Ownership

| Data | Source |
|------|--------|
| Artist | artists |
| Social Accounts | social_accounts |
| Events | events |
| Gallery | gallery |
| News | news |
| Timeline | activity_logs |
| Website Settings | settings |
| Hero | Featured Event |

Every business entity has one authoritative source.

---

# External API Strategy

Version 1.0 does not depend on external APIs.

Future integrations

- RSS
- YouTube

will populate existing database structures instead of creating parallel systems.

Example

RSS

↓

Transform

↓

news

↓

Homepage

This preserves a single source of truth.

---

# Error Handling

If an external service is unavailable

↓

Skip synchronization

↓

Continue serving data from Supabase

↓

Do not interrupt the user experience.

---

# Data Quality Rules

- Never duplicate business data.
- Never bypass the database.
- Validate data before writing.
- Prefer references over copies.
- Every record must belong to one owner.

---

# Completion Criteria

The data pipeline is complete when:

- Every UI section has a clearly defined data source.
- Every write operation follows the same lifecycle.
- External services remain optional.
- The database remains the single source of truth.
- The frontend only renders prepared data.