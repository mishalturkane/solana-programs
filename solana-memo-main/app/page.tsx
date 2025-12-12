"use client";

import { WalletConnectButton } from "@/components/wallet-connect-button";
import { MemoCard } from "@/components/memo-card";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-lg border shadow-lg p-6 space-y-6">
        <div className="flex justify-center">
          <WalletConnectButton />
        </div>
        <MemoCard />
      </div>
    </div>
  );
}