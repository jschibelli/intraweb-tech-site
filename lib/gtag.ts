declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void;
  }
}

export const GA_TRACKING_ID = 'G-GTDQWE3CH6'; // Updated with ID from component

export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, { page_path: url });
};

type GTagEvent = {
  action: string;
  category: string;
  label: string;
  value: number;
}

export const event = ({ action, category, label, value }: GTagEvent) => {
  window.gtag('event', action, { event_category: category, event_label: label, value });
}; 