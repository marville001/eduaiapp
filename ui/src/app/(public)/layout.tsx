import Footer from '@/components/layout/footer';
import Navigation from '@/components/layout/navigation';
import { DotPattern } from '@/components/ui/dot-pattern';
import { cn } from '@/lib/utils';
import { PropsWithChildren } from 'react';


const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-screen bg-white">
      <DotPattern
        className={cn(
          "mask-[radial-gradient(1000px_circle_at_center,white,transparent)]"
        )}
        glow={true}
      />

      <Navigation />

      {children}

      <Footer />
    </div>
  );
};

export default Layout;
