"use client";

import { useEffect, useState } from "react";

export default function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const htmlElement = document.documentElement;

    const mutationCallback = (mutationsList: MutationRecord[]) => {
      mutationsList.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "theme"
        ) {
          const theNewTheme = htmlElement.getAttribute("theme");
          if (theNewTheme == "dark") {
            setIsDarkMode(true);
          } else {
            setIsDarkMode(false);
          }
        }
      });
    };

    const observer = new MutationObserver(mutationCallback);

    // Configure and start the observer
    const config = { attributes: true, attributeFilter: ["theme"] };
    observer.observe(htmlElement, config);

    // Cleanup function to disconnect the observer when the component is unmounted
    return () => {
      observer.disconnect();
    };
  }, []); // Empty dependency array ensures the effect runs only once on mount

  return isDarkMode ? "dark" : "light";
}
