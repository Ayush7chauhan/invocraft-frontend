import React from "react";
import { User, MapPin, Phone, Search } from "lucide-react";
import { Autocomplete } from "../ui/autocomplete";

interface PartySelectorProps {
  parties: any[];
  selectedPartyId: string | number;
  onSelect: (value: string | number) => void;
  error?: string;
}

const PartySelector: React.FC<PartySelectorProps> = ({
  parties,
  selectedPartyId,
  onSelect,
  error,
}) => {
  const selectedParty = parties.find(p => p.id.toString() === selectedPartyId?.toString());

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 ml-1">
          <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Search className="w-3.5 h-3.5 text-green-600" />
          </div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Select Customer / Party
          </label>
        </div>
        <Autocomplete
          options={parties.map((p) => ({
            value: p.id.toString(),
            label: p.name,
          }))}
          value={selectedPartyId?.toString() || ""}
          onValueChange={(val) => onSelect(Number(val))}
          placeholder="Search customer by name or phone..."
          className={error ? "border-red-500 ring-2 ring-red-500/10" : ""}
        />
        {error && (
          <p className="text-[10px] font-bold text-red-500 uppercase ml-1 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>

      {selectedParty && (
        <div className="p-5 bg-white dark:bg-gray-800/50 rounded-[28px] border-2 border-gray-50 dark:border-gray-800 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-green-500" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">
                {selectedParty.name}
              </p>
              <div className="flex flex-col gap-1.5">
                {selectedParty.mobile && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                    <div className="p-1 rounded-md bg-gray-100 dark:bg-gray-700">
                      <Phone className="w-2.5 h-2.5" />
                    </div>
                    {selectedParty.mobile}
                  </div>
                )}
                {selectedParty.address && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase truncate">
                    <div className="p-1 rounded-md bg-gray-100 dark:bg-gray-700">
                      <MapPin className="w-2.5 h-2.5" />
                    </div>
                    {selectedParty.address}
                  </div>
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
