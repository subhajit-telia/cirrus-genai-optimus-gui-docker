#!/bin/sh
set -e

echo "=== GenAI Optimus GUI - Runtime Configuration ==="

# Paths
CONFIG_JS_PATH="/usr/share/nginx/html/config.js"
NGINX_TEMPLATE="/etc/nginx/nginx.conf.template"
NGINX_CONFIG="/etc/nginx/nginx.conf"

# ============================================
# Step 1: Configure config.js with placeholders
# ============================================
if [ -f "$CONFIG_JS_PATH" ]; then
    echo "[1/3] Configuring config.js..."
    
    # Replace all placeholders with environment variables or defaults
    sed -i "s|__REACT_APP_API_URL__|${REACT_APP_API_URL:-/api}|g" "$CONFIG_JS_PATH"
    sed -i "s|__REACT_APP_ENV__|${REACT_APP_ENV:-production}|g" "$CONFIG_JS_PATH"
    sed -i "s|__AZURE_CLIENT_ID__|${AZURE_CLIENT_ID:-}|g" "$CONFIG_JS_PATH"
    sed -i "s|__AZURE_TENANT_ID__|${AZURE_TENANT_ID:-}|g" "$CONFIG_JS_PATH"
    
    echo "✓ config.js configured"
    echo "  REACT_APP_API_URL: ${REACT_APP_API_URL:-/api}"
    echo "  REACT_APP_ENV: ${REACT_APP_ENV:-production}"
    echo "  AZURE_CLIENT_ID: ${AZURE_CLIENT_ID:-(empty)}"
    echo "  AZURE_TENANT_ID: ${AZURE_TENANT_ID:-(empty)}"
else
    echo "✗ ERROR: $CONFIG_JS_PATH not found!"
    exit 1
fi

# ============================================
# Step 2: Configure nginx.conf from template
# ============================================
if [ -f "$NGINX_TEMPLATE" ]; then
    echo "[2/3] Configuring NGINX..."
    
    # Use envsubst to replace environment variables in nginx config
    envsubst '${API_ENDPOINT} ${API_KEY} ${AZURE_CLIENT_ID} ${AZURE_TENANT_ID}' < "$NGINX_TEMPLATE" > "$NGINX_CONFIG"
    
    echo "✓ nginx.conf configured"
    echo "  API_ENDPOINT: ${API_ENDPOINT:-(empty)}"
    echo "  API_KEY: ${API_KEY:-(empty - will use '"removed"' header)}"
else
    echo "✗ ERROR: $NGINX_TEMPLATE not found!"
    exit 1
fi

# ============================================
# Step 3: Verify configuration
# ============================================
echo "[3/3] Verifying configuration..."

if [ -f "$NGINX_CONFIG" ]; then
    echo "✓ NGINX configuration verified"
else
    echo "✗ ERROR: NGINX configuration failed to generate"
    exit 1
fi

echo ""
echo "=== Configuration Complete ==="
echo "Starting NGINX..."
echo ""

# Execute the command passed to this script (usually NGINX)
exec "$@"