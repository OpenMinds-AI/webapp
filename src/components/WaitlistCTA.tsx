import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Rocket, Flame } from "lucide-react";

const WaitlistCTA = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-path-modal", handler);
    return () => window.removeEventListener("open-path-modal", handler);
  }, []);

  const cards = [
    { icon: Zap, label: "The spark.", title: "Builder", description: "I build things.", path: "/pre-join" },
    { icon: Rocket, label: "The signal.", title: "Project", description: "I need a builder.", path: "/pre-ventures" },
    { icon: Flame, label: "The fuel.", title: "Partner", description: "I have a tool.", path: "/pre-partners" },
  ];

  return (
    <section className="relative z-10 py-24 md:py-32">
      <div className="relative container mx-auto">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />
        </div>
        <div className="relative text-center max-w-xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-3xl md:text-4xl font-heading font-bold mb-4">
            You're early. Join in.
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="text-muted-foreground mb-10">
            OpenMinds AI is forming now. Request your access before the doors open.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="flex justify-center">
            <button
              onClick={() => setOpen(true)}
              style={{ background: "#5B3FA6", color: "#ffffff", fontFamily: "Syne, sans-serif", fontSize: "16px", fontWeight: 600, padding: "16px 40px", borderRadius: "10px", border: "none", cursor: "pointer" }}
            >
              Join the collective
            </button>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "24px" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: "#000000", border: "1px solid #1A1A1A", borderRadius: "24px", padding: "56px 48px", maxWidth: "580px", width: "100%" }}
            >
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "32px", fontWeight: 700, color: "#ffffff", textAlign: "center", margin: "0 0 4px" }}>
                Who are you?
              </h3>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#444444", textAlign: "center", fontStyle: "italic", margin: "0 0 48px" }}>
                Choose your path.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {cards.map((card) => (
                  <button
                    key={card.path}
                    onClick={() => { setOpen(false); navigate(card.path); }}
                    className="transition-all duration-200"
                    style={{ background: "#0D0D0D", border: "1px solid #1A1A1A", borderRadius: "16px", padding: "28px 16px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0", width: "100%" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#5B3FA6"; e.currentTarget.style.boxShadow = "0 0 20px rgba(91,63,166,0.15)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1A1A1A"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <card.icon size={24} color="#5B3FA6" style={{ marginBottom: "14px" }} />
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#7C6FE0", fontStyle: "italic", margin: "0 0 8px" }}>
                      {card.label}
                    </p>
                    <p style={{ fontFamily: "Syne, sans-serif", fontSize: "17px", color: "#ffffff", fontWeight: 600, margin: "0 0 8px" }}>
                      {card.title}
                    </p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#555555", margin: 0, lineHeight: 1.4 }}>
                      {card.description}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default WaitlistCTA;
