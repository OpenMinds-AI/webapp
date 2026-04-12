import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrePartners() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-[480px] text-center"
      >
        <Flame className="w-8 h-8 mx-auto mb-6" style={{ color: '#7C6FE0' }} />
        <h1 className="font-heading text-[28px] font-bold text-white mb-4">
          You're about to join as a partner.
        </h1>
        <p className="text-[16px] leading-[1.7] mb-10" style={{ color: '#666666' }}>
          This is a two-way relationship. You support the community. We amplify you.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/partners")}
            className="w-full h-12 rounded-[10px] font-medium text-white text-sm transition-all duration-200 hover:brightness-110"
            style={{ background: '#5B3FA6' }}
          >
            Continue
          </button>
          <button
            onClick={() => navigate("/#get-started")}
            className="w-full h-12 rounded-[10px] font-medium text-sm transition-all duration-200"
            style={{ color: '#666666', border: '1px solid #1A1A1A', background: 'transparent' }}
          >
            ← Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
