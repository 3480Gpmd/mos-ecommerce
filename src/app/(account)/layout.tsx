import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">{children}</main>
      <Footer />
    </div>
  );
}
