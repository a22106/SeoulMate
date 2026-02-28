"use client";

import { useState } from "react";
import Header from "@/components/Header";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const [language, setLanguage] = useState("English");

  return (
    <div className="flex h-dvh flex-col bg-background">
      <Header language={language} onLanguageChange={setLanguage} />
      <ChatInterface language={language} />
    </div>
  );
}
