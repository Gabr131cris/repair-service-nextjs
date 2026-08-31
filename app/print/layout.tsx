import type { ReactNode } from "react";

export default function PrintLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <style>{`
          @page { size: A4 portrait; margin: 8mm; }

          /* Elimină header & footer generate de browser */
          @page {
            @top-left { content: none !important; }
            @top-center { content: none !important; }
            @top-right { content: none !important; }

            @bottom-left { content: none !important; }
            @bottom-center { content: none !important; }
            @bottom-right { content: none !important; }
          }

          /* Chrome special fix */
          body::before,
          body::after {
            display: none !important;
          }

          html, body { width: 100%; margin: 0; padding: 0; background: white; }
          * { box-sizing: border-box; }
          .print-wrapper { width: 100%; }
          .copy-section { width: 100%; break-after: page; page-break-after: always; }
          .copy-section:last-child { break-after: auto; page-break-after: auto; }
          .page-break { break-after: page; page-break-after: always; height: 0; }
          .print-document { width: 100%; max-width: 100%; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .avoid-break, header, footer { break-inside: avoid; page-break-inside: avoid; }
          table { break-inside: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          tr { break-inside: avoid; page-break-inside: avoid; }
          h1, h2, h3 { break-after: avoid; page-break-after: avoid; }
          p { orphans: 3; widows: 3; }

          @media screen {
            body { background: #e5e7eb; padding: 20px; }
            .copy-section { max-width: 210mm; margin: 0 auto 24px; background: white; box-shadow: 0 8px 30px rgba(15, 23, 42, .12); }
          }

          @media print {
            body { background: white !important; }
            .copy-section { box-shadow: none !important; }
          }
        `}</style>
      </head>

      <body style={{ background: "white", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
