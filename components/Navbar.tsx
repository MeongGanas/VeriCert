"use client"

import React from 'react';
import { ShieldCheck, LayoutDashboard, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/SupabaseProvider';

const Navbar: React.FC = () => {
    const { user, signOut } = useSupabase();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-background border-b border-b-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <Link href={"/"} className="flex items-center cursor-pointer">
                        <div className="shrink-0 flex items-center gap-2">
                            <ShieldCheck className="h-8 w-8 text-primary-600" />
                            <span className="text-xl font-bold text-gray-900 tracking-tight">VeriCert</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-4">
                        {!user ? (
                            <>
                                <div className="hidden md:flex gap-4 text-sm font-medium text-gray-500">
                                    <span>Decentralized Verification Protocol</span>
                                </div>
                                <Link
                                    href="/verify"
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === 'verifier' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <ShieldCheck className="h-4 w-4" />
                                    Verify Document
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                {user && (
                                    <Link href={'/issuer'}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === 'dashboard' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        Issuer Dashboard
                                    </Link>
                                )}

                                <div className="h-6 w-px bg-gray-300 mx-2"></div>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium cursor-pointer"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Exit Mode
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;