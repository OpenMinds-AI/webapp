

const Footer = () => {
  const navLinks = ["About", "Talents", "Projects", "Partners"];

  return (
    <footer className="relative z-10" style={{ background: "transparent", borderTop: "1px solid #1A1A1A" }}>
      {/* ROW 1 */}
      <div
        className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0"
        style={{ padding: "32px 80px" }}
      >
        <p style={{ fontFamily: "Syne, sans-serif", fontSize: "15px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
          OpenMinds AI
        </p>

        <div className="flex items-center gap-5">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="transition-colors duration-200 hover:text-white"
              style={{ color: "#666666", fontFamily: "Inter, sans-serif", fontSize: "14px" }}
            >
              {link}
            </a>
          ))}
        </div>

      </div>

      {/* ROW 2 */}
      <div style={{ borderTop: "1px solid #1A1A1A" }} />
      <div
        className="text-center"
        style={{ padding: "16px 0 24px", color: "#444444", fontFamily: "Inter, sans-serif", fontSize: "12px" }}
      >
        © 2026 OpenMinds AI
      </div>
    </footer>
  );
};

export default Footer;
