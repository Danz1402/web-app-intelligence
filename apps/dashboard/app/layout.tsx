export const metadata = { title: "WAI Discovery" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", margin: 24 }}>
        <h1><a href="/">Discovery</a></h1>
        {children}
      </body>
    </html>
  );
}