# Installing Chrome on VPS — Research 2026-02-21

**Context:** Installing Chrome/Chromium on headless Ubuntu VPS for pinchtab/browser automation

## Method 1: Google Chrome Official (Recommended)

```bash
# Download latest stable Chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

# Install with dependencies
sudo apt update
sudo apt install -f ./google-chrome-stable_current_amd64.deb -y

# Or force install ignoring deps (then fix after)
sudo dpkg -i google-chrome-stable_current_amd64.deb || sudo apt --fix-broken install -y
```

**Required dependencies for headless:**
```bash
sudo apt install -y \
    xdg-utils \
    libproxy1v5 \
    libu2f-udev \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils
```

## Method 2: Chromium (Open Source)

```bash
sudo apt update
sudo apt install -y chromium-browser chromium-chromedriver
```

**Note:** May need additional flags for headless:
```bash
chromium --headless --no-sandbox --disable-dev-shm-usage
```

## Method 3: Using Xvfb (Virtual Display)

For true GUI-less operation:

```bash
# Install virtual display
sudo apt install -y xvfb

# Run Chrome with virtual display
xvfb-run --server-args="-screen 0 1024x768x24" google-chrome --headless
```

## Headless Chrome Flags

Essential flags for VPS/server environments:

| Flag | Purpose |
|------|---------|
| `--headless` | No GUI window |
| `--no-sandbox` | Disable sandbox (needed in containers) |
| `--disable-dev-shm-usage` | Use /tmp instead of /dev/shm |
| `--disable-gpu` | Disable GPU acceleration |
| `--disable-software-rasterizer` | Disable software rasterizer |
| `--remote-debugging-port=9222` | Enable remote debugging |

## Pinchtab-Specific Setup

Based on errors encountered:

```bash
# 1. Install Chrome using Method 1 above

# 2. Create profile directory with proper permissions
mkdir -p ~/.pinchtab/chrome-profile
chmod 755 ~/.pinchtab ~/.pinchtab/chrome-profile

# 3. Set environment variables
export BRIDGE_TOKEN=secret123
export BRIDGE_HEADLESS=true
export BRIDGE_NO_RESTORE=true  # Prevent session restore issues

# 4. Run pinchtab
~/go/bin/pinchtab
```

## Security Considerations

⚠️ **Warning:** `--no-sandbox` disables Chrome's security sandbox. Only use in:
- Trusted environments
- Containers with limited privileges
- When running as non-root user

For production, consider:
- Running in Docker with seccomp profiles
- Using dedicated user account
- Limiting network access

## Verification

Test Chrome installation:
```bash
google-chrome --version
google-chrome --headless --dump-dom https://www.google.com
```

---

*Researched for pinchtab setup on VPS — 2026-02-21*
