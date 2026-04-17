import './globals.css';
import { Inter, Roboto_Mono, Geist } from 'next/font/google';
import { ThemeProvider } from '../components/ui/ThemeProvider';
import { UIProvider } from '../context/UIContext';
import { StockProvider } from '../context/StockContext';
import { AuthProvider } from '../context/AuthContext';
import { AnimationProvider } from '../animations/shared/AnimationContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Toasts from '../components/ui/Toasts';
import ModalContainer from '../components/ui/ModalContainer';
import ClientScrollProgressIndicator from '../components/layout/ClientScrollProgressIndicator';
import KeepAlive from '../components/KeepAlive';
import AppQueryProvider from '../components/providers/AppQueryProvider';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-roboto-mono', display: 'swap' });

export const metadata = {
  title: 'Indian Stock Sense',
  description: 'Analyze Indian stocks with real-time data and powerful tools',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${inter.className} ${robotoMono.variable} min-h-screen flex flex-col antialiased relative`} suppressHydrationWarning>

        
        <ThemeProvider 
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AppQueryProvider>
            <UIProvider>
              <AuthProvider>
                <StockProvider>
                  <AnimationProvider>
                    <ErrorBoundary>
                      <div className="flex flex-col min-h-screen relative z-20">
                        <ClientScrollProgressIndicator />
                        <Header />
                        <main className="flex-grow">
                          {children}
                        </main>
                        <Footer />

                        {/* Global UI components */}
                        <Toasts />
                        <ModalContainer />
                        <KeepAlive />
                      </div>
                    </ErrorBoundary>
                  </AnimationProvider>
                </StockProvider>
              </AuthProvider>
            </UIProvider>
          </AppQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 