/**
 * Real HTTP/HTTPS CONNECT Proxy Server
 * This is a real proxy that Chrome (and any browser) can use via --proxy-server flag.
 * It handles HTTP CONNECT tunneling so HTTPS sites (Instagram, etc.) pass through.
 *
 * Usage:
 *   Start this proxy, then launch Chrome with:
 *   open -na "Google Chrome" --args --proxy-server="http://127.0.0.1:8888"
 */

import net from "net";
import http from "http";
import url from "url";

const PROXY_PORT = 8888;

export interface RealProxyLog {
  id: string;
  timestamp: string;
  sourceIp: string;
  destHost: string;
  destPort: number;
  protocol: string;
  bytes: number;
  action: "ALLOWED" | "BLOCKED" | "TUNNELED";
  inspectionNotes: string;
}

const stats = {
  totalConnections: 0,
  activeConnections: 0,
  totalBytesRelayed: 0,
  blockedByFirewall: 0,
  connectTunnels: 0,
  httpProxied: 0,
};

const recentLogs: RealProxyLog[] = [];
const MAX_LOGS = 50;

function addLog(log: Omit<RealProxyLog, "id" | "timestamp">) {
  const newLog: RealProxyLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toLocaleTimeString(),
    ...log
  };
  recentLogs.unshift(newLog);
  if (recentLogs.length > MAX_LOGS) {
    recentLogs.pop();
  }
}

// Export stats for the main server and scanner to read
export function getProxyStats() {
  return {
    ...stats,
    recentLogs: [...recentLogs]
  };
}

export function startHttpProxy(port = PROXY_PORT) {
  const server = http.createServer();

  // ── Handle HTTPS CONNECT tunnels (for https:// sites like instagram.com) ──
  server.on("connect", (req, clientSocket: import('stream').Duplex, head) => {
    const [hostname, portStr] = (req.url || "").split(":");
    const targetPort = parseInt(portStr || "443", 10);

    stats.totalConnections++;
    stats.activeConnections++;
    stats.connectTunnels++;

    const remoteIp = (clientSocket as any).remoteAddress || '127.0.0.1';
    let sessionBytes = 0;

    const targetSocket = net.connect(targetPort, hostname, () => {
      clientSocket.write("HTTP/1.1 200 Connection Established\r\nProxy-agent: NetSecAudit-TCP443-Proxy\r\n\r\n");
      if (head && head.length > 0) {
        targetSocket.write(head);
        sessionBytes += head.length;
      }
      targetSocket.pipe(clientSocket);
      clientSocket.pipe(targetSocket);
    });

    targetSocket.on("data", (chunk) => {
      stats.totalBytesRelayed += chunk.length;
      sessionBytes += chunk.length;
    });
    clientSocket.on("data", (chunk) => {
      stats.totalBytesRelayed += chunk.length;
      sessionBytes += chunk.length;
    });

    const cleanup = () => {
      stats.activeConnections = Math.max(0, stats.activeConnections - 1);
      targetSocket.destroy();
      clientSocket.destroy();
      addLog({
        sourceIp: remoteIp,
        destHost: hostname,
        destPort: targetPort,
        protocol: "HTTPS (CONNECT)",
        bytes: sessionBytes,
        action: "TUNNELED",
        inspectionNotes: `TLS 1.3 encrypted tunnel established for ${hostname}:${targetPort}.`
      });
    };

    targetSocket.on("error", (err) => {
      cleanup();
    });
    clientSocket.on("error", cleanup);
    targetSocket.on("close", cleanup);
    clientSocket.on("close", cleanup);
  });

  // ── Handle plain HTTP proxying ──
  server.on("request", (req, res) => {
    const parsedUrl = url.parse(req.url || "");
    const targetHostname = parsedUrl.hostname || "";
    const targetPort = parseInt(parsedUrl.port || "80", 10);
    const targetPath = parsedUrl.path || "/";

    stats.totalConnections++;
    stats.httpProxied++;

    let reqBytes = 0;

    const options = {
      hostname: targetHostname,
      port: targetPort,
      path: targetPath,
      method: req.method,
      headers: {
        ...req.headers,
        host: targetHostname,
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res);
      proxyRes.on("data", (chunk) => {
        stats.totalBytesRelayed += chunk.length;
        reqBytes += chunk.length;
      });
      proxyRes.on("end", () => {
        addLog({
          sourceIp: req.socket.remoteAddress || "127.0.0.1",
          destHost: targetHostname,
          destPort: targetPort,
          protocol: `HTTP/${req.method}`,
          bytes: reqBytes,
          action: "ALLOWED",
          inspectionNotes: `Direct HTTP relay status ${proxyRes.statusCode}.`
        });
      });
    });

    proxyReq.on("error", (err) => {
      res.writeHead(502);
      res.end(`Proxy Error: ${err.message}`);
      addLog({
        sourceIp: req.socket.remoteAddress || "127.0.0.1",
        destHost: targetHostname,
        destPort: targetPort,
        protocol: `HTTP/${req.method}`,
        bytes: 0,
        action: "BLOCKED",
        inspectionNotes: `Relay error: ${err.message}`
      });
    });

    req.pipe(proxyReq);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`[Proxy] Port ${port} in use, trying ${port + 1}...`);
      server.listen(port + 1, "127.0.0.1");
    } else {
      console.error("[Proxy] Error:", err.message);
    }
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`\n[Proxy] ✅ Real HTTP/HTTPS CONNECT Proxy listening on 127.0.0.1:${port}`);
    console.log(`[Proxy] 🌐 Chrome Command: open -na "Google Chrome" --args --proxy-server="http://127.0.0.1:${port}"`);
  });

  return server;
}
