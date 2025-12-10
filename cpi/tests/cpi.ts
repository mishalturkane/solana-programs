import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Cpi } from "../target/types/cpi";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
describe("cpi", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.cpi as Program<Cpi>;
  
  const transferAmount = 0.123456 * LAMPORTS_PER_SOL;
 
  const reciever = "9qvLLXhwJf4XAfDKUAbDHkKiCCQYYqdPZtv42y1GSfm8";
 

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.solTransfer(new anchor.BN(transferAmount))
      .accounts({
        sender: provider.wallet.publicKey,
        recipient: reciever,
      })
      .signers([])
      .rpc();
    console.log(
         `\nTransaction Signature: https://explorer.solana.com/tx/${tx}?cluster=devnet`
       );
  });
});
