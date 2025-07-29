"use client";

import WebsiteIsLoading from "@/components/loaders/WebsiteIsLoading";
import { useEffect, useState } from "react";
import HomePageContent from "./components/HomePageContent";

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-[100vh] flex justify-center items-center">
        <WebsiteIsLoading />
      </div>
    );
  }

  return <HomePageContent />;
}
