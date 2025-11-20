"use client";

import React from 'react';
import { ArrowRight, Building2, Database, Lock, Search, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-20">
      <div className="text-center max-w-3xl px-4">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
          Secure Credentials with <span className="text-primary-600">Blockchain</span>
        </h1>
        <p className="text-xl mb-12 leading-relaxed">
          Eliminate fake diplomas. Issue tamper-proof digital certificates anchored to the decentralized ledger.
          Instant verification for employers, zero fraud for institutions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link
            href={"/issuer"}
            className="group relative flex flex-col items-center p-8 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-primary-300 transition-all text-left"
          >
            <div className="h-12 w-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
              <Building2 className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">I am an Institution</h3>
            <p className=" mt-2 text-center">Issue and manage digital certificates for your graduates.</p>
            <div className="mt-4 flex items-center text-primary-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              Go to Dashboard <ArrowRight className="ml-1 w-4 h-4" />
            </div>
          </Link>

          <Link
            href={"/verify"}
            className="group relative flex flex-col items-center p-8 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-primary-300 transition-all text-left"
          >
            <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">I am a Verifier</h3>
            <p className=" mt-2 text-center">Check the authenticity of a candidate's documents.</p>
            <div className="mt-4 flex items-center text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              Start Verification <ArrowRight className="ml-1 w-4 h-4" />
            </div>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="p-3 bg-foreground text-background rounded-full mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-gray-900">Immutable</h4>
            <p className="text-sm ">Records cannot be altered once on-chain.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 bg-foreground text-background rounded-full mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-gray-900">Permanent</h4>
            <p className="text-sm ">Credentials last forever, independent of servers.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 bg-foreground text-background rounded-full mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-gray-900">Fraud-Proof</h4>
            <p className="text-sm ">Cryptographic hashing ensures 100% integrity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;