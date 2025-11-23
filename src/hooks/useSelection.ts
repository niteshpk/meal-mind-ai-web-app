import { useState } from "react";

/**
 * Generic hook for managing selection arrays
 * @param initial - Initial array of selected items
 * @returns Object with selected items and selection management functions
 */
export function useSelection<T>(initial: T[] = []) {
  const [selected, setSelected] = useState<T[]>(initial);

  const toggle = (item: T) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const reset = () => {
    setSelected([]);
  };

  return { selected, toggle, reset, setSelected };
}

