"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Search,
  LogIn,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import { motion, AnimatePresence } from "framer-motion";
import NeonButton from "./ui/NeonButton";

const Navbar: React.FC = () => {
  const { user, signOut } = useSupabase();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = user
    ? [
        {
          name: "Dasbor",
          href: "/issuer",
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
      ]
    : [
        {
          name: "Verifikasi",
          href: "/verify",
          icon: <Search className="w-4 h-4" />,
        },
      ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 bg-black/50 supports-backdrop-filter:bg-black/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href={"/"} className="flex items-center gap-3 group">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors border border-primary/30">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-wider text-white group-hover:text-primary transition-colors">
              Veri<span className="text-primary">Cert</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 px-4 py-2 rounded-full ${
                  pathname === item.href
                    ? "bg-white/10 text-primary border border-white/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                <div className="text-xs text-gray-400 text-right hidden lg:block">
                  <p className="font-mono text-[10px] uppercase tracking-wider">
                    Connected
                  </p>
                  <p className="text-white truncate max-w-[120px]">
                    {user.email}
                  </p>
                </div>
                <NeonButton
                  variant="danger"
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-sm"
                >
                  <LogOut className="w-4 h-4" />
                </NeonButton>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-2">
                <Link href="/login">
                  <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/5 border border-transparent hover:border-white/10">
                    <LogIn className="w-4 h-4" />
                    Masuk
                  </button>
                </Link>

                <Link href="/signup">
                  <NeonButton
                    variant="primary"
                    className="px-6 py-2.5 rounded-full text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    Daftar
                  </NeonButton>
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl"
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
              <div className="h-px bg-white/10 my-2" />
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </button>
              ) : (
                <div className="space-y-3 pt-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-300 border border-white/10 rounded-xl hover:bg-white/5 mb-3">
                      <LogIn className="w-4 h-4" />
                      Masuk Akun
                    </div>
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <NeonButton className="w-full justify-center rounded-xl">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Daftar Penerbit
                    </NeonButton>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
