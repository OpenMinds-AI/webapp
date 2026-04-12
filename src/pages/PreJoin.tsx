import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PreJoin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-[480px] text-center"
      >
        <div className="relative w-12 h-12 mx-auto mb-6 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: 'rgba(91, 63, 166, 0.2)', filter: 'blur(20px)' }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <Zap className="w-12 h-12 relative z-10" style={{ color: '#7C6FE0' }} />
        </div>
        <h1 className="font-heading text-[28px] font-bold text-white mb-4">
          You're about to join as a builder.
        </h1>
        <p className="text-[16px] leading-[1.7] mb-10" style={{ color: '#666666' }}>
          Not everyone gets in. We review every application personally. If you make it — you belong here.
        </p>

        <div className="flex flex-col items-center">
          <button
            onClick={() => navigate("/join")}
            className="w-full h-12 rounded-[10px] font-medium text-white text-sm transition-all duration-200 hover:brightness-110"
            style={{ background: '#5B3FA6' }}
          >
            Continue
          </button>
          <button
            onClick={() => navigate("/#get-started")}
            className="mt-4 font-medium transition-colors duration-200 hover:brightness-125 bg-transparent border-none cursor-pointer"
            style={{ color: '#444444', fontSize: '14px' }}
          >
            ← Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
