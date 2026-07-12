import { useState } from "react";
import { Link } from "@tanstack/react-router";

const NAV_LINKS = [
  { to: "/templates", label: "Templates" },
  { to: "/pricing", label: "Pricing" },
  { to: "/plugin/download", label: "Plugin" },
  { to: "/changelog", label: "Changelog" },
  { to: "/about", label: "About" },
];

export function Layout({ children, hideNav, hideFooter }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen font-sans selection:bg-[#D97736]/30">
      {!hideNav && (
        <>
          <header className="fixed top-0 left-0 right-0 z-50">
            <div className="mx-auto max-w-7xl px-4 md:px-6 pt-4">
              <div className="flex items-center justify-between rounded-[16px] border border-white/[0.08] bg-[#0c0c12]/72 backdrop-blur-xl px-4 md:px-5 py-3">
                <Link className="flex items-center gap-2.5 shrink-0 group" to="/">
                  <img src="/subai-logo.png" alt="SubAI" className="h-20 w-auto object-contain" />
                </Link>

                <nav className="hidden md:flex items-center gap-0.5">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="px-3.5 py-2 text-[13px] text-[#9CA3AF] hover:text-white rounded-[16px] hover:bg-white/[0.05] transition-all"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="flex items-center gap-2">
                  <Link
                    to="/dashboard"
                    className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-black bg-[#D97736] hover:bg-[#FF9A4D] rounded-[16px] transition-all"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 rounded-[16px] text-[#9CA3AF] hover:text-white hover:bg-white/[0.06] transition-all"
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      {mobileOpen ? (
                        <>
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </>
                      ) : (
                        <>
                          <path d="M4 5h16" />
                          <path d="M4 12h16" />
                          <path d="M4 19h16" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div
            className={`fixed inset-0 z-40 transition-all duration-300 ${
              mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <div
              className={`bg-[#0c0c12] border-b border-white/[0.08] pt-20 pb-6 px-6 transition-transform duration-300 ${
                mobileOpen ? "translate-y-0" : "-translate-y-full"
              }`}
            >
              <nav className="flex flex-col gap-1 max-w-7xl mx-auto">
                <Link
                  to="/dashboard"
                  className="px-3.5 py-2.5 text-[13px] font-bold text-black bg-[#D97736] hover:bg-[#FF9A4D] rounded-[16px] text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="px-3.5 py-2.5 text-[14px] text-[#9CA3AF] hover:text-white rounded-[16px] hover:bg-white/[0.05] transition-all"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </>
      )}

      {children}

      {!hideFooter && (
        <footer className="border-t border-white/[0.08] bg-[#0A0A0A] pt-16 pb-8">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-4 group">
                <img src="/subai-logo.png" alt="SubAI" className="h-20 w-auto object-contain" />
              </Link>
              <p className="text-[#9CA3AF] text-sm max-w-xs leading-relaxed">
                The free, browser-native AI caption studio built for Indian creators.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm tracking-wide">Product</h4>
              <ul className="space-y-3 text-sm text-[#9CA3AF]">
                <li>
                  <Link
                    to="/pricing"
                    className="hover:text-[#D97736] transition-colors duration-200"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/changelog"
                    className="hover:text-[#D97736] transition-colors duration-200"
                  >
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/templates"
                    className="hover:text-[#D97736] transition-colors duration-200"
                  >
                    Templates
                  </Link>
                </li>
                <li>
                  <Link
                    to="/plugin/download"
                    className="hover:text-[#D97736] transition-colors duration-200"
                  >
                    Plugin
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm tracking-wide">Company</h4>
              <ul className="space-y-3 text-sm text-[#9CA3AF]">
                <li>
                  <Link to="/about" className="hover:text-[#D97736] transition-colors duration-200">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[#D97736] transition-colors duration-200">
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="hover:text-[#D97736] transition-colors duration-200"
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm tracking-wide">Legal</h4>
              <ul className="space-y-3 text-sm text-[#9CA3AF]">
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-[#D97736] transition-colors duration-200"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-[#D97736] transition-colors duration-200">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-6 pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#9CA3AF]/60 text-xs">© 2026 Preet Patil. All rights reserved.</p>
            <div className="flex items-center gap-4 text-[#9CA3AF]/60 text-xs">
              <span>Powered by Groq & Whisper</span>
              <span className="w-1 h-1 rounded-full bg-[#9CA3AF]/40" />
              <span>v1.0.0</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
