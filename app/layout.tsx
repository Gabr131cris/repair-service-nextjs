import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";

export const dynamic = "force-static";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
