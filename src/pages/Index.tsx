import NeuralNetwork3D from "@/components/NeuralNetwork3D";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import AudienceCards from "@/components/AudienceCards";
import ServicesGrid from "@/components/ServicesGrid";
import WaitlistCTA from "@/components/WaitlistCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <NeuralNetwork3D />
      <Navbar />
      <Hero />
      <Manifesto />
      <AudienceCards />
      <ServicesGrid />
      <WaitlistCTA />
      <Footer />
    </div>
  );
};

export default Index;
