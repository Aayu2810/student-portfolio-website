import { Navbar } from '@/components/navbar/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e]">
      <Navbar />
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}