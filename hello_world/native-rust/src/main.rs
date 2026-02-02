use solana_sdk::{
    signature::{Keypair, EncodableKey, Signer},
};
use std::env;

fn main() {
    // Parse command line arguments
    let args: Vec<String> = env::args().collect();
    
    // Check if user wants to generate from existing keypair
    if args.len() > 1 && args[1] == "from-keypair" {
        if args.len() < 3 {
            println!("Usage: cargo run -- from-keypair <keypair-file.json>");
            return;
        }
        
        let keypair_file = &args[2];
        match Keypair::read_from_file(keypair_file) {
            Ok(keypair) => {
                println!("Program ID from existing keypair: {}", keypair.pubkey());
                println!("Keypair file: {}", keypair_file);
            }
            Err(e) => println!("Error reading keypair: {}", e),
        }
        return;
    }
    
    // Default: generate new keypair
    let keypair = Keypair::new();
    let filename = "program-keypair.json";
    
    // Save to file
    match keypair.write_to_file(filename) {
        Ok(_) => {
            println!("✅ Successfully generated keypair!");
            println!("📄 Keypair saved to: {}", filename);
            println!("🔑 Program ID: {}", keypair.pubkey());
            println!("\n💡 To use this in your program, add to lib.rs:");
            println!("   solana_program::declare_id!(\"{}\");", keypair.pubkey());
        }
        Err(e) => println!("❌ Error saving keypair: {}", e),
    }
}