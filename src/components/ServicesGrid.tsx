import { motion } from "framer-motion";
import {
  ShieldCheck,
  Target,
  Globe,
  Users,
  Zap,
  BookOpen,
  Star,
  UserPlus,
  Flame,
} from "lucide-react";

const services = [
  {
    icon: ShieldCheck,
    label: "Vetted Profiles",
    desc: "Every builder reviewed by humans. No exceptions.",
  },
  {
    icon: Target,
    label: "Talent Matching",
    desc: "Post a need. We find who can solve it. AI-powered. Human-approved.",
  },
  {
    icon: Globe,
    label: "Work From Anywhere",
    desc: "No borders. No offices. No ceiling.",
  },
  {
    icon: Users,
    label: "Mentor & Mentee",
    desc: "The right person ahead of you changes everything. Find them here.",
  },
  {
    icon: Zap,
    label: "Events & Hackathons",
    desc: "Hackathons, showcases, gatherings. For builders to ship. For companies to discover. For partners to show up.",
  },
  {
    icon: BookOpen,
    label: "Workshops & Masterclasses",
    desc: "Bring the network's expertise inside your company.",
  },
  {
    icon: Star,
    label: "Community Reviews",
    desc: "Trust earned through the people you've actually built with.",
  },
  {
    icon: UserPlus,
    label: "Grow the Network",
    desc: "Refer great builders. The collective gets stronger. Everyone benefits.",
  },
  {
    icon: Flame,
    label: "Partner Spotlight",
    desc: "Your tool, in front of builders who will actually use it. Early adopters. Real feedback. Authentic reach.",
  },
];

const ServicesGrid = () => {
  return (
    <section className="relative z-10 py-24 md:py-32">
      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-heading font-bold text-center mb-16 text-foreground"
        >
          What happens inside.
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => (
            <motion.div
              key={service.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: (index % 3) * 0.07 }}
              whileHover={{ y: -2 }}
              className="rounded-2xl p-6 transition-all duration-300"
              style={{
                background: "#0D0D0D",
                border: "1px solid #1A1A1A",
              }}
            >
              <service.icon
                className="w-5 h-5 mb-3"
                style={{ color: "#5B3FA6" }}
                strokeWidth={1.5}
              />
              <h3 className="text-sm font-heading font-semibold mb-1 text-foreground">
                {service.label}
              </h3>
              <p className="text-xs text-muted-foreground">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
