import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Server,
  Router as RouterIcon,
  HardDrive,
  Monitor,
  Database,
  Cloud,
  Cpu,
  Lock,
  Radio,
  Wifi,
  Activity,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Plus,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  X,
  ExternalLink,
  Sliders,
  Sparkles,
  RefreshCw,
  Terminal,
  Zap,
  Flame,
  ArrowRight
} from 'lucide-react';
import { NetworkNode, NetworkConnection } from '../types';

interface TopologyProps {
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onAddNode?: (node: Partial<NetworkNode>) => void;
  onToggleLinkStatus?: (connIndex: number) => void;
}

export const TopologyMap: React.FC<TopologyProps> = ({
  nodes,
  connections,
  selectedNodeId,
  onSelectNode,
  onAddNode,
  onToggleLinkStatus
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [showZones, setShowZones] = useState(true);
  const [animateTraffic, setAnimateTraffic] = useState(true);
  const [trafficTick, setTrafficTick] = useState(0);
  const [filterTier, setFilterTier] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeIp, setNewNodeIp] = useState('10.0.1.50');
  const [newNodeType, setNewNodeType] = useState<NetworkNode['type']>('server');
  const [newNodeTier, setNewNodeTier] = useState<NetworkNode['tier']>('app_tier');

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Initialize node positions based on node coordinates or calculate architectural tiers
  useEffect(() => {
    const initialPositions: Record<string, { x: number; y: number }> = {};
    nodes.forEach((node, idx) => {
      if (node.position) {
        initialPositions[node.id] = { ...node.position };
      } else {
        // Fallback architectural placement
        const tierY =
          node.tier === 'wan'
            ? 60
            : node.tier === 'edge_dmz'
            ? 200
            : node.tier === 'core_switch'
            ? 350
            : 500;
        const tierNodes = nodes.filter((n) => n.tier === node.tier || (!node.tier && n.type === node.type));
        const tierIdx = tierNodes.findIndex((n) => n.id === node.id);
        const spacing = 900 / Math.max(tierNodes.length + 1, 2);
        initialPositions[node.id] = {
          x: 100 + (tierIdx + 1) * spacing,
          y: tierY
        };
      }
    });
    setNodePositions(initialPositions);
  }, [nodes]);

  // Animation ticker for packet particles
  useEffect(() => {
    if (!animateTraffic) return;
    const interval = setInterval(() => {
      setTrafficTick((prev) => (prev + 1) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, [animateTraffic]);

  // Handle canvas panning
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (draggedNodeId) return;
    if (e.target === svgRef.current || (e.target as HTMLElement).tagName === 'rect') {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (draggedNodeId && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left - pan.x) / zoom;
      const rawY = (e.clientY - rect.top - pan.y) / zoom;
      setNodePositions((prev) => ({
        ...prev,
        [draggedNodeId]: { x: Math.max(40, Math.min(1000, rawX)), y: Math.max(30, Math.min(650, rawY)) }
      }));
    }
  };

  const handleMouseUpCanvas = () => {
    setIsDraggingCanvas(false);
    setDraggedNodeId(null);
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getNodeIcon = (type: NetworkNode['type']) => {
    switch (type) {
      case 'firewall':
        return <Shield className="w-5 h-5 text-amber-400" />;
      case 'vpn_gateway':
        return <Lock className="w-5 h-5 text-indigo-400" />;
      case 'router':
        return <RouterIcon className="w-5 h-5 text-sky-400" />;
      case 'switch':
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'server':
        return <Server className="w-5 h-5 text-blue-400" />;
      case 'database':
        return <Database className="w-5 h-5 text-emerald-400" />;
      case 'cloud':
        return <Cloud className="w-5 h-5 text-purple-400" />;
      case 'workstation':
        return <Monitor className="w-5 h-5 text-slate-300" />;
      case 'iot':
        return <Radio className="w-5 h-5 text-rose-400" />;
      default:
        return <HardDrive className="w-5 h-5 text-slate-400" />;
    }
  };

  const getNodeBorderColor = (status: NetworkNode['status'], isSelected: boolean) => {
    if (isSelected) return '#6366f1'; // Indigo ring
    if (status === 'vulnerable') return '#f43f5e'; // Red
    if (status === 'warning') return '#f59e0b'; // Amber
    return '#10b981'; // Emerald
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Extract real primary subnet from discovered nodes
  const detectedSubnet = nodes.find(n => n.subnet)?.subnet || 'Live Subnet';

  // Architectural Zones definitions for visual enclosures adapting to real discovered subnet
  const ARCHITECTURAL_ZONES = [
    {
      id: 'zone-wan',
      title: 'WAN / External Ingress & Remote Access',
      tier: 'wan',
      subnet: 'Internet Transit & TCP 443 SSL-VPN Ingress',
      x: 30,
      y: 15,
      width: 980,
      height: 100,
      color: 'rgba(147, 51, 234, 0.08)',
      borderColor: 'rgba(168, 85, 247, 0.35)',
      badgeBg: 'bg-purple-950/60 text-purple-300 border-purple-800'
    },
    {
      id: 'zone-edge',
      title: 'Perimeter Security & Gateway Router',
      tier: 'edge_dmz',
      subnet: `Default Gateway & Ingress (${detectedSubnet})`,
      x: 30,
      y: 135,
      width: 980,
      height: 120,
      color: 'rgba(234, 88, 12, 0.08)',
      borderColor: 'rgba(249, 115, 22, 0.35)',
      badgeBg: 'bg-orange-950/60 text-orange-300 border-orange-800'
    },
    {
      id: 'zone-core',
      title: 'Discovered Local Network Hosts',
      tier: 'internal_lan',
      subnet: `Discovered LAN Hosts on ${detectedSubnet}`,
      x: 30,
      y: 280,
      width: 980,
      height: 140,
      color: 'rgba(14, 165, 233, 0.08)',
      borderColor: 'rgba(56, 189, 248, 0.35)',
      badgeBg: 'bg-sky-950/60 text-sky-300 border-sky-800'
    },
    {
      id: 'zone-workloads',
      title: 'Local Loopback & Running Sockets',
      tier: 'app_tier',
      subnet: '127.0.0.1 Loopback & Development Listeners',
      x: 30,
      y: 445,
      width: 980,
      height: 160,
      color: 'rgba(16, 185, 129, 0.08)',
      borderColor: 'rgba(52, 211, 153, 0.35)',
      badgeBg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 relative">
      {/* Top Header & Architectural Controls Bar */}
      <div className="bg-slate-950/90 backdrop-blur border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-20">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/40 rounded-xl">
              <Layers className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Real Enterprise Network Topology & Architectural Graph
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Offline Engine Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                True hierarchical tiers: WAN & TCP 443 Ingress → Edge DMZ → Core Distribution → Production Segments.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons & View Controls */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Toggle Architectural Zones */}
          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-3 py-1.5 rounded-lg font-medium border transition-all flex items-center gap-1.5 ${
              showZones
                ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {showZones ? 'Hide Zones' : 'Show Zones'}
          </button>

          {/* Toggle Traffic Packet Animation */}
          <button
            onClick={() => setAnimateTraffic(!animateTraffic)}
            className={`px-3 py-1.5 rounded-lg font-medium border transition-all flex items-center gap-1.5 ${
              animateTraffic
                ? 'bg-emerald-600/30 text-emerald-200 border-emerald-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {animateTraffic ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5" />}
            {animateTraffic ? 'Live Traffic ON' : 'Paused Traffic'}
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-400">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white border-l border-slate-700 ml-0.5"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        className="relative w-full h-[620px] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDownCanvas}
        onMouseMove={handleMouseMoveCanvas}
        onMouseUp={handleMouseUpCanvas}
        onMouseLeave={handleMouseUpCanvas}
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox="0 0 1040 640"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isDraggingCanvas || draggedNodeId ? 'none' : 'transform 0.15s ease-out'
          }}
        >
          <defs>
            {/* Gradients & Filters */}
            <linearGradient id="wanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#7e22ce" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="edgeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#c2410c" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="coreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="workloadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.02" />
            </linearGradient>

            {/* Glowing filters for links */}
            <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-indigo" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="nodeShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Architectural Zone Bounding Enclosures */}
          {showZones && (
            <g className="architectural-zones">
              {ARCHITECTURAL_ZONES.map((z) => (
                <g key={z.id}>
                  <rect
                    x={z.x}
                    y={z.y}
                    width={z.width}
                    height={z.height}
                    rx="14"
                    fill={
                      z.tier === 'wan'
                        ? 'url(#wanGrad)'
                        : z.tier === 'edge_dmz'
                        ? 'url(#edgeGrad)'
                        : z.tier === 'core_switch'
                        ? 'url(#coreGrad)'
                        : 'url(#workloadGrad)'
                    }
                    stroke={z.borderColor}
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                  />
                  {/* Zone Label Tag */}
                  <rect
                    x={z.x + 12}
                    y={z.y + 10}
                    width={z.title.length * 7.5 + 30}
                    height="22"
                    rx="6"
                    fill="#0f172a"
                    stroke={z.borderColor}
                    strokeWidth="1"
                  />
                  <text
                    x={z.x + 20}
                    y={z.y + 25}
                    fill="#e2e8f0"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="sans-serif"
                  >
                    {z.title}
                  </text>
                  <text
                    x={z.x + z.title.length * 7.5 + 50}
                    y={z.y + 25}
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {z.subnet}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* Network Link Lines & Animated Packets */}
          <g className="network-connections">
            {connections.map((conn, idx) => {
              const fromPos = nodePositions[conn.from];
              const toPos = nodePositions[conn.to];
              if (!fromPos || !toPos) return null;

              const isVpn = conn.type === 'vpn';
              const isFiber = conn.type === 'fiber';
              const isDegraded = conn.status === 'degraded';

              // Calculate midpoint for bezier curve or straight path
              const dx = toPos.x - fromPos.x;
              const dy = toPos.y - fromPos.y;
              const midX = (fromPos.x + toPos.x) / 2;
              const midY = (fromPos.y + toPos.y) / 2;
              const curveOffset = Math.abs(dx) > 100 && Math.abs(dy) > 100 ? (dx > 0 ? 25 : -25) : 0;
              const pathData = `M ${fromPos.x} ${fromPos.y} Q ${midX + curveOffset} ${midY} ${toPos.x} ${toPos.y}`;

              // Determine color
              let linkStroke = '#475569';
              if (isVpn) linkStroke = '#818cf8'; // Indigo for VPN
              else if (isFiber) linkStroke = '#38bdf8'; // Cyan for 10G Fiber
              else if (isDegraded) linkStroke = '#f59e0b'; // Amber
              else linkStroke = '#3b82f6';

              // Packet particle position calculation (0 to 100)
              const t = ((trafficTick * 1.5 + idx * 20) % 100) / 100;
              // Quadratic bezier point: B(t) = (1-t)^2*P0 + 2*(1-t)*t*P1 + t^2*P2
              const cpX = midX + curveOffset;
              const cpY = midY;
              const pX = (1 - t) * (1 - t) * fromPos.x + 2 * (1 - t) * t * cpX + t * t * toPos.x;
              const pY = (1 - t) * (1 - t) * fromPos.y + 2 * (1 - t) * t * cpY + t * t * toPos.y;

              return (
                <g key={conn.id || idx}>
                  {/* Background halo link line */}
                  <path
                    d={pathData}
                    stroke={linkStroke}
                    strokeWidth={isVpn ? 3 : isFiber ? 2.5 : 2}
                    strokeOpacity={isVpn ? 0.8 : 0.6}
                    strokeDasharray={isVpn ? '6 4' : isDegraded ? '4 4' : 'none'}
                    fill="none"
                  />

                  {/* Flow Speed / Port Badge on Hover or midpoint */}
                  <circle cx={midX + curveOffset * 0.5} cy={midY} r="3" fill={linkStroke} />

                  {/* Animated Particle Pulse */}
                  {animateTraffic && (
                    <circle
                      cx={pX}
                      cy={pY}
                      r={isVpn ? 4.5 : 3.5}
                      fill={isVpn ? '#c084fc' : isFiber ? '#67e8f9' : '#34d399'}
                      filter={isVpn ? 'url(#glow-indigo)' : 'url(#glow-green)'}
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* Empty State when no nodes exist */}
          {nodes.length === 0 && (
            <g transform="translate(520, 300)">
              <rect x="-190" y="-55" width="380" height="110" rx="16" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
              <text x="0" y="-10" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">No Live Network Hosts Discovered</text>
              <text x="0" y="16" textAnchor="middle" fill="#64748b" fontSize="12">Click "Live Local Subnet Scan" above to discover active hosts</text>
            </g>
          )}

          {/* Interactive Network Nodes */}
          <g className="network-nodes">
            {nodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const isSelected = selectedNodeId === node.id;
              const borderColor = getNodeBorderColor(node.status, isSelected);
              const openPorts = node.services.filter((s) => s.status === 'open').length;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggedNodeId(node.id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectNode(isSelected ? null : node.id);
                  }}
                >
                  {/* Selection Pulsing Aura */}
                  {isSelected && (
                    <circle
                      r="36"
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      className="animate-spin"
                      style={{ animationDuration: '8s' }}
                    />
                  )}

                  {/* Status Indicator Glow */}
                  {node.status === 'vulnerable' && (
                    <circle r="32" fill="#f43f5e" fillOpacity="0.2" className="animate-ping" style={{ animationDuration: '3s' }} />
                  )}

                  {/* Node Outer Circle / Background Box */}
                  <rect
                    x="-24"
                    y="-24"
                    width="48"
                    height="48"
                    rx="14"
                    fill="#0f172a"
                    stroke={borderColor}
                    strokeWidth={isSelected ? '3' : '2'}
                    filter="url(#nodeShadow)"
                    className="transition-transform group-hover:scale-110 duration-150"
                  />

                  {/* Node Icon */}
                  <g transform="translate(-10, -10)">
                    {getNodeIcon(node.type)}
                  </g>

                  {/* Small Status Badge Dot on Top Right */}
                  <circle
                    cx="18"
                    cy="-18"
                    r="5.5"
                    fill={
                      node.status === 'vulnerable'
                        ? '#f43f5e'
                        : node.status === 'warning'
                        ? '#f59e0b'
                        : '#10b981'
                    }
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />

                  {/* Node Label & IP Pill under the icon */}
                  <g transform="translate(0, 36)">
                    <rect
                      x={-Math.max(node.label.length * 3.6, 45)}
                      y="-4"
                      width={Math.max(node.label.length * 7.2, 90)}
                      height="28"
                      rx="6"
                      fill="#020617"
                      fillOpacity="0.85"
                      stroke={isSelected ? '#6366f1' : '#334155'}
                      strokeWidth="1"
                    />
                    <text
                      y="7"
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="10"
                      fontWeight="600"
                      fontFamily="sans-serif"
                    >
                      {node.label.length > 22 ? `${node.label.slice(0, 20)}...` : node.label}
                    </text>
                    <text
                      y="18"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {node.ip}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Legend Overlay at Bottom Left */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl px-4 py-2.5 shadow-lg text-[11px] space-y-1.5 pointer-events-auto">
          <div className="font-semibold text-slate-300 text-[10px] uppercase tracking-wider mb-1">
            Topology Legend
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Secure
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Warning
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Vulnerable
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-indigo-400 border-dashed"></span> TCP 443 VPN
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-sky-400"></span> 10G Fiber
            </span>
          </div>
        </div>

        {/* Floating Node Quick Deep-Dive Sidebar Drawer */}
        {selectedNode && (
          <div className="absolute top-3 right-3 bottom-3 w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-5 overflow-y-auto space-y-4 text-xs z-30 transition-all">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  {getNodeIcon(selectedNode.type)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm leading-tight">{selectedNode.label}</h3>
                  <p className="font-mono text-indigo-400 text-xs mt-0.5">{selectedNode.ip}</p>
                </div>
              </div>
              <button
                onClick={() => onSelectNode(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hardware & OS Telemetry */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">OS / Firmware</span>
                <span className="font-semibold text-slate-200 truncate block mt-0.5">{selectedNode.os}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Subnet / VLAN</span>
                <span className="font-mono text-slate-200 block mt-0.5 truncate">{selectedNode.subnet}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Ping Latency</span>
                <span className="font-mono font-bold text-emerald-400 block mt-0.5">
                  {selectedNode.pingLatencyMs} ms
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Uptime</span>
                <span className="font-mono text-slate-200 block mt-0.5">{selectedNode.uptime}</span>
              </div>
            </div>

            {/* Bandwidth & CPU Utilization */}
            <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">CPU Load:</span>
                <span className="font-mono font-bold text-slate-200">{selectedNode.cpuUsagePct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    selectedNode.cpuUsagePct > 75
                      ? 'bg-rose-500'
                      : selectedNode.cpuUsagePct > 50
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${selectedNode.cpuUsagePct}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center text-[11px] pt-1">
                <span className="text-slate-400">Bandwidth:</span>
                <span className="font-mono text-slate-300">
                  ↓ {selectedNode.bandwidthMbps.rx} Mb/s | ↑ {selectedNode.bandwidthMbps.tx} Mb/s
                </span>
              </div>
            </div>

            {/* Active Listening Services & Ports */}
            <div>
              <h4 className="font-bold text-slate-300 text-[11px] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Listening Sockets & Ports</span>
                <span className="text-indigo-400 font-mono text-[10px]">
                  {selectedNode.services.length} Total
                </span>
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {selectedNode.services.map((srv, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-mono font-bold text-[10px]">
                        {srv.port}/{srv.protocol}
                      </span>
                      <span className="font-medium text-slate-200">{srv.name}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[10px] truncate max-w-[100px]">
                      {srv.version}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Discovered Vulnerabilities on this Node */}
            {selectedNode.vulnerabilities.length > 0 ? (
              <div>
                <h4 className="font-bold text-rose-400 text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  Security Vulnerabilities ({selectedNode.vulnerabilities.length})
                </h4>
                <div className="space-y-2">
                  {selectedNode.vulnerabilities.map((vuln) => (
                    <div
                      key={vuln.id}
                      className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/50 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-300 text-xs">{vuln.title}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-900/60 text-rose-200 border border-rose-700">
                          {vuln.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">{vuln.description}</p>
                      <div className="pt-1.5 border-t border-rose-900/40 text-[10px] text-rose-200 font-mono">
                        <strong>Remediation:</strong> {vuln.mitigation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/50 flex items-center gap-2 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Node has passed all defensive baseline security checks.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Discovered Architectural Routes Footer Bar */}
      <div className="bg-slate-950 border-t border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span>Architectural Links:</span>
          <strong className="text-white font-mono">{connections.length} Interconnections</strong>
        </div>
        <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
          <span>WAN Gateway: 198.51.100.254</span>
          <span>•</span>
          <span>SSL-VPN Port: TCP 443</span>
          <span>•</span>
          <span>L3 Core Backbone: 10 Gbps</span>
        </div>
      </div>
    </div>
  );
};
