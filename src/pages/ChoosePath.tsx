import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, FileText, Handshake } from 'lucide-react';
import NeuralCanvas from '@/components/NeuralCanvas';

const paths = [
  {
    key: 'talents',
    icon: Brain,
    title: 'Talents',
    subtitle: 'I build things',
    description: 'Elite global AI & tech builders. Selective by merit. Borderless by design.',
    route: '/pre-join',
  },
  {
    key: 'ventures',
    icon: FileText,
    title: 'Projects',
    subtitle: 'I need builders',
    description: 'Anyone with a vision. Post a brief. Find your builders.',
    route: '/pre-ventures',
  },
  {
    key: 'partners',
    icon: Handshake,
    title: 'Partners',
    subtitle: 'I have a tool',
    description: 'Tools that builders actually use. Find your real ambassadors.',
    route: '/pre-partners',
  },
];

const ChoosePath = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center overflow-hidden px-4">
      <NeuralCanvas />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center mb-10 md:mb-14"
      >
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
          Choose your path
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
          How do you want to contribute to the network?
        </p>
      </motion.div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 w-full max-w-4xl">
        {paths.map((path, i) => (
          <motion.button
            key={path.key}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(path.route)}
            className="card-surface rounded-2xl p-8 text-left transition-all duration-300 hover:glow-violet group cursor-pointer"
          >
            <div className="w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary/25 transition-colors">
              <path.icon className="w-6 h-6 text-secondary" />
            </div>

            <h2 className="font-heading text-xl font-bold text-foreground mb-1">
              {path.title}
            </h2>
            <p className="text-secondary text-sm font-medium mb-3">
              {path.subtitle}
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {path.description}
            </p>

            <div className="mt-5 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Get started →
            </div>
          </motion.button>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 text-muted-foreground text-xs mt-10"
      >
        Welcome to the force.
      </motion.p>
    </div>
  );
};

export default ChoosePath;
