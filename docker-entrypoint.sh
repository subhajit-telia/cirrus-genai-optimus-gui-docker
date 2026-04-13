#!/bin/sh
set -eu

NGINX_TMPL="/etc/nginx/nginx.conf.template"
NGINX_CONF="/etc/nginx/nginx.conf"
RUNTIME_ENV_JS="/usr/share/nginx/html/runtime-env.js"

: "${API_ENDPOINT:=}"
: "${API_KEY:=}"
: "${AZURE_AD_CLIENT_ID:=}"
: "${AZURE_AD_TENANT_ID:=}"
: "${REACT_APP_API_URL:=}"
: "${REACT_APP_URL:=}"

cat > "$RUNTIME_ENV_JS" <<EOF
window.RUNTIME_ENV = {
  API_ENDPOINT: "${API_ENDPOINT}",
  API_KEY: "${API_KEY}",
  AZURE_AD_CLIENT_ID: "${AZURE_AD_CLIENT_ID}",
  AZURE_AD_TENANT_ID: "${AZURE_AD_TENANT_ID}",
  REACT_APP_API_URL: "${REACT_APP_API_URL}",
  REACT_APP_URL: "${REACT_APP_URL}"
};
EOF

envsubst '${API_KEY} ${API_ENDPOINT}' < "$NGINX_TMPL" > "$NGINX_CONF"

exec nginx -g 'daemon off;'

