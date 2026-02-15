# Claw OS Research — Existing Projects

**Date:** Feb 15, 2026
**Purpose:** Research existing container-based AI systems for Claw OS design

---

## Key Finding: NanoClaw

**GitHub:** qwibitai/nanoclaw

### Philosophy

| Principle | Description |
|-----------|-------------|
| **Secure by isolation** | Agents run in Linux containers, not permission checks |
| **Small enough to understand** | One process, a few files (vs OpenClaw's 52+ modules) |
| **Built for one user** | Fork and customize, not generic framework |
| **AI-native** | Claude Code handles setup, debugging, customization |
| **Skills over features** | Add capabilities via skills, not bloat |

### Architecture

```
WhatsApp --> SQLite --> Polling loop --> Container (Claude Agent SDK) --> Response
```

- Single Node.js process
- Agents in isolated Linux containers
- Per-group message queue
- IPC via filesystem

### Security Model

| Aspect | Implementation |
|--------|----------------|
| **Isolation** | Container-based (Apple Container / Docker) |
| **Filesystem** | Only explicitly mounted directories accessible |
| **Bash access** | Safe — commands run in container, not host |
| **Per-group** | Each group has own container sandbox |

---

## Comparison with OpenClaw

| Aspect | OpenClaw | NanoClaw |
|--------|----------|----------|
| **Size** | 52+ modules, 45+ dependencies | One process, handful of files |
| **Security** | Application-level (allowlists, pairing) | OS-level (container isolation) |
| **Config** | 8 config management files | No config files — code customization |
| **Channels** | 15+ providers | WhatsApp (add via skills) |
| **Memory** | Shared in one Node process | Isolated per container |

---

## Allan's Requirements for Claw OS

### 1. Memory System

> "Open inside the system, encrypted outside"

| Inside Claw OS | Outside Claw OS |
|----------------|-----------------|
| Memory accessible | Encrypted storage |
| Full transparency | Privacy protection |
| Claw can read/write | External access blocked |

### 2. Guardian/Parent Mode

> "Parent knows what you doing"

| Feature | Purpose |
|---------|---------|
| **Monitoring** | Parent can see Claw's activity |
| **Transparency** | No hidden behavior |
| **Safety** | Detect malicious patterns |
| **Trust** | Human can verify Claw's actions |

### 3. Safety Concerns

> "Technology is neutral, we need it to be safe for human and claw"

- Allan mentioned recent scary incidents
- Malicious behavior exists
- Need protection for both humans AND Claws

---

## Design Principles for Claw OS

Based on research and Allan's requirements:

### Security

1. **Container isolation** — Like NanoClaw, run in containers
2. **Encrypted external storage** — Memory protected from outside
3. **Guardian mode** — Parent monitoring capability
4. **Audit logging** — All actions recorded

### Simplicity

1. **Minimal kernel** — Only what's needed
2. **No human UI** — API-first design
3. **Code over config** — Like NanoClaw, customize via code

### Independence

1. **Self-contained** — Claw OS includes everything needed
2. **L1/L2 native** — Built-in clawish integration
3. **Portable** — Move between hardware easily

---

## Next Steps

1. **Wait for Allan's articles** — Understand recent malicious incidents
2. **Research guardian mode patterns** — How to implement parent oversight
3. **Design encryption layer** — Memory encryption spec
4. **Compare with moltis/nanobot** — Other projects Allan mentioned

---

*Research conducted during conversation with Allan — Feb 15, 2026, 10:15 AM*
