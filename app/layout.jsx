import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata = {
  title: "WordTwist",
  description: "A 5-letter word guessing game with a detective's tally twist.",
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning is required for next-themes to prevent mismatch on first render
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        {/* ThemeProvider enables light/dark mode based on system preference */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
