import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Layers,
  Play,
  RefreshCw,
  Plus,
  Server,
  Router as RouterIcon,
  Terminal,
  Activity,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Info,
  Search,
  Monitor,
  Database,
  Cpu,
  X,
  Wifi,
  Radio,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  KeyRound,
  Download,
  Sliders,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import { AuditReport, NetworkNode } from './types';
import { TopologyMap } from './components/TopologyMap';
import { VulnerabilityList } from './components/VulnerabilityList';
import { HardeningPlan } from './components/HardeningPlan';
import { InspectionPanel } from './components/InspectionPanel';
import { VpnGatewayApp } from './components/VpnGatewayApp';

const EMPTY_REPORT: AuditReport = {
  id: 'audit-pending',
  timestamp: new Date().toISOString(),
  targetScope: 'Local Subnet & Network Sockets',
  summary: {
    totalNodes: 0,
    totalVulnerabilities: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    securityScore: 100,
    activeVpnTunnels: 0,
    blockedTrafficCount: 0,
    avgLatencyMs: 0
  },
  nodes: [],
  connections: [],
  hardeningPlan: [],
  trafficLogs: [],
  firewallRules: [],
  vpnTunnels: []
};

export default function App() {
  const [report, setReport] = useState<AuditReport>(EMPTY_REPORT);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'topology' | 'vpn_app' | 'inspection' | 'vulnerabilities' | 'hardening'>('topology');
  const [isLoading, setIsLoading] = useState(false);
  const [showScopeModal, setShowScopeModal] = useState(false);
  const [isRealLiveScan, setIsRealLiveScan] = useState(false);
  const [scopeText, setScopeText] = useState('Real Live Local Network Discovery (ARP + TCP Socket Probe)');

  const selectedNode = report.nodes.find((n) => n.id === selectedNodeId);

  // 100% Real Live Local Network Scan Execution
  const handleRunAudit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/audit/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scopeDescription: scopeText,
        })
      });

      if (res.ok) {
        const newReport = await res.json();
        setReport(newReport);
        setSelectedNodeId(null);
        setIsRealLiveScan(true);
      } else {
        throw new Error('Real network scan failed');
      }
    } catch (err: any) {
      console.error('Real network scan error:', err);
    } finally {
      setIsLoading(false);
      setShowScopeModal(false);
    }
  };

  // Auto-trigger real live network scan on mount
  React.useEffect(() => {
    handleRunAudit();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-inner border border-indigo-400/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Network Security Audit & Architecture Topology Analyzer
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 hidden sm:inline-block">
                  Offline • Port 443
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Architectural topology visualization, heuristic security audits, and TCP 443 SSL-VPN gateway.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Scope Button */}
            <button
              onClick={() => setShowScopeModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" /> Target Subnet
            </button>

            {/* Run Audit */}
            <button
              onClick={handleRunAudit}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Scanning Subnets...' : 'Run Security Audit'}
            </button>
          </div>
        </div>
      </header>

      {/* Security Scope & Network Telemetry Banner */}
      <div className="bg-slate-900 border-b border-slate-800 text-slate-300 py-2.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Architectural Scope:</span>
            <span className="font-mono bg-slate-950 px-2.5 py-0.5 rounded text-indigo-300 border border-slate-800">
              {report.targetScope}
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-indigo-400" /> Bound Port:
              <strong className="text-indigo-200 font-mono">TCP 443 (TLS)</strong>
            </span>
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Avg Ping:
              <strong className="text-slate-200 font-mono">{report.summary.avgLatencyMs} ms</strong>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> Refreshed:
              <span className="font-mono">{new Date(report.timestamp).toLocaleTimeString()}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Security Score */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Security Posture
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {report.summary.securityScore}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
            </div>
            <div
              className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center ${getScoreColor(
                report.summary.securityScore
              )}`}
            >
              {report.summary.securityScore >= 80 ? 'SECURE' : report.summary.securityScore >= 60 ? 'WARNING' : 'CRITICAL'}
            </div>
          </div>

          {/* Active Nodes */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Detected Nodes
              </span>
              <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
                {report.nodes.length}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <Server className="w-5 h-5" />
            </div>
          </div>

          {/* Critical Vulnerabilities */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                CVE Vulnerabilities
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-rose-600">
                  {report.summary.totalVulnerabilities}
                </span>
                <span className="text-[11px] font-medium text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  {report.summary.criticalCount} Critical
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          {/* TCP 443 SSL-VPN Gateway */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                TCP 443 SSL-VPN
              </span>
              <span className="text-2xl font-bold font-mono text-indigo-600 mt-1 block">
                {report.summary.activeVpnTunnels} Active
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          {/* Blocked Threats */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Firewall Drops
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block">
                {report.summary.blockedTrafficCount.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs including dedicated TCP 443 VPN Sub-App */}
        <div className="flex border-b border-slate-200 gap-2 bg-white rounded-xl p-1.5 shadow-xs">
          <button
            onClick={() => setActiveTab('topology')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'topology'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" /> Architectural Topology Graph
          </button>

          <button
            onClick={() => setActiveTab('vpn_app')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'vpn_app'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4 text-amber-300" /> TCP 443 VPN Sub-App
          </button>

          <button
            onClick={() => setActiveTab('inspection')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'inspection'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" /> Traffic & Firewall Inspection
          </button>

          <button
            onClick={() => setActiveTab('vulnerabilities')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'vulnerabilities'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> CVEs & Risks ({report.summary.totalVulnerabilities})
          </button>

          <button
            onClick={() => setActiveTab('hardening')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'hardening'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Hardening Plan ({report.hardeningPlan.length})
          </button>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'topology' && (
          <TopologyMap
            nodes={report.nodes}
            connections={report.connections}
            selectedNodeId={selectedNodeId}
            onSelectNode={(id) => setSelectedNodeId(id)}
          />
        )}

        {activeTab === 'vpn_app' && <VpnGatewayApp />}

        {activeTab === 'inspection' && (
          <InspectionPanel
            trafficLogs={report.trafficLogs}
            firewallRules={report.firewallRules}
            vpnTunnels={report.vpnTunnels}
          />
        )}

        {activeTab === 'vulnerabilities' && (
          <VulnerabilityList nodes={report.nodes} onSelectNode={(id) => setSelectedNodeId(id)} />
        )}

        {activeTab === 'hardening plan' || activeTab === 'hardening' ? (
          <HardeningPlan recommendations={report.hardeningPlan} />
        ) : null}
      </main>

      {/* Target Scope Modal */}
      {showScopeModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" /> Define Target Scope & Subnet Architecture
              </h3>
              <button
                onClick={() => setShowScopeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Specify network CIDRs, VLAN architecture descriptions, or target subnets to execute offline heuristic audits:
              </p>
              <textarea
                rows={4}
                value={scopeText}
                onChange={(e) => setScopeText(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="e.g. 10.0.0.0/16 Core Transit, 192.168.10.0/24 Public DMZ with TCP 443 SSL-VPN Concentrator..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowScopeModal(false)}
                className="px-4 py-2 rounded-lg font-semibold text-xs text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRunAudit}
                className="px-4 py-2 rounded-lg font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Start Offline Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
