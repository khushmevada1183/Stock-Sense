import './globals.css';
import { Inter, Roboto_Mono } from 'next/font/google';
import { ThemeProvider } from '../components/ui/ThemeProvider';
import { UIProvider } from '../context/UIContext';
import { StockProvider } from '../context/StockContext';
import { AnimationProvider } from '../animations/shared/AnimationContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Toasts from '../components/ui/Toasts';
import ModalContainer from '../components/ui/ModalContainer';
import ClientScrollProgressIndicator from '../components/layout/ClientScrollProgressIndicator';

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${robotoMono.variable} min-h-screen flex flex-col antialiased relative`} suppressHydrationWarning>

        
        <ThemeProvider 
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
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