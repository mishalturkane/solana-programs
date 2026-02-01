use anchor_lang::prelude::*;

declare_id!("8rjwNCXwLGXqu1YiN15JsyjwCZmLkmhUPK9bSGBYVmzK");

#[program]
pub mod anchor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("gm from from: {:?}, program", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
