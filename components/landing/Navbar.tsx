"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#07070E]/90 backdrop-blur-xl border-b border-[#1E1E35] shadow-[0_1px_0_rgba(255,255,255,0.03)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7C6FE0] to-[#4F8EF7] shadow-[0_0_16px_rgba(124,111,224,0.4)] transition-all group-hover:shadow-[0_0_24px_rgba(124,111,224,0.6)]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 4h10M3 7h7M3 10h5"
                stroke="#F2F2FF"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="13" cy="10" r="2" fill="#2ECAD9" />
            </svg>
          </div>
          <span className="font-display font-semibold text-[#F2F2FF] text-sm tracking-tight">
            Readme Auto Doctor
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm text-[#9B9BB8] hover:text-[#F2F2FF] transition-colors duration-200 rounded-lg hover:bg-white/[0.04]"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/app"
            className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C6FE0] to-[#4F8EF7] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(124,111,224,0.3)] transition-all duration-200 hover:shadow-[0_0_28px_rgba(124,111,224,0.5)] hover:scale-[1.02] active:scale-[0.98]"
          >
            Try it out
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="opacity-80"
            >
              <path
                d="M3 7h8M7 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-[#1E1E35] bg-[#0E0E1A] text-[#9B9BB8] hover:text-[#F2F2FF] transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 4h12M2 8h12M2 12h12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#1E1E35] bg-[#07070E]/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 text-sm text-[#9B9BB8] hover:text-[#F2F2FF] rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 pt-2 border-t border-[#1E1E35]">
            <Link
              href="/app"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C6FE0] to-[#4F8EF7] px-5 py-3 text-sm font-semibold text-white"
            >
              Try it out
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
