// Google Analytics Utility Functions

// Initialize dataLayer array
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void; // Add gtag function to Window interface
  }
}

// GA Tracking ID from environment variable
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Initialize GA
export const initGA = () => {
  if (!GA_TRACKING_ID) return;

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag("js", new Date());
  gtag("config", GA_TRACKING_ID);

  // Assign gtag to window object
  window.gtag = gtag;
};

// Track page views
export const pageview = (url: string) => {
  if (!GA_TRACKING_ID) return;
  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};

// Track events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label: string;
  value?: number;
}) => {
  if (!GA_TRACKING_ID) return;
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
