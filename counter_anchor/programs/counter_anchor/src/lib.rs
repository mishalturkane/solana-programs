#![allow(unexpected_cfgs)]
#![allow(deprecated)]
use anchor_lang::prelude::*;

declare_id!("8rzStD6zE6i8q8vSs5n6ok3H2pkHAu92fBdFbYmRYYic");

#[program]
pub mod counter_anchor {
    use super::*;

    pub fn initialize(ctx: Context<InitializeCounter>) -> Result<()> {
        ctx.accounts.counter.count = 0;
        msg!("Greetings from: {:?}", ctx.program_id);
        msg!("counter value is:{}", ctx.accounts.counter.count);
        Ok(())
    }

    pub fn increment(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.counter.count += 1;
        msg!("counter value is:{}", ctx.accounts.counter.count);
        Ok(())
    }

    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.counter.count -= 1;
        msg!("counter value is:{}", ctx.accounts.counter.count);
        Ok(())
    }
    pub fn set_zero(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.counter.count = 0;
        msg!("counter value is:{}", ctx.accounts.counter.count);
        Ok(())
    }
    
    pub fn close_counter(ctx: Context<CloseCounter>) -> Result<()> {
        msg!("Closing counter account and returning rent to: {}", ctx.accounts.user.key());
        msg!("Final counter value was: {}", ctx.accounts.counter.count);
        Ok(())
    }
    
    pub fn check_counter(ctx: Context<CheckCounter>) -> Result<()> {
        let counter_value = ctx.accounts.counter.count;
        msg!("User {}'s counter value: {}", ctx.accounts.user.key(), counter_value);
        
        if counter_value > 100 {
            msg!("⚠️  Warning: Counter value is very high!");
        }
        
        Ok(())
    }
}

// Existing structs...

#[derive(Accounts)]
pub struct CheckCounter<'info> {
    pub user: Signer<'info>,
    #[account(
        seeds = [b"counter", user.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,
}

// ... rest of your existing code

#[derive(Accounts)]
pub struct InitializeCounter<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        init,
        payer = user,
        space = 8 + 8,
        seeds = [b"counter", user.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"counter", user.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,
}

#[derive(Accounts)]
pub struct CloseCounter<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"counter", user.key().as_ref()],
        bump,
        close = user  // This automatically closes the account and sends lamports to user
    )]
    pub counter: Account<'info, Counter>,
}

#[account]
pub struct Counter {
    pub count: u64,
}