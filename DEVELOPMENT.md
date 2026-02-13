# Development Workflow

This document describes how to develop Celato locally.

## Prerequisites

- Node.js 22 LTS
- pnpm 9+
- Expo Go app on your phone (iOS or Android)

## Initial Setup

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# (Optional) Fill in API keys - not needed for VS-0
```

## Development Commands

### Start Everything

```bash
# Start API and mobile app in parallel
pnpm dev
```

### Start Individual Packages

```bash
# Start API server only
pnpm dev:api

# Start mobile app only
pnpm dev:mobile
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Code Quality

```bash
# Lint and format check (CI)
pnpm check

# Auto-fix lint/format issues
pnpm check:fix

# Type check all packages
pnpm type-check
```

### Build

```bash
# Build all packages
pnpm build
```

## VS-0 Verification Steps

### 1. Verify API Server

```bash
# Terminal 1: Start API
pnpm dev:api

# Should see:
# 🚀 Celato API listening on http://localhost:3000
```

```bash
# Terminal 2: Test health check
curl http://localhost:3000/health

# Should return:
# {"status":"ok","service":"celato-api","version":"0.1.0"}
```

### 2. Verify Mobile App

```bash
# Start mobile app
pnpm dev:mobile

# Should see Expo dev server with QR code
```

**On your phone:**
1. Open Expo Go app
2. Scan the QR code
3. App should load and display:
   - "Celato" title
   - "The Bionic Director" subtitle
   - Connection status dot (gray/yellow = disconnected, green = connected)

**Note:** WebSocket connection to `localhost:3000` will only work on web. For physical devices, update `WS_URL` in `packages/mobile/App.tsx` to your computer's IP address.

### 3. Verify WebSocket Connection

**For web testing (localhost works):**

```bash
# Terminal 1: API server running
pnpm dev:api

# Terminal 2: Mobile app in web mode
cd packages/mobile
pnpm web
```

Open `http://localhost:8081` in your browser. You should see:
- Connection status dot turns **green** (connected)
- "Send Test Message" button appears
- Click button → message appears in API logs
- Last message shows the ack response

**For physical device testing:**

1. Find your computer's IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`

2. Update `packages/mobile/App.tsx`:
   ```typescript
   const WS_URL = "ws://192.168.1.XXX:3000/ws"; // Your computer's IP
   ```

3. Restart mobile app and test connection

## Project Structure

```
celato/
├── packages/
│   ├── shared/          # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── types/   # Type definitions
│   │   │   └── index.ts # Exports
│   │   └── package.json
│   ├── api/             # Fastify WebSocket server
│   │   ├── src/
│   │   │   ├── index.ts      # Server entry point
│   │   │   └── index.test.ts # API tests
│   │   └── package.json
│   └── mobile/          # React Native (Expo) app
│       ├── src/
│       │   └── hooks/   # React hooks
│       ├── App.tsx      # App entry point
│       └── package.json
├── spec/                # Documentation and tracking
└── package.json         # Root workspace config
```

## Common Issues

### "Cannot connect to Metro bundler"
- Make sure `pnpm dev:mobile` is running
- Try clearing cache: `cd packages/mobile && pnpm start --clear`

### "WebSocket connection failed"
- Verify API server is running on port 3000
- For physical devices, use your computer's IP address, not `localhost`
- Check firewall settings (port 3000 must be accessible)

### "Build errors"
- Run `pnpm install` again
- Delete `node_modules` and reinstall: `rm -rf node_modules && pnpm install`
- Check TypeScript errors: `pnpm type-check`

## Next Steps

After completing VS-0 verification:
- Update `spec/tracking/qa.md` - move features from ⚪ to 🟢
- Update `spec/tracking/slices/vs0_skeleton.md` - mark status as ✅ Complete
- Update `spec/tracking/milestone.md` - mark VS-0 complete
- Begin VS-1: Wizard of Oz Prototype
