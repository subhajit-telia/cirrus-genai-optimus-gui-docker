#!/bin/sh
set -e

echo "=== GenAI Optimus GUI - Runtime Configuration ==="

# Paths
CONFIG_TEMPLATE="/etc/nginx/templates/config.js.template"
CONFIG_JS_PATH="/usr/share/nginx/html/config.js"
NGINX_TEMPLATE="/etc/nginx/nginx.conf.template"
NGINX_CONFIG="/etc/nginx/nginx.conf"

# ============================================
# Step 1: Generate config.js from template
# ============================================
if [ -f "$CONFIG_TEMPLATE" ]; then
    echo "[1/3] Generating config.js from template..."
    
    # Use envsubst to replace variables in template
    envsubst '${REACT_APP_API_URL} ${REACT_APP_ENV} ${AZURE_CLIENT_ID} ${AZURE_TENANT_ID}' < "$CONFIG_TEMPLATE" > "$CONFIG_JS_PATH"
    
    echo "✓ config.js generated"
    echo "  REACT_APP_API_URL: ${REACT_APP_API_URL:-/api}"
    echo "  REACT_APP_ENV: ${REACT_APP_ENV:-production}"
    echo "  AZURE_CLIENT_ID: ${AZURE_CLIENT_ID:-(empty)}"
    echo "  AZURE_TENANT_ID: ${AZURE_TENANT_ID:-(empty)}"
    
    # Display generated config for debugging
    echo ""
    echo "Generated config.js:"
    cat "$CONFIG_JS_PATH"
else
    echo "✗ ERROR: $CONFIG_TEMPLATE not found!"
    exit 1
fi

# ============================================
# Step 2: Configure nginx.conf from template
# ============================================
if [ -f "$NGINX_TEMPLATE" ]; then
    echo "[2/3] Configuring NGINX..."
    
    envsubst '${API_ENDPOINT} ${API_KEY} ${AZURE_CLIENT_ID} ${AZURE_TENANT_ID}' < "$NGINX_TEMPLATE" > "$NGINX_CONFIG"
    
    echo "✓ nginx.conf configured"
    echo "  API_ENDPOINT: ${API_ENDPOINT:-(empty)}"
    echo "  API_KEY: ${API_KEY:-(empty)}"
else
    echo "✗ ERROR: $NGINX_TEMPLATE not found!"
    exit 1
fi

# ============================================
# Step 3: Verify configuration
# ============================================
echo "[3/3] Verifying configuration..."

if [ -f "$CONFIG_JS_PATH" ] && [ -f "$NGINX_CONFIG" ]; then
    echo "✓ Configuration verified"
else
    echo "✗ ERROR: Configuration verification failed"
    exit 1
fi

echo ""
echo "=== Configuration Complete ==="
echo "Starting NGINX..."
echo ""

# Execute the command passed to this script (usually NGINX)
exec "$@"