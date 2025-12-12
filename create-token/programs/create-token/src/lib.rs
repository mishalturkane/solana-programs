use anchor_lang::prelude::*;

declare_id!("5Rv8z8MTG6FqXhjKXJ9oMjJgvAnuMCRjq5X7akE2q3aa");

#[program]
pub mod create_token {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
