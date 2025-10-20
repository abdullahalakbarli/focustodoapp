import { Button } from "@/components/ui/button";
import { Download, FileText, Table } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface ExportButtonsProps {
  userId: string;
  period: "daily" | "weekly" | "monthly";
}

export const ExportButtons = ({ userId, period }: ExportButtonsProps) => {
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

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `focus-sessions-${period}-${format(new Date(), "yyyy-MM-dd")}.csv`);
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

    // Save PDF
    doc.save(`focus-sessions-${period}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
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
