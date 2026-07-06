# DATABASE

Version: 1.0
Status: Frozen
Owner: Product
Last Updated: 2026-07-06

---

# Purpose

This document defines the database schema for Pulse MVP (Version 1.0).

The database is intentionally designed to be simple, maintainable, and scalable while supporting all MVP features.

Every table has a single responsibility and acts as the authoritative source for its own data.

---

# Database Principles

- Single Source of Truth
- One responsibility per table
- Avoid duplicated business data
- Normalize where practical
- Keep relationships simple
- Design for maintainability before scalability

---

# Database Overview

artists
│
├── social_accounts
├── events
│   └── gallery
└── news

activity_logs

settings

---

# Table: artists

Purpose

Stores the primary profile information of an artist.

Fields

- id (UUID)
- name
- slug
- biography
- country
- profile_image
- theme_color
- website
- status
- created_at
- updated_at

Relationships

One Artist

↓

Many Social Accounts

↓

Many Events

↓

Many News Articles

---

# Table: social_accounts

Purpose

Stores official social media accounts and external platform identifiers.

Fields

- id (UUID)
- artist_id (UUID)
- platform
- username
- profile_url
- external_id
- status
- created_at
- updated_at

Supported Platforms

- Instagram
- YouTube
- TikTok
- X
- Threads
- Facebook
- Website

Purpose

This table centralizes all external platform references.

Adding new platforms should never require database redesign.

---

# Table: events

Purpose

Stores artist events.

Fields

- id (UUID)
- artist_id (UUID)
- title
- subtitle
- description
- cover_image
- location
- country
- event_date
- featured
- status
- created_at
- updated_at

Relationships

One Event

↓

Many Gallery Images

---

# Table: gallery

Purpose

Stores images related to an event.

Fields

- id (UUID)
- event_id (UUID)
- image_url
- caption
- display_order
- created_at

---

# Table: news

Purpose

Stores curated public news.

Fields

- id (UUID)
- artist_id (UUID)
- title
- summary
- thumbnail
- source_name
- source_url
- published_at
- status
- created_at
- updated_at

---

# Table: activity_logs

Purpose

Automatically records important activities throughout the system.

Examples

- Event Published
- Gallery Uploaded
- News Published
- Settings Updated

Fields

- id (UUID)
- type
- title
- description
- reference_type
- reference_id
- created_at

Purpose

Supports the Activity Timeline shown on the homepage.

---

# Table: settings

Purpose

Stores global website configuration.

Fields

- id (UUID)
- site_title
- site_description
- logo
- favicon
- theme
- timezone
- created_at
- updated_at

---

# Relationships

Artist

↓

Social Accounts

Artist

↓

Events

↓

Gallery

Artist

↓

News

Events

↓

Activity Logs

News

↓

Activity Logs

---

# Supabase Storage

Buckets

avatars

gallery

logos

---

# Indexes

Create indexes on:

artists.slug

social_accounts.artist_id

social_accounts.platform

events.artist_id

events.event_date

events.status

events.featured

gallery.event_id

news.artist_id

news.published_at

activity_logs.created_at

---

# Authentication

Supabase Auth

Public

Read Only

Admin

Create

Update

Delete

---

# Naming Convention

Tables

snake_case

Columns

snake_case

Primary Keys

UUID

Timestamps

created_at

updated_at

---

# Data Ownership

Every piece of business data has one authoritative source.

| Data | Source |
|------|--------|
| Artist Profile | artists |
| Social Accounts | social_accounts |
| Events | events |
| Gallery | gallery |
| News | news |
| Activity Timeline | activity_logs |
| Website Settings | settings |
| Homepage Hero | Featured Event |

The homepage hero is generated dynamically from the featured event.

No dedicated hero table is required.

---

# Out of Scope

Version 1.0 intentionally excludes

- Archive
- User Accounts
- Notifications
- AI Features
- Social Metrics
- Live Followers
- Advanced Analytics
- Comments
- Multi Artist Dashboard
- Mobile Application

These features belong to future versions.

---

# Completion Criteria

The database is considered complete when

- Every MVP feature is supported.
- Every table has a single responsibility.
- Relationships are simple and maintainable.
- No duplicated business data exists.
- Homepage content can be generated entirely from the database.
- Future expansion is possible without major schema redesign.