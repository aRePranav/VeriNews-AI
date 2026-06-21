import { ToastProvider } from "@/components/ui/Toast";
import { Hero } from "@/components/Hero";
import { LiveDemo } from "@/components/LiveDemo";
import { HowItWorks } from "@/components/HowItWorks";
import { ModelPerformance } from "@/components/ModelPerformance";
import { Impact } from "@/components/Impact";
import { LiveStats } from "@/components/LiveStats";
import { TechStack } from "@/components/TechStack";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <ToastProvider>
      <main>
        <Hero />
        <LiveDemo />
        <HowItWorks />
        <ModelPerformance />
        <Impact />
        <LiveStats />
        <TechStack />
      </main>
      <Footer />
    </ToastProvider>
  );
}
