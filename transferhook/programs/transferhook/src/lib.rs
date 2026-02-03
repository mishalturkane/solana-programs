use anchor_lang::prelude::*;

declare_id!("F3XzuUGJ9NGSn68Xkqq2oM3JWqhHmDCqYHayX4G2LQ8C");

#[program]
pub mod transferhook {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
