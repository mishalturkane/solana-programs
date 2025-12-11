#!/bin/bash
# --------------------------------------------------------
# Master Script: Create, Mint, and Initialize Token Metadata (Fully Automated)
# --------------------------------------------------------

# 1. Load the environment variables from the .env file
echo "---"
echo "➡️  Step 0: Loading configuration from .env file..."
if [ -f .env ]; then
    source .env
else
    echo "❌ Error: .env file not found! Please create it."
    exit 1
fi

# Basic validation
if [ -z "$PROGRAM_ID" ] || [ -z "$RECIPIENT_ADDRESS" ] || [ -z "$TOKEN_NAME" ]; then
    echo "❌ Error: Required variables (PROGRAM_ID, RECIPIENT_ADDRESS, TOKEN_NAME) are missing in .env"
    exit 1
fi

# --------------------------------------------------------
# STEP 1: Create Token and Capture the Mint Address
# --------------------------------------------------------
echo "---"
echo "➡️  STEP 1: Creating Token and enabling metadata..."

# Run the command and capture output (stderr included for full logs)
OUTPUT=$(spl-token --program-id "$PROGRAM_ID" create-token --enable-metadata 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo "❌ Token creation failed! Check your Solana CLI setup."
    echo "$OUTPUT"
    exit 1
fi

# **FIXED CAPTURE LOGIC:** Extract the Token Mint Address using grep and awk
# We look for the line starting with "Creating token" and extract the 3rd word (which is the address).
TOKEN_MINT_ADDRESS=$(echo "$OUTPUT" | grep "Creating token" | awk '{print $3}')

if [ -z "$TOKEN_MINT_ADDRESS" ] || [[ "$TOKEN_MINT_ADDRESS" == "token" ]]; then
    echo "❌ Failed to extract Token Mint Address! Check spl-token output format."
    echo "Output was: $OUTPUT"
    exit 1
fi

echo "✅ Token Created Successfully!"
echo "✨ New Token Mint Address: $TOKEN_MINT_ADDRESS"

# --------------------------------------------------------
# STEP 2: Create Account and Mint Tokens
# --------------------------------------------------------
echo "---"
echo "➡️  STEP 2: Creating Token Account and Minting Tokens..."

# Command 1: Create the associated token account for the recipient
echo "   - Creating Account for $RECIPIENT_ADDRESS using Mint $TOKEN_MINT_ADDRESS..."
spl-token --program-id "$PROGRAM_ID" create-account "$TOKEN_MINT_ADDRESS"

# Command 2: Mint the specified amount to the new account
echo "   - Minting $MINT_AMOUNT tokens to the recipient account..."
spl-token --program-id "$PROGRAM_ID" mint "$TOKEN_MINT_ADDRESS" "$MINT_AMOUNT"

echo "✅ Account Created and Tokens Minted Successfully!"

# --------------------------------------------------------
# STEP 3: Initialize Metadata
# --------------------------------------------------------
echo "---"
echo "➡️  STEP 3: Initializing Metadata..."
echo "   - Name: $TOKEN_NAME, Symbol: $TOKEN_SYMBOL"
echo "   - URI: $METADATA_URI"

# Command: Initialize the metadata using the captured token address
spl-token initialize-metadata \
  "$TOKEN_MINT_ADDRESS" \
  "$TOKEN_NAME" \
  "$TOKEN_SYMBOL" \
  "$METADATA_URI"

echo "✅ Metadata Initialization Complete!"
echo "---"
echo "🎉 SUCCESS! Your token is fully deployed and configured."