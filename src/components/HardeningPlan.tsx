import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckSquare,
  Copy,
  Check,
  AlertCircle,
  Code,
  Sliders,
  Terminal,
  FileText
} from 'lucide-react';
import { HardeningRecommendation } from '../types';

interface HardeningPlanProps {
  hardeningPlan: HardeningRecommendation[];
}

export const HardeningPlan: React.FC<HardeningPlanProps> = ({ hardeningPlan }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPriorityBadge = (priority: HardeningRecommendation['priority']) => {
    switch (priority) {
      case 'Immediate':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            IMMEDIATE
          </span>
        );
      case 'High':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">
            HIGH
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Security Hardening & Defensive Action Plan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Prioritized defensive controls, configuration policy changes, firewall rule definitions, and patch guidelines.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {hardeningPlan.map((plan) => (
          <div
            key={plan.id}
            className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 hover:border-slate-300 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                {getPriorityBadge(plan.priority)}
                <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                  {plan.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{plan.title}</h3>
              </div>
              <div className="text-xs text-slate-500">
                <span>Targets: </span>
                <span className="font-mono text-slate-700 font-medium">
                  {plan.affectedNodes.join(', ')}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Step-by-Step Action Items */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" /> Step-by-Step Remediation Sequence
                </h4>
                <ul className="space-y-2">
                  {plan.remediationSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Defensive Configuration Snippet */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-indigo-600" /> Reference Security Policy Snippet
                  </h4>
                  <button
                    onClick={() => handleCopy(plan.id, plan.refConfigExample)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    {copiedId === plan.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Code
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-900 text-slate-100 p-3.5 rounded-lg font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
                  <code>{plan.refConfigExample}</code>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
