#!/bin/bash
# --------------------------------------------------------
# Master Script: Create, Mint, and Initialize NFT (Fully Automated)
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

# **NFT CHECK:** Ensure MINT_AMOUNT is set to 1 for an NFT
if [ "$MINT_AMOUNT" -ne 1 ]; then
    echo "⚠️ Warning: MINT_AMOUNT was set to $MINT_AMOUNT. Resetting to 1 for NFT creation."
    MINT_AMOUNT=1
fi

# --------------------------------------------------------
# STEP 1: Create NFT Mint (Decimals=0)
# --------------------------------------------------------
echo "---"
echo "➡️  STEP 1: Creating NFT Mint with DECIMALS=0 and enabling metadata..."

# **COMMAND EDITED HERE:** Added --decimals 0 and removed unsupported --non-transferable
OUTPUT=$(spl-token --program-id "$PROGRAM_ID" create-token --enable-metadata --decimals 0 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo "❌ NFT Mint creation failed! Check your Solana CLI setup."
    echo "$OUTPUT"
    exit 1
fi

# **CAPTURE LOGIC:** Extract the Token Mint Address using grep and awk
TOKEN_MINT_ADDRESS=$(echo "$OUTPUT" | grep "Creating token" | awk '{print $3}')

if [ -z "$TOKEN_MINT_ADDRESS" ] || [[ "$TOKEN_MINT_ADDRESS" == "token" ]]; then
    echo "❌ Failed to extract NFT Mint Address! Check spl-token output format."
    echo "Output was: $OUTPUT"
    exit 1
fi

echo "✅ NFT Mint Created Successfully!"
echo "✨ New NFT Mint Address: $TOKEN_MINT_ADDRESS"

# --------------------------------------------------------
# STEP 2: Create Account and Mint Tokens (Single NFT Unit)
# --------------------------------------------------------
echo "---"
echo "➡️  STEP 2: Creating Token Account and Minting the Single NFT..."

# Command 1: Create the associated token account for the recipient
echo "   - Creating Account for $RECIPIENT_ADDRESS using Mint $TOKEN_MINT_ADDRESS..."
spl-token --program-id "$PROGRAM_ID" create-account "$TOKEN_MINT_ADDRESS"

# Command 2: Mint the specified amount (1) to the new account
echo "   - Minting $MINT_AMOUNT NFT unit to the recipient account..."
spl-token --program-id "$PROGRAM_ID" mint "$TOKEN_MINT_ADDRESS" "$MINT_AMOUNT"

echo "✅ Account Created and NFT Minted Successfully!"

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
echo "🎉 SUCCESS! Your NFT is fully deployed and configured."