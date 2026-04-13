import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import { supabase } from "@/integrations/supabase/client";

const Hero = () => {
  const [builders, setBuilders] = useState<number | null>(null);
  const [openRequests, setOpenRequests] = useState<number | null>(null);
  const [trustedTools, setTrustedTools] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.rpc("get_homepage_stats");
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const stats = data as Record<string, number>;
        setBuilders(stats.builders ?? 0);
        setOpenRequests(stats.open_requests ?? 0);
        setTrustedTools(stats.trusted_tools ?? 0);
      }
    };
    fetchStats();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4">
      <div className="relative z-10 text-center max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full card-surface mb-6" style={{ padding: '10px 20px' }}
        >
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-[14px] text-muted-foreground font-medium">
            Now forming — Early access open
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="font-heading font-bold leading-[1.0] tracking-[0.01em] text-[40px] md:text-[72px]">
            <span className="text-foreground">Where the best AI & Tech builders</span>
            <br />
            <span className="italic" style={{ color: '#5B3FA6' }}>come together.</span>
          </h1>
        </motion.div>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-[800px] mx-auto"
        >
          A global non-profit collective workforce. For talent who build.
          <br />
          For companies and people who need them. For tools that power both.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button
            onClick={() => window.dispatchEvent(new Event("open-path-modal"))}
            className="px-8 py-3.5 bg-primary text-primary-foreground font-heading font-semibold rounded-lg hover:glow-violet transition-all duration-300 hover:brightness-110 text-base"
          >
            Request Access
          </button>
        </motion.div>

        {/* Live counters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center justify-center gap-6 mt-10 flex-wrap"
        >
          <AnimatedCounter target={builders} label="People" />
          <span className="text-muted-foreground/30">·</span>
          <AnimatedCounter target={openRequests} label="Projects" />
          <span className="text-muted-foreground/30">·</span>
          <AnimatedCounter target={trustedTools} label="Partners" />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
