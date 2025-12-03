#!/bin/bash
set -e

# Script to load secrets from AWS Secrets Manager via Kubernetes CSI driver
# Mounted at /mnt/secrets by the Secrets Store CSI Driver

echo "Starting docker entrypoint..."

# Initialize environment variables
export API_ENDPOINT=""
export API_KEY=""
export AZURE_AD_CLIENT_ID=""
export AZURE_AD_TENANT_ID=""
export AZURE_AD_CLIENT_SECRET=""
export REACT_APP_URL=""

# Function to read secret file safely
read_secret() {
    local secret_name=$1
    local secret_path="/mnt/secrets/$secret_name"
    
    if [ -f "$secret_path" ]; then
        cat "$secret_path"
    else
        echo ""
    fi
}

# Try to load secrets from mounted CSI driver
if [ -d "/mnt/secrets" ]; then
    echo "Reading secrets from /mnt/secrets..."
    
    # Read individual secret files (CSI driver mounts each secret as a file)
    API_ENDPOINT=$(read_secret "api_endpoint")
    API_KEY=$(read_secret "api_key")
    AZURE_AD_CLIENT_ID=$(read_secret "azure_ad_client_id")
    AZURE_AD_TENANT_ID=$(read_secret "azure_ad_tenant_id")
    AZURE_AD_CLIENT_SECRET=$(read_secret "azure_ad_client_secret")
    REACT_APP_URL=$(read_secret "react_app_url")
    
    # If secrets are not mounted as individual files, try reading from a JSON file
    if [ -f "/mnt/secrets/secrets.json" ]; then
        echo "Parsing secrets from secrets.json..."
        API_ENDPOINT=$(cat /mnt/secrets/secrets.json | grep -o '"api_endpoint":"[^"]*' | cut -d'"' -f4)
        API_KEY=$(cat /mnt/secrets/secrets.json | grep -o '"api_key":"[^"]*' | cut -d'"' -f4)
        AZURE_AD_CLIENT_ID=$(cat /mnt/secrets/secrets.json | grep -o '"azure_ad_client_id":"[^"]*' | cut -d'"' -f4)
        AZURE_AD_TENANT_ID=$(cat /mnt/secrets/secrets.json | grep -o '"azure_ad_tenant_id":"[^"]*' | cut -d'"' -f4)
        AZURE_AD_CLIENT_SECRET=$(cat /mnt/secrets/secrets.json | grep -o '"azure_ad_client_secret":"[^"]*' | cut -d'"' -f4)
        REACT_APP_URL=$(cat /mnt/secrets/secrets.json | grep -o '"react_app_url":"[^"]*' | cut -d'"' -f4)
    fi
else
    echo "Warning: /mnt/secrets not found. Using environment variables if available."
fi

# Fallback to environment variables if not set from secrets
if [ -z "$API_ENDPOINT" ]; then
    API_ENDPOINT="${API_ENDPOINT:-http://optimus-genai-app.stallions.svc:8000/api/v1/}"
    echo "API_ENDPOINT not found in secrets, using default or env var"
fi

if [ -z "$API_KEY" ]; then
    API_KEY="${API_KEY:-}"
    echo "Warning: API_KEY not set"
fi

# Export variables for envsubst
export API_ENDPOINT
export API_KEY
export AZURE_AD_CLIENT_ID
export AZURE_AD_TENANT_ID
export AZURE_AD_CLIENT_SECRET
export REACT_APP_URL

echo "Environment variables loaded:"
echo "API_ENDPOINT: $API_ENDPOINT"
echo "API_KEY: [REDACTED]"

# Generate NGINX configuration from template with environment variables
echo "Generating NGINX configuration..."
envsubst '${API_KEY} ${API_ENDPOINT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Verify NGINX configuration
echo "Validating NGINX configuration..."
nginx -t

# Start NGINX
echo "Starting NGINX..."
nginx -g 'daemon off;'
