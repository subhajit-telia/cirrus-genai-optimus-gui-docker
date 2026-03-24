#!/bin/bash

# Replace placeholders in config.js with environment variables


CONFIG_FILE='path/to/config.js'

if [ -f "$CONFIG_FILE" ]; then
    sed -i "s|REACT_APP_API_URL|$REACT_APP_API_URL|g" "$CONFIG_FILE"
    sed -i "s|REACT_APP_ENV|$REACT_APP_ENV|g" "$CONFIG_FILE"
    sed -i "s|AZURE_CLIENT_ID|$AZURE_CLIENT_ID|g" "$CONFIG_FILE"
    sed -i "s|AZURE_TENANT_ID|$AZURE_TENANT_ID|g" "$CONFIG_FILE"
else
    echo 'Config file not found!'
fi
