use anchor_lang::prelude::*;

declare_id!("3aLUWKNCzYrqZkwhVW24tEfv3N9Rt4SMscevYk4Wz5GM");

#[program]
pub mod mint_2022_token {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
