# T3 Gallery App

A modern photo gallery application built with the T3 Stack, featuring user authentication, photo management, albums, and collaboration features.

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- DrizzleORM
- Clerk Authentication
- UploadThing
- PostgreSQL
- Neon Database
- ngrok
- Posthog
- Upstash
- Sentry

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database (or Neon account)
- Clerk account
- UploadThing account
- ngrok account
- posthog account
- sentry account
- upstash account

### Environment Setup

1. Clone the repository
```bash
git clone https://github.com/SolarSpectre/SnapGrid.git
cd SnapGrid
pnpm install
```
# Create .env file
copy .env.example .env
### Add ALL required env variables

# Development Commands

### Start dev server
```bash
pnpm dev
```
# Database commands
```bash
pnpm db:push      # Push changes
pnpm db:studio    # Open Drizzle Studio
```
# Required Services Setup
## Clerk Authentication

Sign up at clerk.dev
Create application
Copy API keys
Setup OAuth (Google, GitHub)
Add webhook endpoint: /api/webhooks/clerk
## UploadThing

Register at uploadthing.com
Create new project
Copy API keys
Configure upload limits

## Sentry

Sign up at sentry.io
Create application
Copy token

## Upstash 

Sign up at upstash
Create application
Copy token & url

## Posthog

Sign up at posthog
Create application
Copy API keys

## Local Webhook Development with ngrok (to add user info to db)

```bash
# Install ngrok
pnpm add -g ngrok

# Authenticate (Get token from ngrok.com)
ngrok authtoken your_token

# Start tunnel (in new terminal)
ngrok http 3000
```

## Webhook Setup
Copy ngrok URL (e.g., https://xxxx-xx-xx-xxx-xx.ngrok.io)
### Clerk Dashboard:
 - Go to Webhooks
 - Add Endpoint: https://your-ngrok-url/api/webhooks/clerk
 - Select Events: user.created
 - Copy webhook secret
### Update .env:
```bash
SIGNING_SECRET=
```
# Features
- 📸 Photo upload and management
- 👥 User authentication
- 📁 Album organization
- 🤝 Collaboration features
- ♾️ Infinite scroll
- 📱 Responsive design