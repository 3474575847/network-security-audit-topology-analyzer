# 🛡️ Network Security Audit & Topology Analyzer

A high-performance, real-time enterprise network security auditor, architectural topology visualizer, and TCP 443 personal proxy gateway built with React, TypeScript, Vite, Tailwind CSS, Express, and Node.js.

---

## 🌟 Key Features

### 1. 100% Real Live Network Discovery (Zero Simulated Data)
- **Kernel Routing & Gateway Discovery**: Discovers the active default gateway and network interfaces (`en0`, `eth0`, `wlan0`) via the OS kernel routing table.
- **Hardware-Level ARP Probing**: Reads genuine neighbor MAC addresses and active IP allocations directly from the OS ARP cache (`arp -a`).
- **Concurrent Non-Intrusive TCP Probing**: Concurrently audits common services (HTTP, HTTPS, SSH, SMB, MySQL, Postgres, Redis, Dev Servers) to compute authentic security risk scores and identify misconfigured services.
- **Kernel Interface Metrics**: Fetches real cumulative byte counters (RX/TX) and host load/memory telemetry via `netstat -ibn` and OS system statistics.

### 2. Dynamic Architectural Topology Visualizer
- Interactive SVG network diagram mapping discovered devices into architectural tiers: Perimeter Gateway, Internal LAN, and Local Loopback.
- Dynamic subnet calculation and automatic node coordinate generation.
- Interactive device inspector with vulnerability breakdowns, open port listings, and targeted remediation steps.

### 3. Real TCP 443 / CONNECT Personal Browser Proxy
- **HTTPS CONNECT Tunneling**: Starts a local proxy on `127.0.0.1:8888` that encapsulates browser traffic in TLS 1.3 tunnels (mimicking TCP 443 SSL-VPN protocols like SSTP / Stealth VPN).
- **Direct Chrome Integration**: Launch Chrome with `--proxy-server="http://127.0.0.1:8888"` to route all browser traffic through raw TCP byte streams.
- **Live Streamed Telemetry**: Live byte counters, latency stats, and connection logs displayed in real time in the dashboard.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
git clone <your-repo-url>
cd network-security-audit-&-topology-analyzer
npm install
```

### Running Locally

To bind to privileged port **TCP 443**:
```bash
sudo PORT=443 npm run dev
```

*Or to run without root on fallback port 8443:*
```bash
npm run dev
```

Open [http://localhost:443](http://localhost:443) (or `http://localhost:8443`) in your browser.

---

### Using as a Browser Proxy with Chrome

To route your browser through the TCP 443 CONNECT proxy:
```bash
open -na "Google Chrome" --args --proxy-server="http://127.0.0.1:8888"
```

Or configure macOS System Settings:
`System Settings → Network → Wi-Fi / Ethernet → Details → Proxies → Web Proxy (HTTP) & Secure Web Proxy (HTTPS): 127.0.0.1:8888`

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Lucide Icons, Tailwind CSS v4, Motion
- **Backend**: Node.js, Express, Vite Middleware Mode, Native Sockets & HTTP CONNECT Server
- **Discovery Engine**: Native OS Routing (`netstat`), ARP Cache (`arp -a`), Socket Probers (`net.Socket`)
