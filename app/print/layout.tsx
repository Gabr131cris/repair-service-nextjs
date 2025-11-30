export default function PrintLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          @page {
            margin: 0;
            size: auto;
          }

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
        `}</style>
      </head>

      <body style={{ background: "white", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
