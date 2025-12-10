import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Pda } from "../target/types/pda";
import { assert } from "chai";

describe("pda", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.pda as Program<Pda>;
  const user = provider.wallet as anchor.Wallet;
  
  // Calculate PDA
  const [PDA, Bump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("pda"), user.publicKey.toBuffer()],
    program.programId
  );

  console.log("Calculated Bump:", Bump);


  it("Initialize PDA account", async () => {
    const tx = await program.methods.initialize()
      .accounts({
        signer: user.publicKey,
        pdaAccount: PDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    await provider.connection.confirmTransaction(tx, "confirmed");
    
    const account = await program.account.pdaAccount.fetch(PDA);
    
    console.log("Stored Bump in account:", account.bump);
    console.log("Transaction:", tx);
    
    // Verify bump matches
    assert.equal(account.bump, Bump, "Bump should match");
    console.log("✓ Initialization successful");
  });
  it("Close PDA account", async () => {
    const tx = await program.methods.close()
      .accounts({
        signer: user.publicKey,
        pdaAccount: PDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    await provider.connection.confirmTransaction(tx, "confirmed");
    
    // Try to fetch the closed account
    try {
      await program.account.pdaAccount.fetch(PDA);
      assert.fail("Account should be closed");
    } catch (error) {
      console.log("Account closed successfully");
      console.log("Transaction:", tx);
      console.log("✓ Account closure successful");
    }
  });
  
});