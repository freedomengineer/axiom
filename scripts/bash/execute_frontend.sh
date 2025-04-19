#!/bin/bash

DFX_PORT=$(dfx info replica-port 2>/dev/null)

if [ $? -ne 0 ] || ! [[ "$DFX_PORT" =~ ^[0-9]+$ ]] || [ "$DFX_PORT" -lt 1 ] || [ "$DFX_PORT" -gt 65535 ]; then
  echo "Error: Failed to get a valid DFX port from 'dfx info replica-port'"
  echo "Make sure dfx is running and configured correctly"
  exit 0
fi

echo "DFX port: $DFX_PORT"

FILE_PATH="$(pwd)/shared/utils/agent.ts"

echo "Current directory: $(pwd)"
echo "Looking for file: $FILE_PATH"

if [ ! -f "$FILE_PATH" ]; then
  echo "File not found: $FILE_PATH"
  exit 1
fi

sed -i.bak "s/export const dfxPort = [0-9]\{5\}/export const dfxPort = $DFX_PORT/g" "$FILE_PATH"

if grep -q "export const dfxPort = $DFX_PORT" "$FILE_PATH"; then
  echo "Successfully updated dfxPort to $DFX_PORT in $FILE_PATH"
else
  echo "Failed to update dfxPort to $DFX_PORT in $FILE_PATH"
  exit 1
fi

rm "${FILE_PATH}.bak"