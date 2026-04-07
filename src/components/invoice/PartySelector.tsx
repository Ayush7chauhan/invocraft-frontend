import React from "react";
import { User, MapPin, Phone } from "lucide-react";
import { Autocomplete } from "../ui/autocomplete";

interface PartySelectorProps {
  parties: any[];
  selectedPartyId: string;
  onSelect: (id: string) => void;
  error?: string;
}

const PartySelector: React.FC<PartySelectorProps> = ({
  parties,
  selectedPartyId,
  onSelect,
  error,
}) => {
  const selectedParty = parties.find(p => p.id.toString() === selectedPartyId);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Customer / Party</label>
        <Autocomplete
          options={parties.map((p) => ({
            value: p.id.toString(),
            label: p.name,
          }))}
          value={selectedPartyId}
          onValueChange={onSelect}
          placeholder="Search customer name..."
          className={error ? "border-red-500" : ""}
        />
        {error && <p className="text-[10px] font-bold text-red-500 uppercase ml-1">{error}</p>}
      </div>

      {selectedParty && (
        <div className="p-4 bg-gray-50/50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-green-500" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{selectedParty.name}</p>
              <div className="flex flex-col gap-1">
                {selectedParty.mobile && (
                  <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase">
                    <Phone className="w-2.5 h-2.5" /> {selectedParty.mobile}
                  </p>
                )}
                {selectedParty.address && (
                  <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase truncate">
                    <MapPin className="w-2.5 h-2.5" /> {selectedParty.address}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartySelector;
