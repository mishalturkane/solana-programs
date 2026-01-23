use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("12Ebe4ZCksWSzDAS1BrgQ3GMtaBvXTGtAPqP87UpvPZu");

#[program]
pub mod transfer_sol {
    use super::*;

    pub fn transfer_sol(ctx: Context<TransferSolWithCpi>, amount: u64) -> Result<()> {
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.payer.to_account_info(),
                    to: ctx.accounts.recipient.to_account_info(),
                },
            ),
            amount,
        )?;

        Ok(())
    }
    
}

#[derive(Accounts)]
pub struct TransferSolWithCpi<'info> {
    #[account(mut)]
    payer: Signer<'info>,
    #[account(mut)]
    recipient: SystemAccount<'info>,
    system_program: Program<'info, System>,
}