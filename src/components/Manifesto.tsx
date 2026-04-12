import { motion } from "framer-motion";

const Manifesto = () => {
  return (
    <section id="about" className="relative z-10 py-20 md:py-24">
      <div className="absolute inset-0 pointer-events-none z-[1]" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0) 100%)' }} />
      <div className="container mx-auto relative z-[2]" style={{ maxWidth: '900px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', color: '#ffffff', fontWeight: 700, margin: '0 0 24px 0' }}>
            Why we exist
          </h2>

          <p style={{ color: '#5B3FA6', fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 700, lineHeight: 1.4, margin: '0 0 24px 0' }}>
            The best builders in the world deserve to be found.
          </p>

          <div style={{ color: '#999999', fontFamily: 'Inter, sans-serif', fontSize: '17px', lineHeight: 1.8, margin: '0 0 32px 0' }}>
            <p style={{ margin: 0 }}>We built a collective of vetted AI and tech talent — emerging voices, global perspectives, builders who ship.</p>
          </div>

          <p style={{ color: '#ffffff', fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 600, margin: '32px 0' }}>
            No platform fee. No markup. No middleman.
          </p>

          <div style={{ color: '#999999', fontFamily: 'Inter, sans-serif', fontSize: '17px', lineHeight: 2, margin: '0 0 32px 0' }}>
            <p style={{ margin: 0 }}>Every dollar goes directly to the person doing the work. Whether it's a startup automation or an enterprise build — the model never changes.</p>
          </div>

          <div style={{ color: '#666666', fontFamily: 'Inter, sans-serif', fontSize: '17px', lineHeight: 2, margin: '0 0 24px 0' }}>
            <p style={{ margin: 0 }}>We exist for the builder ready to be seen.</p>
            <p style={{ margin: 0 }}>For the company that refuses to overpay for access.</p>
            <p style={{ margin: 0 }}>For the project that deserves the right people.</p>
          </div>

          <p style={{ color: '#5B3FA6', fontFamily: 'Inter, sans-serif', fontSize: '17px', fontWeight: 700, fontStyle: 'italic', margin: 0 }}>
            Alone, a signal. Together, a force.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Manifesto;
