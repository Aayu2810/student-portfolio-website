import { HeroSection } from "../components/home/HeroSectionDark";
import Features from "../components/home/Features";
import Footer from "../components/home/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <HeroSection />
      <Features />
      <Footer />
    </main>
  );
}