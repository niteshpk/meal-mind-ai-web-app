export interface ShoppingListItem {
  id: string;
  name: string;
  amount: string;
  category: string;
  checked: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingListItem[];
  createdAt: Date;
}

