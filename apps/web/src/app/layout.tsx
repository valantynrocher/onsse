import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Onsse',
  description: 'Bouclier temporel pour salariés et indépendants',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          body { margin: 0; padding: 0; background: #f9fafb; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}

