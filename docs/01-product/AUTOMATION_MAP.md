# AUTOMATION_MAP

Version: 1.0
Status: Frozen
Owner: Product
Last Updated: 2026-07-06

---

# Purpose

This document defines every automated workflow in Pulse MVP.

The goal is to minimize repetitive manual work while keeping the system simple, predictable, and maintainable.

Every automation must originate from a single user action.

---

# Automation Principles

1. Manual once, automated everywhere.

2. Every automation starts from a single source of truth.

3. Never duplicate business data.

4. Automation must reduce maintenance.

5. Automation should never introduce unnecessary complexity.

---

# Automation Overview

```
Admin Action

        │

        ▼

Database Update

        │

        ▼

Automatic UI Update

        │

        ▼

Activity Log
```

---

# Automation 01

Artist Configuration

Trigger

Admin updates Artist Configuration.

Flow

```
Save Artist

↓

artists

↓

Homepage

↓

Artist Profile

↓

Activity Log
```

Automatic

✓ Homepage updates

✓ Artist information updates

✓ Activity timeline records change

Manual

Artist Configuration only

---

# Automation 02

Publish Event

Trigger

Admin publishes an event.

Flow

```
Publish Event

↓

events

↓

Featured Event

↓

Homepage Hero

↓

Upcoming Events

↓

Activity Log
```

Automatic

✓ Homepage Hero

✓ Upcoming Events

✓ Event Detail

✓ Activity Timeline

Manual

Create/Edit Event only

---

# Automation 03

Upload Gallery

Trigger

Admin uploads event images.

Flow

```
Upload Image

↓

Storage

↓

gallery

↓

Gallery Page

↓

Event Detail

↓

Activity Log
```

Automatic

✓ Gallery updates

✓ Event Detail updates

✓ Activity Timeline records upload

Manual

Upload images only

---

# Automation 04

Publish News

Trigger

Admin publishes news.

Flow

```
Publish News

↓

news

↓

Homepage

↓

News Page

↓

Activity Log
```

Automatic

✓ Homepage

✓ News Listing

✓ Activity Timeline

Manual

Create/Edit News only

---

# Automation 05

Website Settings

Trigger

Admin updates website settings.

Flow

```
Update Settings

↓

settings

↓

Website

↓

Activity Log
```

Automatic

✓ Site information

✓ Theme

✓ Logo

✓ Favicon

Manual

Settings only

---

# Homepage Automation

Homepage content is generated automatically.

| Section | Source |
|----------|--------|
| Hero | Featured Event |
| Activity Timeline | activity_logs |
| Upcoming Events | events |
| Latest News | news |
| Gallery Preview | gallery |
| Artist Information | artists |

No homepage content is edited manually.

---

# Activity Log Automation

Every important administrative action creates an activity log.

Supported Actions

- Artist Updated
- Event Published
- Gallery Uploaded
- News Published
- Settings Updated

Activity logs are generated automatically.

Manual editing is not supported.

---

# Storage Automation

Images

↓

Supabase Storage

↓

Database Reference

↓

Frontend

The database stores only metadata.

Image files remain inside Supabase Storage.

---

# Data Ownership

Each feature has one source of truth.

| Feature | Source |
|----------|--------|
| Hero | Featured Event |
| Artist | artists |
| Social Accounts | social_accounts |
| Events | events |
| Gallery | gallery |
| News | news |
| Timeline | activity_logs |
| Website Settings | settings |

No duplicated business data.

---

# Manual Responsibilities

Administrators are responsible for:

- Artist Configuration
- Events
- Gallery Upload
- News
- Website Settings

Everything else is generated automatically.

---

# Future Automation

The following automations are intentionally excluded from Version 1.0.

- RSS Import
- YouTube Sync
- Instagram Metrics
- Google Trends
- AI Summaries
- Notifications
- Archive Generation

These workflows belong to future versions.

---

# Automation Constraints

Automation must

- Reduce manual work
- Remain predictable
- Follow existing architecture
- Preserve the single source of truth

Automation must NOT

- Duplicate data
- Modify business rules
- Introduce hidden logic
- Depend on unavailable APIs

---

# Completion Criteria

The automation layer is complete when:

- Every administrative action updates the correct UI automatically.
- Homepage content never requires manual editing.
- Activity Timeline is fully generated from system actions.
- Business data exists in only one location.
- The website remains fully functional without external APIs.