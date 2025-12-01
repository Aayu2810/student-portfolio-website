import { HeroSection } from "../components/home/HeroSectionDark";
import Features from "../components/home/Features";
import Footer from "../components/home/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <main className="min-h-screen bg-white dark:bg-black">
        <HeroSection />
        <Features />
        <Footer />
      </main>
    </div>
  );
}