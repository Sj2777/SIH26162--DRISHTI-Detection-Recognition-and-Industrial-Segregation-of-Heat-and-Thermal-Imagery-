import React, { useState } from 'react';
import { EvidenceItem } from '../../types';

interface EvidencePanelProps {
  evidenceList: EvidenceItem[];
  onSubmitEvidence: (type: string, description: string, source: string) => Promise<void>;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  evidenceList,
  onSubmitEvidence,
}) => {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [evidenceType, setEvidenceType] = useState<string>('THERMAL_PHOTO');
  const [description, setDescription] = useState<string>('');
  const [source, setSource] = useState<string>('FIELD_OPERATOR');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      setLoading(true);
      await onSubmitEvidence(evidenceType, description, source);
      setDescription('');
      setShowAddForm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121820] border border-[#233140] rounded overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-[#16202c] border-b border-[#233140] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase font-mono">
            FACILITY EVIDENCE
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0b0f15] border border-[#233140] text-[#7e90a5]">
            {evidenceList.length} SUBMITTED RECORDS
          </span>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white font-mono text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1"
        >
          <span>+</span> ADD EVIDENCE
        </button>
      </div>

      <div className="p-4">
        {/* Add Evidence Form */}
        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-4 bg-[#16202c] border border-[#2b3d52] p-4 rounded text-xs font-mono"
          >
            <div className="text-xs font-bold text-slate-100 uppercase mb-3 pb-1 border-b border-[#243242]">
              SUBMIT EVIDENCE RECORD
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[10px] text-[#7e90a5] uppercase block mb-1">
                  Evidence Type
                </label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  className="w-full bg-[#0b0f15] border border-[#243242] rounded p-2 text-slate-200 focus:outline-none focus:border-[#0284c7]"
                >
                  <option value="THERMAL_PHOTO">Thermal Photo</option>
                  <option value="FIELD_PHOTO">Field Photo</option>
                  <option value="SENSOR_READING">Sensor Reading</option>
                  <option value="INSPECTION_NOTE">Inspection Note</option>
                  <option value="MAINTENANCE_RECORD">Maintenance Record</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#7e90a5] uppercase block mb-1">
                  Submitting Source
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full bg-[#0b0f15] border border-[#243242] rounded p-2 text-slate-200 focus:outline-none focus:border-[#0284c7]"
                >
                  <option value="FIELD_OPERATOR">Field Operator</option>
                  <option value="SAFETY_OFFICER">Safety Officer</option>
                  <option value="INSTRUMENT_TECH">Instrument Technician</option>
                  <option value="CONTROL_ROOM_DCS">Control Room DCS</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="text-[10px] text-[#7e90a5] uppercase block mb-1">
                Description / Technical Observations
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail field findings (e.g. handheld FLIR image confirms localized warming at rim seal)..."
                required
                className="w-full bg-[#0b0f15] border border-[#243242] rounded p-2 text-slate-200 focus:outline-none focus:border-[#0284c7] h-20"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded border border-[#2b3a4c] text-slate-300 hover:bg-[#1a232f]"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold uppercase"
              >
                {loading ? 'SUBMITTING...' : 'SUBMIT EVIDENCE'}
              </button>
            </div>
          </form>
        )}

        {/* Evidence List */}
        {evidenceList.length === 0 ? (
          <div className="text-center py-6 text-xs font-mono text-[#64748b]">
            No evidence submitted yet. Click "ADD EVIDENCE" to append inspection photos, sniffer readings, or field notes.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {evidenceList.map((item) => (
              <div
                key={item.id}
                className="bg-[#151c26] border border-[#243242] rounded p-3 text-xs font-mono"
              >
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#1e2a38]">
                  <span className="font-bold text-[#38bdf8] uppercase">
                    {item.type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-[#7e90a5]">{item.timestamp}</span>
                </div>
                <p className="text-slate-200 font-sans text-xs leading-relaxed mb-2">
                  {item.description}
                </p>
                <div className="text-[10px] text-[#64748b] flex justify-between items-center pt-1 border-t border-[#1e2a38]/60">
                  <span>SOURCE: {item.source}</span>
                  <span className="text-emerald-400">VERIFIED LOG</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
