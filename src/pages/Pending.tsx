import NeuralCanvas from '@/components/NeuralCanvas';

export default function Pending() {
  return (
    <div className="min-h-screen bg-black relative">
      <NeuralCanvas />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="w-16 h-16 rounded-full border border-[#5B3FA6] flex items-center justify-center mb-8">
          <div className="w-3 h-3 rounded-full bg-[#5B3FA6] animate-pulse" />
        </div>
        <h1 className="font-heading text-[28px] md:text-[36px] font-bold text-white mb-4">
          Your application is under review.
        </h1>
        <p className="text-[#666666] text-[15px] max-w-md">
          We'll be in touch soon.
        </p>
      </div>
    </div>
  );
}
