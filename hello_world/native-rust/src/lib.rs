use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

// Declare program ID (same as in your Anchor code)
solana_program::declare_id!("8CEtUF4ayeXYoScE6YWn2dB2Wbr6H81JyUgEXL6HU4kf");

// Entrypoint
entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Deserialize instruction
    let instruction = GmInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    // Match instruction type
    match instruction {
        GmInstruction::Initialize => initialize(program_id, accounts),
    }
}

// Instruction enum
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum GmInstruction {
    Initialize,
}

// Initialize function
pub fn initialize(program_id: &Pubkey, _accounts: &[AccountInfo]) -> ProgramResult {
    msg!("gm from from: {:?}, program", program_id);
    Ok(())
}