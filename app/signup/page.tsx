"use client";

import { useState } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import {
  UserPlus,
  Mail,
  Lock,
  Building2,
  User,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

const InputField = ({
  icon: Icon,
  type,
  name,
  placeholder,
  label,
  value,
  onChange,
}: {
  icon: any;
  type: string;
  name: string;
  placeholder: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="relative group">
    <label className="text-[10px] font-mono text-gray-500 uppercase mb-1 block ml-1 tracking-wider group-focus-within:text-primary transition-colors">
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
      <input
        type={type}
        name={name}
        required
        value={value}
        onChange={onChange}
        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
        placeholder={placeholder}
      />
    </div>
  </div>
);

export default function SignUpPage() {
  const { supabase } = useSupabase();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    institution: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Kata sandi tidak cocok.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            institution: formData.institution,
            role: "ISSUER",
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user && !data.session) {
        setSuccessMessage(
          "Pendaftaran berhasil! Silakan cek email Anda untuk memverifikasi akun sebelum login."
        );
      } else {
        alert("Pendaftaran berhasil! Anda akan diarahkan ke dashboard.");
        router.push("/issuer");
      }
    } catch (err: any) {
      console.error("Sign Up Error:", err);
      setError(err.message || "Terjadi kesalahan saat mendaftar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 min-h-screen flex items-center justify-center relative py-32">
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg z-10"
      >
        <GlassCard className="border-primary/20 backdrop-blur-2xl bg-black/40">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-primary/10 border border-white/10 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Daftar <span className="text-gradient">Penerbit</span>
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Buat akun institusi untuk mulai menerbitkan sertifikat digital.
            </p>
          </div>

          {successMessage ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-green-500/10 border border-green-500/30 p-6 rounded-xl text-center"
            >
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Cek Email Anda
              </h3>
              <p className="text-sm text-gray-300 mb-6">{successMessage}</p>
              <NeonButton
                onClick={() => router.push("/login")}
                className="w-full"
              >
                Ke Halaman Login
              </NeonButton>
            </motion.div>
          ) : (
            <form className="space-y-5" onSubmit={handleSignUp}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  icon={User}
                  type="text"
                  name="fullName"
                  label="Nama Lengkap"
                  placeholder="Nama Admin"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                <InputField
                  icon={Building2}
                  type="text"
                  name="institution"
                  label="Nama Institusi"
                  placeholder="Universitas..."
                  value={formData.institution}
                  onChange={handleChange}
                />
              </div>

              <InputField
                icon={Mail}
                type="email"
                name="email"
                label="Email Institusi"
                placeholder="admin@kampus.ac.id"
                value={formData.email}
                onChange={handleChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  icon={Lock}
                  type="password"
                  name="password"
                  label="Kata Sandi"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <InputField
                  icon={Lock}
                  type="password"
                  name="confirmPassword"
                  label="Konfirmasi Sandi"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </motion.div>
              )}

              <div className="pt-2">
                <NeonButton
                  type="submit"
                  disabled={loading}
                  isLoading={loading}
                  className="w-full group"
                >
                  {loading ? "Mendaftarkan..." : "Buat Akun"}
                  {!loading && (
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </NeonButton>
              </div>
            </form>
          )}

          {!successMessage && (
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-sm text-gray-500">
                Sudah memiliki akun?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary-glow font-medium transition-colors"
                >
                  Login di sini
                </Link>
              </p>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
