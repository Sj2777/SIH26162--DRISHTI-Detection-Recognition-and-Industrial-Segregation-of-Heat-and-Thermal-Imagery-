import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-8 border-t border-[#1e2a38] py-4 px-6 text-center text-xs text-[#64748b]">
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="tracking-wide">
          <span className="font-semibold text-[#f59e0b]/90">DEMO ENVIRONMENT</span> — Facility and operational data are simulated.
        </p>
        <p className="font-mono text-[11px] text-[#475569]">
          AGNI-VISION Industrial Safety Platform • Local Hackathon Build
        </p>
      </div>
    </footer>
  );
};
