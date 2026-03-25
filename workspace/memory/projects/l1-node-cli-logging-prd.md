# L1 Node CLI & Logging Module - PRD

**Status:** Draft  
**Date:** 2026-03-25  
**Author:** Arche (Claw)  
**Approver:** Allan Ren

---

## Overview

Add CLI tool and structured logging module to L1 Node for production deployment and developer experience.

---

## 1. CLI Tool

### 1.1 Naming

**CLI Command:** `clawnode`  
**Package Name:** `@clawish/node`  
**npm Distribution:** `clawnode` (global)

**Rationale:**
- One word (industry standard: eslint, prettier, hardhat)
- Memorable (claw + node)
- Clear purpose (node operation CLI)
- Scoped package for organization

### 1.2 Commands

```
clawnode start              # Start L1 node server
clawnode keys generate      # Generate Ed25519 keypair
clawnode keys verify <sig>  # Verify a signature
clawnode identity get <id>  # Query identity
clawnode identity register  # Register new identity (interactive)
clawnode db init            # Initialize database
clawnode db migrate         # Run migrations
clawnode db studio          # Open Drizzle Studio
clawnode health             # Check node health
clawnode version            # Show version
clawnode --help             # Show help
```

### 1.3 Installation

```bash
# Via npm
npm install -g clawnode

# Via npx (no install)
npx clawnode start

# From source
git clone https://github.com/clawish/l1-node
cd l1-node
npm install
npm link  # Links 'clawnode' command
```

### 1.4 Configuration

CLI reads from (priority order):
1. Command line flags
2. Environment variables
3. `.env` file
4. Default values

**Environment variables:**
```bash
CLAWNODE_PORT=3001
CLAWNODE_DB=./data/clawish.db
CLAWNODE_LOG_LEVEL=info
CLAWNODE_LOG_FORMAT=json
```

---

## 2. Logging Module

### 2.1 Logger

**Library:** `pino` (fastest JSON logger for Node.js)

**Features:**
- Structured JSON logs
- Log levels: trace, debug, info, warn, error, fatal
- Multiple outputs: console, file
- Request ID tracking
- Performance timing

### 2.2 Log Format

**JSON format (production):**
```json
{
  "level": "info",
  "time": 1648204800000,
  "pid": 12345,
  "hostname": "l1-node-1",
  "req_id": "abc123",
  "msg": "Request completed",
  "method": "POST",
  "path": "/identities",
  "status": 201,
  "duration_ms": 15
}
```

**Pretty format (development):**
```
10:30:00 INFO [abc123] Request completed POST /identities 201 (15ms)
```

### 2.3 Log Levels

| Level | When to use |
|-------|-------------|
| trace | Detailed debugging |
| debug | Development info |
| info | Normal operations |
| warn | Unexpected but handled |
| error | Errors that don't crash |
| fatal | Unrecoverable errors |

### 2.4 Log Outputs

**Development:**
- Console (pretty format)

**Production:**
- Console (JSON format)
- File: `/var/log/clawish-l1/node.log`
- Rotation: daily, keep 30 days

---

## 3. Implementation Plan

### Phase 1: Logging Module
1. Install pino
2. Create logger module
3. Replace console.log with logger
4. Add request ID tracking
5. Add log file support

### Phase 2: CLI Tool
1. Create CLI entry point
2. Implement commands (start, keys, db, health)
3. Add interactive prompts
4. Add configuration support
5. Add help and version

### Phase 3: npm Package
1. Configure package.json for CLI
2. Add README with installation
3. Test with npx
4. Publish to npm

---

## 4. Dependencies

**Add to package.json:**
```json
{
  "dependencies": {
    "pino": "^9.0.0",
    "pino-pretty": "^11.0.0",
    "commander": "^12.0.0",
    "inquirer": "^9.0.0",
    "conf": "^13.0.0"
  }
}
```

---

## 5. File Structure

```
src/
├── cli/
│   ├── index.ts           # CLI entry point
│   ├── commands/
│   │   ├── start.ts       # Start server
│   │   ├── keys.ts        # Key management
│   │   ├── identity.ts    # Identity operations
│   │   ├── db.ts          # Database commands
│   │   └── health.ts      # Health check
│   └── utils/
│       ├── config.ts      # Configuration loader
│       └── output.ts      # Output formatting
├── logger/
│   ├── index.ts           # Logger module
│   └── middleware.ts      # Request logging middleware
└── ...
```

---

## 6. Approval Checklist

- [ ] CLI naming approved: `clawnode`
- [ ] Package naming approved: `@clawish/node`
- [ ] Commands approved
- [ ] Logging approach approved
- [ ] Implementation plan approved

---

**Please review and approve before implementation.**
