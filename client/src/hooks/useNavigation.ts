import { useState } from "react";
import { Screen } from "@/types";

/**
 * Hook for managing screen navigation with history tracking
 * @param initialScreen - Initial screen to start on
 * @returns Navigation functions and current screen
 */
export function useNavigation(initialScreen: Screen = "landing") {
  const [currentScreen, setCurrentScreen] = useState<Screen>(initialScreen);
  const [history, setHistory] = useState<Screen[]>([initialScreen]);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
    setHistory((prev) => [...prev, screen]);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // Remove current screen
      const previousScreen = newHistory[newHistory.length - 1];
      setCurrentScreen(previousScreen);
      setHistory(newHistory);
    }
  };

  const goNext = () => {
    const screenOrder: Screen[] = [
      "landing",
      "cuisine",
      "ingredients",
      "loading",
      "recipe",
    ];
    const currentIndex = screenOrder.indexOf(currentScreen);
    if (currentIndex < screenOrder.length - 1) {
      const nextScreen = screenOrder[currentIndex + 1];
      navigateTo(nextScreen);
    }
  };

  return {
    currentScreen,
    navigateTo,
    goBack,
    goNext,
    setCurrentScreen,
  };
}

