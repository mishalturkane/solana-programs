// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import VaultIDL from '../target/idl/vault.json'
import type { Vault } from '../target/types/vault'

// Re-export the generated IDL and type
export { Vault, VaultIDL }

// The programId is imported from the program IDL.
export const VAULT_PROGRAM_ID = new PublicKey(VaultIDL.address)

// This is a helper function to get the Basic Anchor program.
export function getVaultProgram(provider: AnchorProvider, address?: PublicKey): Program<Vault> {
  return new Program({ ...VaultIDL, address: address ? address.toBase58() : VaultIDL.address } as Vault, provider)
}

// This is a helper function to get the program ID for the Basic program depending on the cluster.
export function getVaultProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Basic program on devnet and testnet.
      return new PublicKey('2NMA5xznazBaUeUXZK5vtLSJNNfDT1HBdSFc9CQqyp1w')
    case 'mainnet-beta':
    default:
      return BASIC_PROGRAM_ID
  }
}
