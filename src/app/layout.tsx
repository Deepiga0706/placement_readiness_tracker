import "./globals.css";
import Header from '@/components/Header';
import ToastProvider from '@/components/ui/ToastProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <Header />
          <main>
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
