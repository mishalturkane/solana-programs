import { SolanaProvider } from "@/components/solana-provider";
import "./globals.css";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // Opt: include full weight range
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply className from the font */}
      <body className={spaceGrotesk.className}>
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  );
}
