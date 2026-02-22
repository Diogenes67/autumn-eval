import "./globals.css";

export const metadata = {
  title: "AutumnAI Letter for GP Evaluation",
  description: "Modified PDQI-9 Rating Instrument for ASD Assessment Letters",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
