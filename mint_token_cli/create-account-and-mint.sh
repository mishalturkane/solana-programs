#!/bin/bash
# ---------------------------------------------
# Script to create a token account and mint tokens
# ---------------------------------------------

# !!! ⚠️ UPDATE THESE VARIABLES ⚠️ !!!
# MINT_ADDRESS: The address of the token created by create-token.sh
MINT_ADDRESS="68p57DkNuY54tySRcwsEPqHCSg7Xc6SHSkmT284sysu9" # <-- REPLACE THIS PLACEHOLDER!

# ACCOUNT_ADDRESS: The address of the recipient/holder for the tokens
ACCOUNT_ADDRESS="BadeiEzhEwtztzJp9NBi8XKGEM8wpzt74qLqL7p4QVmL" # <-- This seems to be the recipient in your command
# Note: Usually this is a different wallet's public key, but I've kept your original command's structure.

# MINT_AMOUNT: The number of tokens to mint
MINT_AMOUNT=56

# Define the Token Extensions program ID (Tokenz)
PROGRAM_ID="TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"

echo "➡️  Creating Token Account for $ACCOUNT_ADDRESS using Mint $MINT_ADDRESS..."
# Command 1: Create the associated token account
spl-token --program-id "$PROGRAM_ID" create-account "$MINT_ADDRESS"

echo "✅ Token Account creation command executed."
echo ""

echo "➡️  Minting $MINT_AMOUNT tokens to the new account..."
# Command 2: Mint the specified amount to the new account
spl-token --program-id "$PROGRAM_ID" mint "$MINT_ADDRESS" "$MINT_AMOUNT"

echo "✅ Minting command executed. Initial supply complete."