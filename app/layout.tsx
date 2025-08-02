import './globals.css';
import { Inter, Roboto_Mono, Lora, Montserrat } from 'next/font/google';
import { ThemeProvider } from '../components/ui/ThemeProvider';
import { UIProvider } from '../context/UIContext';
import { StockProvider } from '../context/StockContext';
import { AnimationProvider } from '../animations/shared/AnimationContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Toasts from '../components/ui/Toasts';
import ModalContainer from '../components/ui/ModalContainer';
import ClientScrollProgressIndicator from '../components/layout/ClientScrollProgressIndicator';

const inter = Inter({ subsets: ['latin'] });
const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-roboto-mono' });
const serif = Lora({ subsets: ['latin'], variable: '--font-serif' });
const flex = Montserrat({ subsets: ['latin'], variable: '--font-flex' });

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
    <html lang="en" suppressHydrationWarning className="bg-grid-white/[0.02]">
      <body className={`${inter.className} ${robotoMono.variable} ${serif.variable} ${flex.variable} min-h-screen flex flex-col antialiased relative`} suppressHydrationWarning>
        {/* Background mirror for header area */}
        <div className="fixed top-0 left-0 right-0 h-40 z-10 pointer-events-none">
          <div className="absolute inset-0 header-bg-mirror"></div>
          <div className="absolute inset-0 noise-bg opacity-20 dark:opacity-30"></div>
          {/* Additional seamless transition overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-gray-950/20 dark:to-gray-950/40"></div>
        </div>
        
        <ThemeProvider 
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UIProvider>
            <StockProvider>
              <AnimationProvider>
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
            </div>
              </AnimationProvider>
            </StockProvider>
          </UIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 