import React from 'react';
import {
  Activity,
  Shield,
  Lock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Radio
} from 'lucide-react';
import { TrafficFlow, FirewallRule, VpnTunnel } from '../types';

interface InspectionProps {
  trafficLogs: TrafficFlow[];
  firewallRules: FirewallRule[];
  vpnTunnels: VpnTunnel[];
}

export const InspectionPanel: React.FC<InspectionProps> = ({
  trafficLogs,
  firewallRules,
  vpnTunnels
}) => {
  return (
    <div className="space-y-6">
      {/* VPN Concentrators & Active Tunnels */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" /> Active VPN Tunnels & Encrypted Interfaces
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Encrypted TCP 443 / Browser Proxy Tunnel Telemetry.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {vpnTunnels.length} Concentrators Configured
          </span>
        </div>

        {vpnTunnels.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No Active VPN Tunnels Detected</p>
            <p className="text-xs text-slate-500 mt-1">Launch the TCP 443 Personal VPN or configure the browser proxy to start tunneling traffic.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vpnTunnels.map((vpn) => (
              <div
                key={vpn.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{vpn.name}</h3>
                    <p className="text-xs font-mono text-slate-500">
                      Endpoint: {vpn.endpointIp} | Subnet: {vpn.remoteSubnet}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                    vpn.status === 'connected' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-700 border border-slate-300'
                  }`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {vpn.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Protocol</span>
                    <span className="font-semibold text-slate-800">{vpn.protocol}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Active Sessions</span>
                    <span className="font-semibold text-indigo-600">{vpn.activeSessions} Tunnels</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Latency</span>
                    <span className="font-mono font-semibold text-slate-800">{vpn.latencyMs} ms</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 text-[11px] font-mono text-slate-600 flex items-center justify-between">
                  <span>Cipher: {vpn.encryption}</span>
                  <span className="text-slate-500">
                    Relayed: {vpn.bandwidthMbps.rx} MB
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Traffic Flow Inspection Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" /> Real-Time Traffic Flow & Deep Packet Inspection
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Live ingress/egress network flows through the local proxy tunnel.
            </p>
          </div>
        </div>

        {trafficLogs.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Radio className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-pulse" />
            <p className="text-sm font-semibold text-slate-700">No Live Proxy Traffic Recorded Yet</p>
            <p className="text-xs text-slate-500 mt-1">Traffic will stream here in real time as requests traverse the local TCP 443 / 8888 proxy.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Source Host</th>
                  <th className="p-3">Destination Host</th>
                  <th className="p-3">Proto / Port</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Deep Inspection Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {trafficLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-slate-400">{log.timestamp}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-800 block">{log.sourceIp}</span>
                      <span className="text-[10px] font-sans text-slate-500">{log.sourceLabel}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-800 block">{log.destIp}</span>
                      <span className="text-[10px] font-sans text-slate-500">{log.destLabel}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold text-slate-700">
                        {log.protocol}:{log.port}
                      </span>
                    </td>
                    <td className="p-3 font-sans">
                      {log.action === 'ALLOWED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ALLOWED
                        </span>
                      )}
                      {log.action === 'BLOCKED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
                          <XCircle className="w-3 h-3 text-rose-600" /> BLOCKED
                        </span>
                      )}
                      {log.action === 'FLAGGED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> FLAGGED
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-sans text-slate-600 max-w-xs leading-tight">
                      {log.inspectionNotes || 'Standard flow verified.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Firewall Rules Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" /> Active Firewall ACL Policies & System Sockets
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Active OS packet filtering state and port listening rules.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {firewallRules.map((rule) => (
            <div
              key={rule.id}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-1 rounded font-mono font-bold text-[10px] ${
                    rule.action === 'ACCEPT'
                      ? 'bg-emerald-100 text-emerald-800'
                      : rule.action === 'DROP'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {rule.action}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900">{rule.name}</h3>
                  <p className="font-mono text-[11px] text-slate-500">
                    {rule.direction} | Src: {rule.source} → Dst: {rule.destination} ({rule.protocol}:{rule.ports})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-500 text-xs font-mono">
                <span>Matched Connections: <strong className="text-slate-800">{rule.hits.toLocaleString()}</strong></span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold uppercase text-[10px]">
                  {rule.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
