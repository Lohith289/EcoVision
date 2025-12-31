import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ClassificationProvider } from '@/contexts/classification-context';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/layout/header';
import { ClassificationHistory } from '@/components/classification-history';

export const metadata: Metadata = {
  title: 'EcoVision',
  description: 'AI-powered waste classification to promote recycling.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider storageKey="ecovision-theme">
          <ClassificationProvider>
            <SidebarProvider>
              <Sidebar side="right">
                <ClassificationHistory />
              </Sidebar>
              <SidebarInset>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  {children}
                </div>
              </SidebarInset>
            </SidebarProvider>
          </ClassificationProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
