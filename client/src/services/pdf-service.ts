import { config } from "@/config";
import { AuthService } from "./auth-service";
import { ShoppingListItem } from "@/types/shopping";

export class PDFService {
  /**
   * Export shopping list to PDF
   */
  static async exportShoppingListPDF(
    items: ShoppingListItem[],
    title: string = "Shopping List"
  ): Promise<void> {
    const response = await fetch(`${config.api.url}/api/pdf/shopping-list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({
        items: items.map((item) => ({
          name: item.name,
          amount: item.amount,
          category: item.category,
          checked: item.checked || false,
        })),
        title,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to generate PDF");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export recipe to PDF
   */
  static async exportRecipePDF(recipeId: string): Promise<void> {
    const response = await fetch(`${config.api.url}/api/pdf/recipe/${recipeId}`, {
      headers: {
        ...AuthService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to generate PDF");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = "recipe.pdf";
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export meal plan shopping list to PDF
   */
  static async exportMealPlanShoppingListPDF(weekStartDate: Date): Promise<void> {
    const response = await fetch(
      `${config.api.url}/api/pdf/meal-plan/${weekStartDate.toISOString()}/shopping-list`,
      {
        headers: {
          ...AuthService.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to generate PDF");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = "meal-plan-shopping-list.pdf";
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

