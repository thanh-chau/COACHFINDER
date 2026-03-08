import { Link } from "react-router";
import { useState, useEffect } from "react";
import { Menu, X, Zap } from "lucide-react";

const NAV_ITEMS = [
  { label: "Tìm HLV", href: "#coaches" },
  { label: "Môn thể thao", href: "#sports" },
  { label: "AI Phân tích", href: "#ai-analysis" },
  { label: "Video 360°", href: "#video-360" },
  { label: "Bảng giá", href: "#pricing" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const ids = NAV_ITEMS.map((i) => i.href.slice(1));
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleNav = (href: string) => {
    setIsOpen(false);
    setActive(href.slice(1));
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: "1.25rem" }} className="text-gray-900 tracking-tight">
              Coach<span className="text-orange-500">Finder</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const isActive = active === item.href.slice(1);
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); handleNav(item.href); }}
                  className={`transition-colors duration-200 ${isActive ? "text-orange-500 font-semibold" : "text-gray-600 hover:text-orange-500"}`}
                  style={{ fontSize: "0.9rem" }}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/auth"
              className="px-4 py-2 rounded-lg text-gray-700 hover:text-orange-500 transition-colors duration-200"
              style={{ fontSize: "0.9rem" }}
            >
              Đăng nhập
            </Link>
            <Link
              to="/auth"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
              style={{ fontSize: "0.9rem", fontWeight: 600 }}
            >
              Đăng ký miễn phí
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.href.slice(1);
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => { e.preventDefault(); handleNav(item.href); }}
                className={`py-2 border-b border-gray-50 transition-colors duration-200 ${isActive ? "text-orange-500 font-semibold" : "text-gray-700 hover:text-orange-500"}`}
              >
                {item.label}
              </a>
            );
          })}
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/auth" className="py-2.5 rounded-xl border border-gray-200 text-gray-700 text-center" style={{ fontSize: "0.9rem" }}>
              Đăng nhập
            </Link>
            <Link to="/auth" className="py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-center" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
              Đăng ký miễn phí
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}