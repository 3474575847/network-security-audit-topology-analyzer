export interface NetworkNode {
  id: string;
  label: string;
  ip: string;
  type: 'router' | 'firewall' | 'switch' | 'server' | 'database' | 'workstation' | 'cloud' | 'iot' | 'vpn_gateway';
  tier?: 'wan' | 'edge_dmz' | 'core_switch' | 'app_tier' | 'db_tier' | 'internal_lan' | 'iot_tier';
  os: string;
  status: 'secure' | 'warning' | 'vulnerable';
  subnet: string;
  uptime: string;
  pingLatencyMs: number;
  bandwidthMbps: { rx: number; tx: number };
  cpuUsagePct: number;
  memoryUsagePct: number;
  services: NetworkService[];
  vulnerabilities: Vulnerability[];
  position?: { x: number; y: number };
  zone?: string;
  macAddress?: string;
  vlan?: number;
}

export interface NetworkService {
  port: number;
  name: string;
  protocol: string;
  version: string;
  status: 'open' | 'filtered' | 'closed';
}

export interface Vulnerability {
  id: string;
  cve?: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  description: string;
  impact: string;
  mitigation: string; // Defensive remediation & hardening guidance
}

export interface NetworkConnection {
  id?: string;
  from: string;
  to: string;
  type: 'ethernet' | 'fiber' | 'vpn' | 'wireless';
  status: 'active' | 'degraded' | 'idle' | 'failed';
  bandwidthUsagePct: number;
  portFrom?: number;
  portTo?: number;
  speed?: string;
}

export interface TrafficFlow {
  id: string;
  timestamp: string;
  sourceIp: string;
  sourceLabel: string;
  destIp: string;
  destLabel: string;
  protocol: string;
  port: number;
  bytes: number;
  packets: number;
  action: 'ALLOWED' | 'BLOCKED' | 'FLAGGED';
  inspectionNotes?: string;
}

export interface FirewallRule {
  id: string;
  name: string;
  action: 'ACCEPT' | 'DROP' | 'REJECT' | 'LOG';
  direction: 'INBOUND' | 'OUTBOUND' | 'FORWARD';
  source: string;
  destination: string;
  protocol: string;
  ports: string;
  hits: number;
  status: 'enabled' | 'disabled';
}

export interface VpnTunnel {
  id: string;
  name: string;
  endpointIp: string;
  remoteSubnet: string;
  protocol: 'IPsec' | 'WireGuard' | 'OpenVPN' | 'SSTP-TCP443';
  status: 'connected' | 'rekeying' | 'disconnected';
  activeSessions: number;
  bandwidthMbps: { rx: number; tx: number };
  latencyMs: number;
  encryption: string;
  port?: number;
}

export interface AuditReport {
  id: string;
  timestamp: string;
  targetScope: string;
  summary: {
    totalNodes: number;
    totalVulnerabilities: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    securityScore: number; // 0-100
    activeVpnTunnels: number;
    blockedTrafficCount: number;
    avgLatencyMs: number;
  };
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  hardeningPlan: HardeningRecommendation[];
  trafficLogs: TrafficFlow[];
  firewallRules: FirewallRule[];
  vpnTunnels: VpnTunnel[];
}

export interface HardeningRecommendation {
  id: string;
  category: 'Firewall / ACL' | 'Patch Management' | 'Authentication & Access' | 'Service Hardening' | 'Segment Isolation';
  title: string;
  priority: 'Immediate' | 'High' | 'Medium' | 'Low';
  affectedNodes: string[];
  remediationSteps: string[];
  refConfigExample: string;
}

export interface VpnClientSession {
  connected: boolean;
  status: 'DISCONNECTED' | 'INITIALIZING_TLS' | 'HANDSHAKE' | 'KEY_EXCHANGE' | 'AUTHENTICATED' | 'TUNNEL_ACTIVE';
  tunnelIp: string;
  gatewayIp: string;
  gatewayPort: number;
  protocol: 'TCP-443-TLS1.3' | 'OpenVPN-TCP-443' | 'WireGuard-TCP-443' | 'SSTP-443';
  cipher: string;
  uptimeSeconds: number;
  rxBytes: number;
  txBytes: number;
  currentRxMbps: number;
  currentTxMbps: number;
  latencyMs: number;
  packetLossPct: number;
  killSwitchActive: boolean;
  dnsLeakProtection: boolean;
  splitTunneling: boolean;
  allowedSubnets: string[];
}

export interface VpnHandshakeStep {
  step: number;
  title: string;
  direction: 'client_to_server' | 'server_to_client' | 'internal';
  protocol: string;
  details: string;
  timestamp: string;
  status: 'pending' | 'active' | 'completed';
}
