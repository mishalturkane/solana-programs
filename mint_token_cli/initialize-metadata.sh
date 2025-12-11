#!/bin/bash
# ---------------------------------------------
# Script to initialize token metadata
# ---------------------------------------------

# !!! ⚠️ UPDATE THIS VARIABLE ⚠️ !!!
# MINT_ADDRESS: The address of the token created by create-token.sh
MINT_ADDRESS="68p57DkNuY54tySRcwsEPqHCSg7Xc6SHSkmT284sysu9" # <-- REPLACE THIS PLACEHOLDER!

# Metadata Details
TOKEN_NAME="USD Coin"
TOKEN_SYMBOL="USDC"
METADATA_URI="https://metadata-storage.vercel.app/token-data3/metadata.json"

echo "➡️  Initializing Metadata for Token Mint $MINT_ADDRESS..."
echo "    Name: $TOKEN_NAME, Symbol: $TOKEN_SYMBOL"
echo "    URI: $METADATA_URI"

# Command: Initialize the metadata
spl-token initialize-metadata \
  "$MINT_ADDRESS" \
  "$TOKEN_NAME" \
  "$TOKEN_SYMBOL" \
  "$METADATA_URI"

echo "✅ Metadata initialization command executed."
echo "Token is now fully configured with Name, Symbol, and external URI."