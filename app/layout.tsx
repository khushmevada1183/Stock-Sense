import './globals.css';
import { Inter, Roboto_Mono, Lora, Montserrat } from 'next/font/google';
import { ThemeProvider } from '../components/ui/ThemeProvider';
import { UIProvider } from '../context/UIContext';
import { StockProvider } from '../context/StockContext';
import { AnimationProvider } from '../animations/shared/AnimationContext';
import Header from '../components/layout/Header';
import Footer from '../components/Footer/Footer';
import Toasts from '../components/ui/Toasts';
import ModalContainer from '../components/ui/ModalContainer';
import ScrollProgressIndicator from '../components/layout/ScrollProgressIndicator';

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${robotoMono.variable} ${serif.variable} ${flex.variable} min-h-screen flex flex-col antialiased`}>
        <ThemeProvider 
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UIProvider>
            <StockProvider>
              <AnimationProvider>
            <div className="flex flex-col min-h-screen">
                  <ScrollProgressIndicator />
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