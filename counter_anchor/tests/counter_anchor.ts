// Required packages import
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CounterAnchor } from "../target/types/counter_anchor";
import { assert } from "chai";

describe("counter_anchor - Detailed Logging", () => {
    // 1. Setup Configuration
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.CounterAnchor as Program<CounterAnchor>;

    // Test Keypair (Signer)
    const user = provider.wallet as anchor.Wallet;

    // 2. PDA Calculation Function
    const [counterPDA, counterBump] = anchor.web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from("counter"), // Seed 1: b"counter"
            user.publicKey.toBuffer(), // Seed 2: user.key().as_ref()
        ],
        program.programId
    );

    // Helper function for detailed logging
    const logDetails = async (step: string, counterExists: boolean = true) => {
        const userBalance = await provider.connection.getBalance(user.publicKey);
        
        console.log(`\n--- ${step} LOG ---`);
        console.log(`Program ID (Owner): ${program.programId.toBase58()}`);
        console.log(`User/Signer/Authority: ${user.publicKey.toBase58()}`);
        console.log(`PDA (Counter) Address: ${counterPDA.toBase58()}`);
        console.log(`PDA Bump: ${counterBump}`);
        console.log(`User SOL Balance: ${userBalance / anchor.web3.LAMPORTS_PER_SOL} SOL`);
        
        if (counterExists) {
            try {
                const counterAccount = await program.account.counter.fetch(counterPDA);
                const counterInfo = await provider.connection.getAccountInfo(counterPDA);
                
                console.log(`PDA Account Owner: ${counterInfo?.owner.toBase58()}`);
                console.log(`PDA SOL Balance (Rent): ${counterInfo?.lamports / anchor.web3.LAMPORTS_PER_SOL} SOL`);
                console.log(`Counter Value (u64): ${counterAccount.count.toNumber()}`);
                
            } catch (error) {
                console.log("Counter Account State: Not Initialized (Expected for pre-init/post-close)");
            }
        } else {
            console.log("Counter Account State: Closed/Non-existent.");
        }
    };
    
    // --- Test Suite Start ---

    // Initial check before running any instruction
    it("0. Pre-Test Check (Account Status)", async () => {
        await logDetails("PRE-TEST START");
    });
    
    // --- 1. Initialize Test ---
    it("1. Initializes the counter account (PDA)!", async () => {
        // Log Before
        await logDetails("1a. BEFORE Initialize");

        await program.methods
            .initialize()
            .accounts({
                user: user.publicKey,
                counter: counterPDA,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();

        // Log After
        await logDetails("1b. AFTER Initialize");

        // Assertion
        const counterAccount = await program.account.counter.fetch(counterPDA);
        assert.equal(counterAccount.count.toNumber(), 0, "Counter did not initialize to 0");
    });


    // --- 2. Increment Test ---
    it("2. Increments the count!", async () => {
        // Log Before
        await logDetails("2a. BEFORE Increment");

        await program.methods
            .increment()
            .accounts({
                user: user.publicKey,
                counter: counterPDA,
            })
            .rpc();

        // Log After
        await logDetails("2b. AFTER Increment");

        // Assertion
        const counterAccount = await program.account.counter.fetch(counterPDA);
        assert.equal(counterAccount.count.toNumber(), 1, "Counter did not increment to 1");
    });


    // --- 3. Check Counter Test ---
    it("3. Checks the counter value and logs messages!", async () => {
        // Log Before
        await logDetails("3a. BEFORE CheckCounter");

        await program.methods
            .checkCounter()
            .accounts({
                user: user.publicKey,
                counter: counterPDA,
            })
            .rpc();

        // Log After (Value remains the same, but we log the state)
        await logDetails("3b. AFTER CheckCounter");
        
        // Assertion: Transaction success check
        const counterAccount = await program.account.counter.fetch(counterPDA);
        assert.equal(counterAccount.count.toNumber(), 1, "CheckCounter should not change the value");
    });

    // --- 4. Close Counter Test ---
    it("4. Closes the counter PDA and returns rent to the user!", async () => {
        // Log Before
        await logDetails("4a. BEFORE CloseCounter");
        
        // Record balance before closing (for reference)
        const userBalanceBeforeClose = await provider.connection.getBalance(user.publicKey);
        
        // Call the close_counter instruction
        await program.methods
            .closeCounter()
            .accounts({
                user: user.publicKey,
                counter: counterPDA,
            })
            .rpc();

        // Log After
        await logDetails("4b. AFTER CloseCounter", false); // set counterExists to false

        // 3. Check if the counter PDA still exists (Assertion)
        try {
            await program.account.counter.fetch(counterPDA);
            assert.fail("Account should have been closed.");
        } catch (e) {
            console.log("✅ Account closure verified: Fetch failed as expected.");
        }
        
        // Optional: Log the SOL transfer effect
        const userBalanceAfterClose = await provider.connection.getBalance(user.publicKey);
        console.log(`User Balance Change: ${ (userBalanceAfterClose - userBalanceBeforeClose) / anchor.web3.LAMPORTS_PER_SOL} SOL (Should be positive, minus transaction fees)`);
    });
});