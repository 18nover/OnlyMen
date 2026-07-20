# Lockard Tech — Firewall Configuration

## Overview

The Raspberry Pi (`lockard-tech`) uses **UFW (Uncomplicated Firewall)** to
control inbound network traffic. UFW provides a simpler interface for managing
Linux's underlying firewall rules.

The goal is to:

* Allow SSH administration (rate-limited).
* Allow web traffic.
* Allow development servers.
* Restrict sensitive services to the local network where possible.
* Avoid exposing unnecessary services to the public internet.
* Ensure firewall rules remain effective when Docker containers publish ports.

---

## Network Layout

The Raspberry Pi is currently located on the local network at:

```text
192.168.1.91
```

The expected local network is:

```text
192.168.1.0/24
```

The basic architecture is:

```text
                    Internet
                       │
                       │
                    Router
                       │
              ┌────────┴────────┐
              │                 │
         Windows PC        Raspberry Pi
                              lockard-tech
                            192.168.1.91
                                  │
                         UFW Firewall
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
                SSH          Development        Database
              Port 22          Ports         Ports 5432/6379
```

---

# Firewall Ports

## Core Ports

| Port | Protocol | Purpose                           | Recommended Access            |
| ---- | -------- | --------------------------------- | ----------------------------- |
| 22   | TCP      | SSH (rate-limited)                | LAN / trusted sources         |
| 80   | TCP      | HTTP                              | Public if hosting web traffic |
| 443  | TCP      | HTTPS                             | Public if hosting web traffic |
| 3000 | TCP      | Node.js / application development | LAN only                      |
| 3001 | TCP      | Secondary development server      | LAN only                      |
| 5000 | TCP      | Application development           | LAN only                      |
| 5173 | TCP      | Vite development server           | LAN only                      |
| 8000 | TCP      | Python/FastAPI/Django development | LAN only                      |
| 8080 | TCP      | Application development           | LAN only                      |
| 8081 | TCP      | Secondary application             | LAN only                      |
| 8443 | TCP      | Alternative HTTPS                 | LAN only                      |
| 5432 | TCP      | PostgreSQL                        | LAN only                      |
| 6379 | TCP      | Redis                             | LAN only                      |

Not every port needs to be open at all times. Only open ports for services that
are actually running.

---

# UFW Configuration

Before enabling UFW, SSH access must be allowed. Otherwise, enabling the
firewall could lock out remote administrators.

```bash
sudo ufw limit 22/tcp
```

The `limit` flag rate-limits inbound SSH connections (max 6 connections per 30
seconds per IP), which helps mitigate brute-force attacks without blocking
legitimate access.

Development and web ports can then be added as needed:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 5000/tcp
sudo ufw allow 5173/tcp
sudo ufw allow 8000/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 8081/tcp
sudo ufw allow 8443/tcp
```

---

# Restricting Services to the Local Network

Sensitive services should not be exposed publicly.

The local network is:

```text
192.168.1.0/24
```

PostgreSQL:

```bash
sudo ufw allow from 192.168.1.0/24 to any port 5432 proto tcp
```

Redis:

```bash
sudo ufw allow from 192.168.1.0/24 to any port 6379 proto tcp
```

Development server:

```bash
sudo ufw allow from 192.168.1.0/24 to any port 3000 proto tcp
```

This means computers on the local network can access these services, while
unsolicited connections from outside are blocked.

---

# Important: Docker Bypasses UFW

By default, Docker writes rules directly to iptables, **bypassing UFW entirely**.
This means that if a Docker container publishes a port (e.g.
`ports: "5432:5432"` in `docker-compose.yaml`), that port will be publicly
accessible even if UFW has a deny rule for it.

This is relevant for OnlyMen because both `atproto/packages/dev-infra/` and
`app/dev-env/dev-infra/` publish PostgreSQL (5432) and Redis (6379) directly
to the host via Docker Compose. Without additional configuration, these services
would be exposed to the internet even with UFW enabled.

**Solutions:**

1. **Prefer Docker's own firewall** — add `DOCKER_OPTS="--iptables=false"` to
   `/etc/default/docker` and manage firewall rules with UFW exclusively
   (requires restarting Docker). Most reliable approach.

2. **Edit UFW's `before.rules`** — add custom iptables rules to
   `/etc/ufw/before.rules` that restrict Docker's published ports. More complex
   but keeps Docker's networking intact.

3. **Bind to localhost only** — in `docker-compose.yaml`, use
   `127.0.0.1:5432:5432` instead of `5432:5432`. Easiest for development.

For dev-only setups, option 3 is safest. For production, use option 1 or a
combination of UFW before.rules and a reverse proxy.

Verify Docker/UFW interaction:

```bash
sudo ufw status verbose
sudo iptables -L -n | grep DOCKER
```

If `iptables` shows `ACCEPT` for ports UFW intends to block, the bypass is
active.

---

# IPv6 Rules

UFW manages `ip6tables` alongside `iptables` by default, so the same commands
apply to both IPv4 and IPv6. Confirm IPv6 is active:

```bash
sudo ufw status verbose
```

Look for `(v6)` entries. If missing, enable IPv6 in `/etc/default/ufw`:

```text
IPV6=yes
```

Then reload:

```bash
sudo ufw reload
```

---

# Enabling UFW

```bash
sudo ufw enable
```

Check current configuration:

```bash
sudo ufw status verbose
sudo ufw status numbered
```

---

# Firewall Management

List rules:

```bash
sudo ufw status numbered
```

Allow a port:

```bash
sudo ufw allow PORT/tcp
```

Allow with rate-limiting (SSH):

```bash
sudo ufw limit PORT/tcp
```

Deny a port:

```bash
sudo ufw deny PORT/tcp
```

Remove a rule by specification (preferred — no number guessing):

```bash
sudo ufw delete allow PORT/tcp
sudo ufw delete limit PORT/tcp
sudo ufw delete deny PORT/tcp
```

Delete by number (use when spec is ambiguous):

```bash
sudo ufw delete NUMBER
```

Disable UFW:

```bash
sudo ufw disable
```

Reset UFW completely:

```bash
sudo ufw reset
```

**Warning:** Resetting removes all existing firewall rules.

---

# Windows Firewall

Windows Firewall rules are only needed for services running on the Windows
computer itself. For example, if a dev server is on Windows on port 3000:

```powershell
New-NetFirewallRule -DisplayName "Dev Server (3000)" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

If Windows is simply connecting **to** the Raspberry Pi, the firewall
configuration belongs on the Pi, not Windows.

---

# Recommended Lockard Tech Architecture

For development:

```text
Windows PC
│
├── SSH ──────────────► Raspberry Pi :22
├── VS Code Remote SSH ► Raspberry Pi
└── Dev tools ───────► Raspberry Pi :3000/5173/8000/8080

Raspberry Pi (lockard-tech, 192.168.1.91)
│
├── SSH             :22
├── Node.js         :3000
├── Vite            :5173
├── Python          :8000
├── App             :8080
├── PostgreSQL      :5432
└── Redis           :6379
```

### Security model

> Only expose services that are needed, and restrict administrative and database
> services to trusted networks whenever possible.

For a future production server:

```text
Internet
   │
   ▼
Ports 80 / 443
   │
   ▼
Reverse Proxy (Nginx / Caddy)
   │
   ▼
Application
   │
   ├── PostgreSQL (not public)
   │
   └── Redis (not public)
```

In production, PostgreSQL, Redis, and development ports should not be publicly
exposed. SSH should be restricted to trusted IPs or VPN.
