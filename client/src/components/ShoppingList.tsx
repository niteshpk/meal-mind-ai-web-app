import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShoppingListItem,
  groupShoppingListByCategory,
  exportShoppingListToText,
} from "@/utils/shopping";
import { Download, Printer, FileText } from "lucide-react";
import { PDFService } from "@/services/pdf-service";
import { toast } from "sonner";

interface ShoppingListProps {
  items: ShoppingListItem[];
  recipeName: string;
}

export function ShoppingList({ items, recipeName }: ShoppingListProps) {
  const [listItems, setListItems] = useState(items);
  const [exportingPDF, setExportingPDF] = useState(false);

  const toggleItem = (id: string) => {
    setListItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const grouped = groupShoppingListByCategory(listItems);
  const categories = Object.keys(grouped).sort();

  const handleExport = () => {
    const text = exportShoppingListToText(listItems);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${recipeName
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()}-shopping-list.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      await PDFService.exportShoppingListPDF(
        listItems,
        `${recipeName} - Shopping List`
      );
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to export PDF"
      );
    } finally {
      setExportingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const checkedCount = listItems.filter((i) => i.checked).length;

  return (
    <Card className="p-6 print:shadow-none">
      <div className="flex items-center justify-between mb-6 print:flex-col print:items-start print:gap-4">
        <h2 className="text-2xl font-semibold">Shopping List</h2>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export TXT
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={exportingPDF}
          >
            <FileText className="h-4 w-4 mr-2" />
            {exportingPDF ? "Generating..." : "Export PDF"}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-3">{category}</h3>
            <ul className="space-y-2">
              {grouped[category].map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-muted print:hover:bg-transparent"
                >
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="print:hidden"
                  />
                  <span
                    className={`flex-1 ${
                      item.checked ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    <span className="font-medium">{item.amount}</span>{" "}
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t print:hidden">
        <p className="text-sm text-muted-foreground">
          {checkedCount} of {listItems.length} items checked
        </p>
      </div>
    </Card>
  );
}
