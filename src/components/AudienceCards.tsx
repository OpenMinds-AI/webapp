import { motion } from "framer-motion";
import { Zap, Compass, Flame } from "lucide-react";

const cards = [
  {
    icon: Zap,
    label: "The spark.",
    title: "Talents",
    description:
      "You build. You're good. The world just hasn't seen it yet. OpenMinds AI changes that.",
  },
  {
    icon: Compass,
    label: "The signal.",
    title: "Projects",
    description:
      "You have something to build but need the right person to build it with. We find them.",
  },
  {
    icon: Flame,
    label: "The fuel.",
    title: "Partners",
    description:
      "You have a tool that builders need. We put it in the right hands and amplify you back.",
  },
];

const AudienceCards = () => {
  return (
    <section id="get-started" className="relative z-10 py-24 md:py-32">
      <div className="container mx-auto max-w-[900px] px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-heading text-3xl md:text-4xl font-bold text-center text-foreground mb-16"
        >
          Built for three kinds of people.
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-4">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="rounded-2xl transition-all duration-200"
              style={{
                background: "#0D0D0D",
                border: "1px solid #1A1A1A",
                padding: "32px 24px",
              }}
            >
              <card.icon
                className="w-8 h-8 mb-4"
                style={{ color: "#5B3FA6" }}
                strokeWidth={1.5}
              />
              <p
                className="italic text-xs mb-2"
                style={{ color: "#7C6FE0" }}
              >
                {card.label}
              </p>
              <h3 className="font-heading text-[22px] font-bold text-foreground mb-3">
                {card.title}
              </h3>
              <p
                className="text-sm leading-snug"
                style={{ color: "#666666" }}
              >
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudienceCards;
