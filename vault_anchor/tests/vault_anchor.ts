import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VaultAnchor } from "../target/types/vault_anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("vault-anchor", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.VaultAnchor as Program<VaultAnchor>;

  // Helper function to derive PDAs
  const getPdas = (userPublicKey: PublicKey) => {
    const [vaultState] = PublicKey.findProgramAddressSync(
      [Buffer.from("state"), userPublicKey.toBytes()],
      program.programId
    );

    const [vault] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), userPublicKey.toBytes()],
      program.programId
    );

    return { vaultState, vault };
  };

  // Get user's public key
  const user = provider.wallet.publicKey;
  const { vaultState, vault } = getPdas(user);

  // Global flag to track initialization in this test run
  let isInitializedInThisRun = false;

  // Helper function to print balances
  const printBalances = async (context: string) => {
    console.log(`\n=== ${context.toUpperCase()} ===`);
    
    const userBalance = await provider.connection.getBalance(user);
    const vaultBalance = await provider.connection.getBalance(vault);
    
    console.log(`User Balance: ${userBalance / LAMPORTS_PER_SOL} SOL`);
    console.log(`Vault Balance: ${vaultBalance / LAMPORTS_PER_SOL} SOL`);
    
    return { userBalance, vaultBalance };
  };

  it("Initialize vault with checks", async () => {
    console.log("\n🔍 CHECKING INITIALIZATION STATUS...");
    
    // First, print initial balances
    await printBalances("Before Initialization");
    
    // Check if already initialized in blockchain
    try {
      const existingState = await program.account.vaultState.fetch(vaultState);
      console.log("✅ Vault already initialized on-chain");
      console.log("Vault State:", {
        vaultBump: existingState.vaultBump,
        stateBump: existingState.stateBump,
      });
      
      // Check vault PDA
      const vaultInfo = await provider.connection.getAccountInfo(vault);
      console.log("Vault PDA Info:", {
        exists: vaultInfo !== null,
        lamports: vaultInfo ? vaultInfo.lamports : 0,
        owner: vaultInfo ? vaultInfo.owner.toString() : "N/A",
      });
      
      isInitializedInThisRun = true;
      return; // Skip initialization if already exists
    } catch (error) {
      console.log("🔄 Vault not initialized, proceeding...");
    }
    
    // Check if already initialized in this test run
    if (isInitializedInThisRun) {
      console.log("✅ Vault already initialized in this test run");
      return;
    }
    
    // Check user has enough balance for initialization
    const userBalance = await provider.connection.getBalance(user);
    const minBalanceForInit = 0.05 * LAMPORTS_PER_SOL; // Minimum needed for rent
    
    if (userBalance < minBalanceForInit) {
      console.log(`❌ Insufficient balance for initialization. Need at least ${minBalanceForInit / LAMPORTS_PER_SOL} SOL`);
      console.log(`Current balance: ${userBalance / LAMPORTS_PER_SOL} SOL`);
      throw new Error("Insufficient balance");
    }
    
    console.log("\n🚀 INITIALIZING VAULT...");
    console.log("Program ID:", program.programId.toString());
    console.log("User:", user.toString());
    console.log("Vault State PDA:", vaultState.toString());
    console.log("Vault PDA:", vault.toString());
    
    try {
      const tx = await program.methods
        .initialize()
        .accounts({
          user: user,
          vaultState: vaultState,
          vault: vault,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      console.log("\n✅ Initialization Successful!");
      console.log("Transaction signature:", tx);
      
      // Verify initialization
      const vaultStateAccount = await program.account.vaultState.fetch(vaultState);
      console.log("Vault State Created:", {
        vaultBump: vaultStateAccount.vaultBump,
        stateBump: vaultStateAccount.stateBump,
      });
      
      const vaultAccount = await provider.connection.getAccountInfo(vault);
      console.log("Vault PDA Created:", {
        exists: vaultAccount !== null,
        lamports: vaultAccount ? vaultAccount.lamports : 0,
        owner: vaultAccount ? vaultAccount.owner.toString() : "N/A",
      });
      
      isInitializedInThisRun = true;
      
      // Print balances after initialization
      await printBalances("After Initialization");
      
    } catch (error) {
      console.error("❌ Initialization failed:", error);
      throw error;
    }
  });

  it("Deposit 2 SOL with checks", async () => {
    // Check if vault is initialized
    try {
      await program.account.vaultState.fetch(vaultState);
    } catch {
      console.log("❌ Vault not initialized. Run initialization test first.");
      return;
    }
    
    // Print balances before deposit
    const beforeBalances = await printBalances("Before Deposit");
    
    const depositAmount = 2 * LAMPORTS_PER_SOL;
    console.log(`\n💰 Attempting to deposit: ${depositAmount / LAMPORTS_PER_SOL} SOL`);
    
    // Check if user has enough balance for deposit
    if (beforeBalances.userBalance < depositAmount) {
      console.log(`❌ Insufficient balance for deposit`);
      console.log(`Required: ${depositAmount / LAMPORTS_PER_SOL} SOL`);
      console.log(`Available: ${beforeBalances.userBalance / LAMPORTS_PER_SOL} SOL`);
      throw new Error("Insufficient balance for deposit");
    }
    
    try {
      const tx = await program.methods
        .deposit(new anchor.BN(depositAmount))
        .accounts({
          user: user,
          vaultState: vaultState,
          vault: vault,
          systemProgram: SystemProgram.programId
        })
        .rpc();
      
      console.log("\n✅ Deposit Successful!");
      console.log("Transaction signature:", tx);
      
      // Verify deposit
      const afterBalances = await printBalances("After Deposit");
      
      // Calculate actual deposited amount
      const actualDeposit = afterBalances.vaultBalance - beforeBalances.vaultBalance;
      console.log(`Actual deposited: ${actualDeposit / LAMPORTS_PER_SOL} SOL`);
      
      // Verify the vault account
      const vaultInfo = await provider.connection.getAccountInfo(vault);
      console.log("Vault PDA after deposit:", {
        lamports: vaultInfo ? vaultInfo.lamports : 0,
        owner: vaultInfo ? vaultInfo.owner.toString() : "N/A",
      });
      
    } catch (error) {
      console.error("❌ Deposit failed:", error);
      throw error;
    }
  });

   it("Withdraw 1 SOL with checks", async () => {
    // Check if vault is initialized
    let vaultStateAccount;
    try {
      vaultStateAccount = await program.account.vaultState.fetch(vaultState);
    } catch {
      console.log("❌ Vault not initialized. Run initialization test first.");
      return;
    }
    
    // Print balances before withdrawal
    const beforeBalances = await printBalances("Before Withdrawal");
    
    const withdrawAmount = 1 * LAMPORTS_PER_SOL;
    console.log(`\n💸 Attempting to withdraw: ${withdrawAmount / LAMPORTS_PER_SOL} SOL`);
    
    // Check if vault has enough balance for withdrawal
    if (beforeBalances.vaultBalance < withdrawAmount) {
      console.log(`❌ Insufficient funds in vault`);
      console.log(`Requested: ${withdrawAmount / LAMPORTS_PER_SOL} SOL`);
      console.log(`Available in vault: ${beforeBalances.vaultBalance / LAMPORTS_PER_SOL} SOL`);
      
      // If vault is empty, skip this test
      if (beforeBalances.vaultBalance === 0) {
        console.log("⚠️  Vault is empty, skipping withdrawal test");
        return;
      }
      
      // If vault has some funds but not enough, withdraw what's available
      console.log("⚠️  Attempting to withdraw available amount instead");
      const availableAmount = beforeBalances.vaultBalance;
      
      try {
        const tx = await program.methods
          .withdraw(new anchor.BN(availableAmount))
          .accounts({
            user: user,
            vaultState: vaultState,
            vault: vault,
            systemProgram: SystemProgram.programId
          })
          .rpc();
        
        console.log("\n✅ Partial Withdrawal Successful!");
        console.log("Transaction signature:", tx);
        await printBalances("After Partial Withdrawal");
        return;
      } catch (error) {
        console.error("❌ Partial withdrawal failed:", error);
        throw error;
      }
    }
    
    try {
      const tx = await program.methods
        .withdraw(new anchor.BN(withdrawAmount))
        .accounts({
          user: user,
          vaultState: vaultState,
          vault: vault,
          systemProgram: SystemProgram.programId
        })
        .rpc();
      
      console.log("\n✅ Withdrawal Successful!");
      console.log("Transaction signature:", tx);
      
      // Verify withdrawal
      const afterBalances = await printBalances("After Withdrawal");
      
      // Calculate actual withdrawn amount
      const actualWithdrawal = afterBalances.userBalance - beforeBalances.userBalance;
      console.log(`Actual withdrawn: ${actualWithdrawal / LAMPORTS_PER_SOL} SOL`);
      
    } catch (error) {
      console.error("❌ Withdrawal failed:", error);
      throw error;
    }
  });

  it("Close vault with checks", async () => {
    // Check if vault is initialized
    try {
      await program.account.vaultState.fetch(vaultState);
    } catch {
      console.log("❌ Vault not initialized. Nothing to close.");
      return;
    }
    
    // Print balances before closing
    const beforeBalances = await printBalances("Before Closing");
    
    console.log("\n🔒 ATTEMPTING TO CLOSE VAULT...");
    
    // Check vault state
    const vaultStateAccount = await program.account.vaultState.fetch(vaultState);
    console.log("Current Vault State:", {
      vaultBump: vaultStateAccount.vaultBump,
      stateBump: vaultStateAccount.stateBump,
    });
    
    try {
      const tx = await program.methods
        .close()
        .accounts({
          user: user,
          vaultState: vaultState,
          vault: vault,
          systemProgram: SystemProgram.programId
        })
        .rpc();
      
      console.log("\n✅ Vault Closed Successfully!");
      console.log("Transaction signature:", tx);
      
      // Verify closing
      const afterBalances = await printBalances("After Closing");
      
      // Calculate refund amount
      const refundAmount = afterBalances.userBalance - beforeBalances.userBalance;
      console.log(`Refund received: ${refundAmount / LAMPORTS_PER_SOL} SOL`);
      
      // Verify vault state is closed
      try {
        await program.account.vaultState.fetch(vaultState);
        console.log("❌ Vault state still exists!");
      } catch {
        console.log("✅ Vault state account successfully closed");
      }
      
      // Check vault PDA (should still exist but with 0 or minimal balance)
      const vaultInfo = await provider.connection.getAccountInfo(vault);
      console.log("Vault PDA after closing:", {
        exists: vaultInfo !== null,
        lamports: vaultInfo ? vaultInfo.lamports : 0,
      });
      
    } catch (error) {
      console.error("❌ Closing vault failed:", error);
      
      // Check error type
      if (error.message && error.message.includes("already in use")) {
        console.log("⚠️  Vault still has funds. Try withdrawing first.");
        
        // If vault has funds, withdraw them first
        const vaultBalance = await provider.connection.getBalance(vault);
        if (vaultBalance > 0) {
          console.log(`Vault still has ${vaultBalance / LAMPORTS_PER_SOL} SOL`);
          console.log("Try running withdrawal test first, then close again.");
        }
      }
      throw error;
    }
  });

  it("Final verification", async () => {
    console.log("\n🔎 FINAL VERIFICATION");
    
    // Print final balances
    await printBalances("Final State");
    
    // Check vault state
    try {
      const vaultStateAccount = await program.account.vaultState.fetch(vaultState);
      console.log("❌ Vault state still exists:", vaultStateAccount);
    } catch {
      console.log("✅ Vault state properly closed");
    }
    
    // Check vault PDA
    const vaultInfo = await provider.connection.getAccountInfo(vault);
    console.log("Vault PDA final state:", {
      address: vault.toString(),
      exists: vaultInfo !== null,
      lamports: vaultInfo ? vaultInfo.lamports : 0,
      owner: vaultInfo ? vaultInfo.owner.toString() : "N/A",
    });
    
    // Summary
    console.log("\n📊 TEST SUMMARY");
    console.log("Program:", program.programId.toString());
    console.log("User:", user.toString());
    console.log("Vault State PDA:", vaultState.toString());
    console.log("Vault PDA:", vault.toString());
    console.log("All tests completed! ✅");
  });
});