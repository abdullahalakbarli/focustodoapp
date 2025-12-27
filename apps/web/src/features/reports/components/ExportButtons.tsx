import { Button } from "@/shared/components/ui/button";
import { FileText, Table } from "lucide-react";
import { supabase } from "@/shared/services/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem, GetUriResult } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

interface ExportButtonsProps {
  userId: string;
  period: "daily" | "weekly" | "monthly";
}

export const ExportButtons = ({ userId, period }: ExportButtonsProps) => {
  const isNative = Capacitor.isNativePlatform();

  const describePath = (uriOrPath: string | null) => {
    if (!uriOrPath) return "device storage";
    if (uriOrPath.startsWith("file://")) {
      return uriOrPath.replace("file://", "");
    }
    return uriOrPath;
  };

  const writeNativeFile = async (fileName: string, data: string, encoding?: Encoding) => {
    const platform = Capacitor.getPlatform();
    const directory = Directory.Documents;
    const folder = "FocusMind";
    try {
      // Ensure directory exists
      await Filesystem.mkdir({
        directory,
        path: folder,
        recursive: true,
      });
    } catch (err: any) {
      if (err?.message?.includes("already exists") === false) {
        console.warn("Unable to create directory", err);
      }
    }

    const filePath = `${folder}/${fileName}`;
    await Filesystem.writeFile({
      directory,
      path: filePath,
      data,
      encoding,
    });

    const stat = (await Filesystem.stat({
      directory,
      path: filePath,
    })) as GetUriResult & { uri?: string };

    if (stat?.uri) {
      await Share.share({
        url: stat.uri,
        title: fileName,
        text: "Share or save your report",
      });
    }

    return filePath;
  };

  const fetchSessionData = async () => {
    const now = new Date();
    let startDate = new Date();

    if (period === "daily") {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "weekly") {
      startDate.setDate(now.getDate() - 7);
    } else if (period === "monthly") {
      startDate.setMonth(now.getMonth() - 1);
    }

    const { data, error } = await supabase
      .from("focus_sessions")
      .select(`
        *,
        tasks (
          color
        )
      `)
      .eq("user_id", userId)
      .gte("completed_at", startDate.toISOString())
      .order("completed_at", { ascending: true });

    if (error) {
      toast.error("Failed to fetch session data");
      return null;
    }

    return data;
  };

  const downloadCSV = async () => {
    const sessions = await fetchSessionData();
    if (!sessions || sessions.length === 0) {
      toast.error("No data available for export");
      return;
    }

    // CSV Headers
    const headers = ["Session #", "Category", "Minutes Worked", "Date & Time", "Color"];
    const csvContent = [
      headers.join(","),
      ...sessions.map((session, index) => {
        const taskColor = session.tasks?.[0]?.color || "#3b82f6";
        return [
          index + 1,
          session.category,
          session.duration_minutes,
          format(new Date(session.completed_at), "yyyy-MM-dd HH:mm:ss"),
          taskColor,
        ].join(",");
      }),
    ].join("\n");

    const fileName = `focus-sessions-${period}-${format(new Date(), "yyyy-MM-dd")}.csv`;

    if (isNative) {
      try {
        const path = await writeNativeFile(fileName, csvContent, Encoding.UTF8);
        toast.success(`CSV ready to share: ${describePath(path)}`);
      } catch (error) {
        console.error("CSV save failed", error);
        toast.error("Failed to save CSV file. Please try again.");
      }
      return;
    }

    // Web download fallback
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV downloaded successfully");
  };

  const downloadPDF = async () => {
    const sessions = await fetchSessionData();
    if (!sessions || sessions.length === 0) {
      toast.error("No data available for export");
      return;
    }

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text("FocusMind - Session Report", 14, 22);

    // Add period info
    doc.setFontSize(11);
    doc.text(`Period: ${period.charAt(0).toUpperCase() + period.slice(1)}`, 14, 30);
    doc.text(`Generated: ${format(new Date(), "yyyy-MM-dd HH:mm")}`, 14, 36);

    // Calculate totals
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    doc.text(`Total Time: ${totalHours}h ${remainingMinutes}m`, 14, 42);
    doc.text(`Total Sessions: ${sessions.length}`, 14, 48);

    // Prepare table data
    const tableData = sessions.map((session, index) => {
      const taskColor = session.tasks?.[0]?.color || "#3b82f6";
      return [
        index + 1,
        session.category,
        session.duration_minutes + " min",
        format(new Date(session.completed_at), "yyyy-MM-dd HH:mm"),
        taskColor,
      ];
    });

    // Add table
    autoTable(doc, {
      head: [["Session #", "Category", "Duration", "Date & Time", "Color"]],
      body: tableData,
      startY: 55,
      theme: "grid",
      headStyles: {
        fillColor: [99, 102, 241], // Primary color
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
      },
    });

    const fileName = `focus-sessions-${period}-${format(new Date(), "yyyy-MM-dd")}.pdf`;

    if (isNative) {
      try {
        const dataUri = doc.output("datauristring");
        const base64 = dataUri.split(",")[1];
        const path = await writeNativeFile(fileName, base64);
        toast.success(`PDF ready to share: ${describePath(path)}`);
      } catch (error) {
        console.error("PDF save failed", error);
        toast.error("Failed to save PDF file. Please try again.");
      }
      return;
    }

    // Web download
    doc.save(fileName);
    toast.success("PDF downloaded successfully");
  };

  return (
    <div className="flex gap-2 justify-end">
      <Button variant="outline" size="sm" onClick={downloadCSV} className="gap-2">
        <Table className="h-4 w-4" />
        Export CSV
      </Button>
      <Button variant="outline" size="sm" onClick={downloadPDF} className="gap-2">
        <FileText className="h-4 w-4" />
        Export PDF
      </Button>
    </div>
  );
};
