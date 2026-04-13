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

      <section id="events" className="relative z-10 py-24 md:py-32 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Events
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">
            AI, tech, startup, and builder events curated for the OpenMinds network.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-violet-400 mb-2">Sample Event</p>
              <h3 className="text-xl font-semibold text-white mb-3">
                Placeholder Event Title
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                This is where event cards will appear once we connect Supabase and the agent pipeline.
              </p>
              <button className="text-sm text-white border border-white/20 rounded-lg px-4 py-2">
                View Event
              </button>
            </div>
          </div>
        </div>
      </section>

      <WaitlistCTA />
      <Footer />
    </div>
  );
};

export default Index;
