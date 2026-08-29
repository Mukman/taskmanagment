import "./globals.css";
import ServiceWorkerUpdater from "./sw-updater";

export const metadata = {
  title: "Taskline",
  description: "Track assigned and self-initiated tasks, with manager visibility and reporting.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#14213D",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerUpdater />
        {children}
      </body>
    </html>
  );
}
