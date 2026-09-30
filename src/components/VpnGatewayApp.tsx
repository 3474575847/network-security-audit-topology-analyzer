import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Globe,
  Terminal,
  Copy,
  Check,
  Zap,
  Server,
  Layers,
  Send,
  Eye,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
  Wifi,
  Router,
  Chrome,
  Monitor,
  HardDrive,
  Radio,
  Clock,
  BarChart3,
  Network
} from 'lucide-react';

interface ProxyStats {
  proxyPort: number;
  proxyAddress: string;
  chromeCommand: string;
  safariCommand: string;
  systemCommand: string;
  totalConnections: number;
  activeConnections: number;
  totalBytesRelayed: number;
  blockedByFirewall: number;
  connectTunnels: number;
  httpProxied: number;
}

interface ProxyTestResult {
  url: string;
  method: string;
  statusCode: number;
  statusText: string;
  roundTripMs: number;
  tunnelEncapsulation: string;
  sophosBypassed: boolean;
  headers: Record<string, string>;
  body: any;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950 overflow-hidden">
      {label && (
        <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>{label}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <code className="text-xs font-mono text-emerald-300 flex-1 break-all">{code}</code>
        {!label && (
          <button
            onClick={handleCopy}
            className="flex-shrink-0 flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}

export const VpnGatewayApp: React.FC = () => {
  const [stats, setStats] = useState<ProxyStats | null>(null);
  const [statsError, setStatsError] = useState(false);
  const [activeTab, setActiveTab] = useState<'setup' | 'test' | 'how'>('setup');

  // Test proxy state
  const [proxyUrl, setProxyUrl] = useState('https://www.instagram.com/');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ProxyTestResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // Fetch live proxy stats
  const fetchStats = useCallback(() => {
    fetch('/api/proxy/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data);
        setStatsError(false);
      })
      .catch(() => setStatsError(true));
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleTestRequest = async () => {
    setIsTesting(true);
    setTestResult(null);
    setTestError(null);
    try {
      const res = await fetch('/api/vpn/proxy-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: proxyUrl, method: 'GET' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setTestResult(data);
    } catch (err: any) {
      setTestError(err.message);
    } finally {
      setIsTesting(false);
    }
  };

  const tabs = [
    { id: 'setup', label: 'Browser Setup', icon: Monitor },
    { id: 'test', label: 'Test Request', icon: Send },
    { id: 'how', label: 'How It Works', icon: Info },
  ] as const;

  const proxyAddr = stats?.proxyAddress || '127.0.0.1:8888';
  const proxyPort = stats?.proxyPort || 8888;

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 rounded-2xl border border-indigo-800/50 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              TCP 443 Browser Proxy Gateway
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                REAL PROXY ACTIVE
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              A real HTTP/HTTPS CONNECT proxy running on <span className="font-mono text-indigo-300">{proxyAddr}</span>. 
              Point your browser at it to route all traffic through this machine — HTTPS sites tunnel via TCP port 443.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${statsError ? 'bg-rose-950 border-rose-700 text-rose-300' : 'bg-emerald-950 border-emerald-700 text-emerald-300'}`}>
              <Radio className={`w-3 h-3 ${statsError ? '' : 'animate-pulse'}`} />
              {statsError ? 'Proxy Offline' : 'Proxy Online'}
            </div>
          </div>
        </div>
      </div>

      {/* Live Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Tunnels', value: stats?.activeConnections ?? '—', icon: Network, color: 'text-indigo-400', bg: 'bg-indigo-950/50 border-indigo-800/50' },
          { label: 'Total Connections', value: stats?.totalConnections ?? '—', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-950/50 border-emerald-800/50' },
          { label: 'HTTPS Tunnels', value: stats?.connectTunnels ?? '—', icon: Lock, color: 'text-amber-400', bg: 'bg-amber-950/50 border-amber-800/50' },
          { label: 'Data Relayed', value: stats ? formatBytes(stats.totalBytesRelayed) : '—', icon: BarChart3, color: 'text-sky-400', bg: 'bg-sky-950/50 border-sky-800/50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-xl border ${bg} p-3.5 flex items-center gap-3`}>
            <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
            <div>
              <div className="text-xs text-slate-500 font-medium">{label}</div>
              <div className={`text-lg font-bold font-mono ${color}`}>{String(value)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Important Notice */}
      <div className="bg-amber-950/30 border border-amber-700/40 rounded-xl p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-200">
          <strong className="font-bold">What this is:</strong> This is a real HTTP/HTTPS CONNECT proxy (not a browser extension VPN).
          You configure Chrome or your OS to use it — all your browser traffic then routes through this machine.
          For HTTPS sites like Instagram, it creates an encrypted TCP tunnel through port 443.
          <span className="text-amber-300 font-semibold"> Sophos can still inspect traffic since it also sits at the gateway level.</span>
          To fully bypass Sophos, you'd need an external VPN server outside the Sophos-controlled network.
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex bg-slate-900 rounded-xl p-1 gap-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── SETUP TAB ── */}
      {activeTab === 'setup' && (
        <div className="space-y-4">
          {/* Chrome Setup */}
          <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sky-400"></div>
              <h3 className="text-sm font-bold text-white">Option 1 — Chrome via Command Line (Recommended)</h3>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-400">
                This opens a new Chrome instance that routes ALL its traffic through the proxy. Your default Chrome stays unaffected.
              </p>
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">macOS</div>
                <CodeBlock
                  label="Launch Chrome with proxy (macOS)"
                  code={`open -na "Google Chrome" --args --proxy-server="http://${proxyAddr}" --user-data-dir="/tmp/proxy-chrome"`}
                />
              </div>
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Windows</div>
                <CodeBlock
                  label="Launch Chrome with proxy (Windows)"
                  code={`"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --proxy-server="http://${proxyAddr}" --user-data-dir="C:\\tmp\\proxy-chrome"`}
                />
              </div>
              <div className="rounded-lg bg-indigo-950/40 border border-indigo-800/40 p-3 text-xs text-indigo-300">
                <strong>💡 Tip:</strong> The <code className="font-mono bg-slate-800 px-1 rounded">--user-data-dir</code> flag runs a separate Chrome profile so your main browser is unaffected. You can open Instagram, YouTube, or any blocked site in this proxy Chrome window.
              </div>
            </div>
          </div>

          {/* System-wide Proxy */}
          <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              <h3 className="text-sm font-bold text-white">Option 2 — System-wide Proxy (All Apps)</h3>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-400">
                Sets the proxy for your entire Mac so Safari, Chrome, Firefox, and all apps use it automatically.
              </p>
              <CodeBlock
                label="Set system proxy via Terminal (macOS)"
                code={`networksetup -setwebproxy Wi-Fi 127.0.0.1 ${proxyPort} && networksetup -setsecurewebproxy Wi-Fi 127.0.0.1 ${proxyPort}`}
              />
              <CodeBlock
                label="Remove system proxy when done"
                code={`networksetup -setwebproxystate Wi-Fi off && networksetup -setsecurewebproxystate Wi-Fi off`}
              />
              <div className="rounded-lg bg-rose-950/30 border border-rose-800/40 p-3 text-xs text-rose-300">
                <strong>⚠️ Note:</strong> Replace <code className="font-mono bg-slate-800 px-1 rounded">Wi-Fi</code> with your actual interface name (e.g. <code className="font-mono bg-slate-800 px-1 rounded">Ethernet</code>). Run <code className="font-mono bg-slate-800 px-1 rounded">networksetup -listallnetworkservices</code> to see options.
              </div>
            </div>
          </div>

          {/* Manual Browser Settings */}
          <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <h3 className="text-sm font-bold text-white">Option 3 — Manual Browser Settings</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    browser: 'Chrome / Brave',
                    steps: [
                      'Settings → System → Open your computer\'s proxy settings',
                      'Set HTTP Proxy: 127.0.0.1 Port: ' + proxyPort,
                      'Set HTTPS Proxy: 127.0.0.1 Port: ' + proxyPort,
                      'Save and restart browser'
                    ]
                  },
                  {
                    browser: 'Firefox',
                    steps: [
                      'Settings → Network Settings → Manual proxy',
                      'HTTP Proxy: 127.0.0.1 Port: ' + proxyPort,
                      'Check "Also use this proxy for HTTPS"',
                      'Click OK'
                    ]
                  },
                  {
                    browser: 'Safari (macOS)',
                    steps: [
                      'System Settings → Network → Wi-Fi → Details',
                      'Proxies tab',
                      'Enable Web Proxy (HTTP): 127.0.0.1:' + proxyPort,
                      'Enable Secure Web Proxy (HTTPS): 127.0.0.1:' + proxyPort
                    ]
                  }
                ].map(({ browser, steps }) => (
                  <div key={browser} className="rounded-lg bg-slate-800 border border-slate-700 p-3">
                    <div className="text-xs font-bold text-white mb-2">{browser}</div>
                    <ol className="space-y-1">
                      {steps.map((step, i) => (
                        <li key={i} className="text-[11px] text-slate-400 flex gap-1.5">
                          <span className="text-indigo-400 font-bold flex-shrink-0">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Proxy Address Card */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950/40 rounded-xl border border-indigo-800/40 p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <Server className="w-6 h-6 text-indigo-400" />
              <div>
                <div className="text-xs text-slate-500 font-medium">Proxy Address</div>
                <div className="text-xl font-bold font-mono text-white">{proxyAddr}</div>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-slate-700" />
            <div>
              <div className="text-xs text-slate-500 font-medium">Protocol</div>
              <div className="text-sm font-bold text-indigo-300 font-mono">HTTP CONNECT / HTTPS Tunnel</div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-slate-700" />
            <div>
              <div className="text-xs text-slate-500 font-medium">Scope</div>
              <div className="text-sm font-bold text-emerald-300">All HTTP + HTTPS traffic</div>
            </div>
          </div>
        </div>
      )}

      {/* ── TEST REQUEST TAB ── */}
      {activeTab === 'test' && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Send className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Server-side Proxy Request Tester</h3>
            </div>
            <p className="text-xs text-slate-400">
              This sends a request from the <strong className="text-slate-200">server</strong> through the proxy logic to the target URL.
              Use this to verify connectivity and see response headers/body.
            </p>

            {/* Quick URL Presets */}
            <div className="flex flex-wrap gap-2">
              {[
                'https://www.instagram.com/',
                'https://httpbin.org/ip',
                'https://www.google.com/',
                'https://api.ipify.org/?format=json',
              ].map(u => (
                <button
                  key={u}
                  onClick={() => setProxyUrl(u)}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-mono border transition-colors ${
                    proxyUrl === u
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'border-slate-600 text-slate-400 hover:border-indigo-500 hover:text-indigo-300'
                  }`}
                >
                  {u.replace('https://', '').replace('http://', '').replace(/\/$/, '')}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={proxyUrl}
                onChange={e => setProxyUrl(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://www.instagram.com/"
              />
              <button
                onClick={handleTestRequest}
                disabled={isTesting || !proxyUrl}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {isTesting ? 'Sending...' : 'Send Request'}
              </button>
            </div>

            {/* Error */}
            {testError && (
              <div className="rounded-lg bg-rose-950/40 border border-rose-700 p-3 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Request failed:</strong> {testError}
                  <div className="mt-1 text-rose-400/70">This does not mean the browser proxy is broken — the server-side test uses different routing than the browser CONNECT tunnel.</div>
                </div>
              </div>
            )}

            {/* Result */}
            {testResult && (
              <div className="space-y-3">
                {/* Status bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${testResult.statusCode < 400 ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'}`}>
                    {testResult.statusCode} {testResult.statusText}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs bg-slate-800 text-slate-300 font-mono">
                    {testResult.roundTripMs} ms
                  </span>
                  {testResult.sophosBypassed && (
                    <span className="px-2.5 py-1 rounded-full text-xs bg-amber-900 text-amber-300 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Sophos Bypass Active
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full text-xs bg-indigo-900 text-indigo-300 font-mono">
                    {testResult.tunnelEncapsulation}
                  </span>
                </div>

                {/* Headers */}
                <div className="rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-700 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Response Headers
                  </div>
                  <div className="p-3 space-y-1 max-h-32 overflow-y-auto">
                    {Object.entries(testResult.headers || {}).map(([k, v]) => (
                      <div key={k} className="flex gap-2 text-[11px] font-mono">
                        <span className="text-sky-400 flex-shrink-0">{k}:</span>
                        <span className="text-slate-300 break-all">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Body */}
                <div className="rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-700 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Response Body (preview)
                  </div>
                  <pre className="p-3 text-[11px] font-mono text-slate-300 max-h-48 overflow-auto whitespace-pre-wrap break-all">
                    {typeof testResult.body === 'object'
                      ? JSON.stringify(testResult.body, null, 2)
                      : String(testResult.body || '').slice(0, 2000)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── HOW IT WORKS TAB ── */}
      {activeTab === 'how' && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-5 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              How the TCP 443 Proxy Works
            </h3>

            {/* Architecture diagram */}
            <div className="space-y-2">
              {[
                { step: 1, from: 'Your Chrome Browser', to: `This Proxy (127.0.0.1:${proxyPort})`, label: 'HTTP CONNECT request', color: 'text-sky-400' },
                { step: 2, from: `Proxy`, to: 'Target Server (e.g. instagram.com:443)', label: 'Raw TCP socket connection on port 443', color: 'text-emerald-400' },
                { step: 3, from: 'Proxy', to: 'Chrome', label: '200 Connection Established — tunnel open', color: 'text-indigo-400' },
                { step: 4, from: 'Chrome ↔ Proxy', to: 'Proxy ↔ Instagram', label: 'Raw TLS bytes piped transparently (proxy cannot inspect HTTPS)', color: 'text-amber-400' },
              ].map(({ step, from, to, label, color }) => (
                <div key={step} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800 border border-slate-700">
                  <span className={`text-xs font-bold font-mono w-5 flex-shrink-0 mt-0.5 ${color}`}>{step}.</span>
                  <div className="flex-1 text-xs">
                    <span className="text-white font-semibold">{from}</span>
                    <span className="text-slate-500 mx-2">→</span>
                    <span className="text-white font-semibold">{to}</span>
                    <div className={`${color} mt-0.5 text-[11px]`}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sophos limitation box */}
            <div className="rounded-xl bg-rose-950/30 border border-rose-800/40 p-4 space-y-2">
              <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Why Sophos Still Blocks Instagram Even With This Proxy
              </h4>
              <ul className="space-y-1.5 text-xs text-rose-200/80">
                <li className="flex gap-2"><span className="text-rose-400 flex-shrink-0">•</span>This proxy runs <strong>inside</strong> your machine. When Chrome connects to Instagram, the final TCP connection still goes out through your school/office router.</li>
                <li className="flex gap-2"><span className="text-rose-400 flex-shrink-0">•</span>Sophos sits at the <strong>network gateway</strong> — it sees the outbound connection to instagram.com:443 and blocks it there.</li>
                <li className="flex gap-2"><span className="text-rose-400 flex-shrink-0">•</span>To bypass a network-level Sophos firewall, you need a <strong>VPN server hosted outside</strong> the network (e.g. a cloud VM running WireGuard/OpenVPN) that Sophos doesn't recognise as blocked.</li>
              </ul>
            </div>

            {/* What this IS useful for */}
            <div className="rounded-xl bg-emerald-950/30 border border-emerald-800/40 p-4 space-y-2">
              <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                What This Proxy IS Useful For
              </h4>
              <ul className="space-y-1.5 text-xs text-emerald-200/80">
                <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">✓</span>Routing all browser traffic through this machine for <strong>inspection and logging</strong></li>
                <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">✓</span>Acting as a <strong>local network proxy</strong> for other devices on your LAN (point their proxy settings here)</li>
                <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">✓</span>Analysing what sites apps connect to (traffic visibility)</li>
                <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">✓</span>Testing sites through a different routing path when on home/personal networks</li>
                <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">✓</span>Development/debugging: intercept and inspect HTTPS connections</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
