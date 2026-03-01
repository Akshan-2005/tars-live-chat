import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/lib/convex-provider";
import { ThemeProvider } from "@/components/ThemeProvider";
import OneSignalInit from "@/components/OneSignalInit";

export const metadata = {
  title: "Live Chat App",
  description: "Realtime chat application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-dvh overflow-hidden">
        <ClerkProvider>
          <ConvexClientProvider>
            <ThemeProvider>
              <OneSignalInit />
              <main className="h-full bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
                {children}
              </main>
            </ThemeProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}