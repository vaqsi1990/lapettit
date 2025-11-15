"use client";

import { usePathname } from "next/navigation";
import ChatWidget from "@/components/ChatSurvey";

export default function ChatWrapper() {
  const pathname = usePathname();

  // Don't show chat widget on product detail pages
  // Product detail pages have their own ChatWidget instance
  if (pathname?.startsWith("/product/")) {
    return null;
  }

  return <ChatWidget />;
}
