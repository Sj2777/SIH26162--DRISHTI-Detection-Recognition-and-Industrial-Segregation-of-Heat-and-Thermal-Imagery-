import React from 'react';
import { Asset } from '../../types';

interface AssetTableProps {
  assets: Asset[];
}

export const AssetTable: React.FC<AssetTableProps> = ({ assets }) => {
  return (
    <div className="bg-[#121820] border border-[#233140] rounded overflow-hidden mt-6">
      {/* Table Header Section */}
      <div className="bg-[#16202c] border-b border-[#233140] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
            Asset Health & Telemetry Status
          </span>
          <span className="text-[10px] font-mono text-[#7e90a5] bg-[#0b0f15] px-2 py-0.5 rounded border border-[#233140]">
            {assets.length} MONITORED UNITS
          </span>
        </div>
        <div className="text-[11px] font-mono text-[#64748b] hidden sm:block">
          LIVE CONDITION INDEX
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1e2a38] bg-[#0e131a] text-[#7e90a5] font-mono uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-4">Asset</th>
              <th className="py-2.5 px-4">Type</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4">Risk</th>
              <th className="py-2.5 px-4">Operational Condition</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a232f]">
            {assets.map((asset) => {
              const isCritical = asset.status === 'CRITICAL';
              const isWarning = asset.status === 'WARNING';

              return (
                <tr
                  key={asset.id}
                  className={`hover:bg-[#16202c]/80 transition-colors ${
                    isCritical ? 'bg-[#291316]/20' : ''
                  }`}
                >
                  {/* Asset Name + Tag */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCritical
                            ? 'bg-[#ef4444]'
                            : isWarning
                            ? 'bg-[#f59e0b]'
                            : 'bg-[#10b981]'
                        }`}
                      />
                      <span className="font-semibold text-slate-200">{asset.name}</span>
                      <span className="text-[10px] font-mono text-[#64748b]">
                        ({asset.id})
                      </span>
                    </div>
                  </td>

                  {/* Asset Type */}
                  <td className="py-3 px-4 font-mono text-[#94a3b8]">
                    {asset.type}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block font-mono text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        isCritical
                          ? 'bg-[#450a0a]/80 text-[#fca5a5] border-[#dc2626]/60'
                          : isWarning
                          ? 'bg-[#451a03]/80 text-[#fcd34d] border-[#b45309]/60'
                          : 'bg-[#064e3b]/80 text-[#6ee7b7] border-[#059669]/60'
                      }`}
                    >
                      {asset.status}
                    </span>
                  </td>

                  {/* Risk Badge */}
                  <td className="py-3 px-4 font-mono font-semibold">
                    <span
                      className={
                        asset.risk === 'HIGH'
                          ? 'text-[#ef4444]'
                          : asset.risk === 'MEDIUM'
                          ? 'text-[#f59e0b]'
                          : 'text-[#10b981]'
                      }
                    >
                      {asset.risk}
                    </span>
                  </td>

                  {/* Condition Description */}
                  <td className="py-3 px-4 text-[#cbd5e1] max-w-md">
                    {asset.condition}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
