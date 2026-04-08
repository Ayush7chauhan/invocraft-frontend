import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import Button from "./Button";

interface DownloadButtonProps {
  data: any[];
  filename: string;
  sheetName?: string;
  label?: string;
  className?: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  data,
  filename,
  sheetName = "Sheet 1",
  label = "Export CSV",
  className = "",
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = () => {
    if (!data || data.length === 0) return;
    setIsExporting(true);
    
    setTimeout(() => {
      try {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        XLSX.writeFile(workbook, `${filename}.csv`, { bookType: "csv" });
      } catch (error) {
        console.error("Export failed:", error);
      } finally {
        setIsExporting(false);
      }
    }, 100);
  };

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      disabled={isExporting || !data || data.length === 0}
      leftIcon={isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      className={className}
    >
      {isExporting ? "Exporting..." : label}
    </Button>
  );
};

export default DownloadButton;
