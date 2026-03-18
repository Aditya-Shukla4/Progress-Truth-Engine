import "./globals.css";

export const metadata = {
  title: "Progress Truth Engine",
  description: "Track your gym progress honestly.",
  manifest: "/manifest.json",
  themeColor: "#060608",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#060608",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#060608" }}>
        {children}
      </body>
    </html>
  );
}
