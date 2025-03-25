"use client";

import { createRoot } from "react-dom/client";
import TermsOfService from "@/app/terms/page";

/**
 * Utility function to extract the terms content from the Terms page component
 * @returns Promise that resolves with the HTML content of the terms
 */
export async function getTermsContent(): Promise<string> {
  return new Promise((resolve) => {
    // Create a container to render the Terms component
    const container = document.createElement("div");
    document.body.appendChild(container);

    // Render the Terms component into the container
    const root = createRoot(container);
    root.render(<TermsOfService />);

    // Extract the HTML content after rendering
    setTimeout(() => {
      const termsContent = container.querySelector(".prose")?.innerHTML || "";

      // Clean up
      root.unmount();
      document.body.removeChild(container);

      resolve(termsContent);
    }, 100);
  });
}
