import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '../components/ui/ThemeProvider';
import { UIProvider } from '../context/UIContext';
import { StockProvider } from '../context/StockContext';
import Header from '../components/layout/Header';
import Footer from '../components/Footer/Footer';
import Toasts from '../components/ui/Toasts';
import ModalContainer from '../components/ui/ModalContainer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Indian Stock Analyzer',
  description: 'Analyze Indian stocks with real-time data and powerful tools',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased`}>
        <ThemeProvider 
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UIProvider>
            <StockProvider>
            <div className="flex flex-col min-h-screen">
                <Header />
              <main className="flex-grow">
                {children}
              </main>
                <Footer />
              
                {/* Global UI components */}
                <Toasts />
                <ModalContainer />
            </div>
            </StockProvider>
          </UIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 