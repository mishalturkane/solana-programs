#!/bin/bash
# ---------------------------------------------
# Script to create a new token with metadata enabled
# ---------------------------------------------

# Define the Token Extensions program ID (Tokenz)
PROGRAM_ID="TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"

echo "➡️  Creating new Token (using $PROGRAM_ID) and enabling metadata..."

# The output of this command will be the new Token Mint Address.
# You will need this address for the next two scripts.
spl-token --program-id "$PROGRAM_ID" create-token --enable-metadata

echo "✅ Token creation command executed."
echo "⚠️  NOTE: The output above contains the new **Token Mint Address**."
echo "   Please update the MINT_ADDRESS variable in the other two scripts with this value."