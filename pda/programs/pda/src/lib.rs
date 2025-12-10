#![allow(unexpected_cfgs)] 
#![allow(deprecated)]
use core::str;

use anchor_lang::prelude::*;

declare_id!("C9HpjXetHWxG1Uhz2MwadAQ38tSE49jNa5xTuTJbbgjH");

#[program]
pub mod pda {
    use super::*;

    pub fn initialize(ctx: Context<InitializeAccount>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        
        // Calculate the PDA
        let (pda, bump) = Pubkey::find_program_address(
            &[b"pda", ctx.accounts.signer.key().as_ref()],
            ctx.program_id
        );
        
        msg!("Calculated PDA is: {:?}", pda);
        msg!("PDA bump is: {:?}", bump);
        msg!("PDA from pda_account is: {:?}", ctx.accounts.pda_account.key());
        
        // Verify they match
        assert_eq!(pda, ctx.accounts.pda_account.key());
        
        // CRITICAL FIX: Store the bump seed in the account
        ctx.accounts.pda_account.data = 0; // Set initial data if needed
        ctx.accounts.pda_account.bump = bump; // Store the bump
        
        Ok(())
    }
    
    pub fn close(_ctx: Context<ClosePDAAccount>) -> Result<()> {
        msg!("Closing PDA account");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeAccount<'info>{
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + 8 + 1,
        seeds = [b"pda", signer.key().as_ref()],
        bump
    )]
    pub pda_account: Account<'info, PdaAccount>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct PdaAccount {
    pub data: u64,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct ClosePDAAccount<'info>{
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        close = signer,
        seeds = [b"pda", signer.key().as_ref()],
        bump  = pda_account.bump
    )]
    pub pda_account: Account<'info, PdaAccount>,
    pub system_program: Program<'info, System>,
}
