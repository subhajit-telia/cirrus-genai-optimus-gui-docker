#!/bin/sh

CONFIG_JS_PATH="/app/public/config.js"

# Replace placeholders in config.js
if [ -f "$CONFIG_JS_PATH" ]; then
    sed -i "s|__AZURE_CLIENT_ID__|${AZURE_CLIENT_ID}|g" "$CONFIG_JS_PATH"
    sed -i "s|__AZURE_TENANT_ID__|${AZURE_TENANT_ID}|g" "$CONFIG_JS_PATH"
else
    echo "Error: $CONFIG_JS_PATH not found!"
    exit 1
fi

exec "$@"
