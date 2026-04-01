# AWS Secrets Integration Implementation Guide

This document describes how the application retrieves secrets from AWS Secrets Manager and injects them into the Docker container running on EKS.

## Architecture Overview

```
AWS Secrets Manager
    ↓
Kubernetes Secrets Store CSI Driver (AWS Provider)
    ↓
Mounted at /mnt/secrets in pod
    ↓
Docker entrypoint script reads secrets
    ↓
Environment variables set
    ↓
NGINX configuration generated via envsubst
    ↓
Application starts with correct API endpoint
```

## Components

### 1. Docker Entrypoint Script (`docker-entrypoint.sh`)
- Reads secrets from `/mnt/secrets` mounted by the CSI driver
- Falls back to environment variables if secrets not found
- Exports all secrets as environment variables
- Runs `envsubst` to generate NGINX configuration
- Starts NGINX server

**Key features:**
- Supports both individual secret files and JSON format
- Validates NGINX configuration before starting
- Provides fallback values and warnings

### 2. Dockerfile Updates
- Installs `bash` and `jq` for script execution
- Copies `docker-entrypoint.sh` to container
- Makes script executable
- Uses ENTRYPOINT to run the script instead of direct CMD

### 3. Helm Configuration (`values.yaml`)
- Defines environment variables from Kubernetes secrets
- Mounts CSI secrets at `/mnt/secrets`
- References `ai-optimus-gui-secrets` Kubernetes secret

### 4. AWS Secrets Manager Configuration
Environment-specific SecretProviderClass definitions:
- `secret-provider-class-dev.yaml` - Development secrets
- `secret-provider-class-stage.yaml` - Staging secrets
- `secret-provider-class-prod.yaml` - Production secrets

Each references secrets stored in AWS under paths like:
- `stallions/optimus_prime_se/webapp/dev`
- `stallions/optimus_prime_se/webapp/stage`
- `stallions/optimus_prime_se/webapp/prod`

## Prerequisites

1. **AWS Secrets Manager Setup**
   - Store secrets under: `stallions/optimus_prime_se/webapp/{env}`
   - Required secret keys:
     - `api_endpoint`
     - `api_key`
     - `azure_ad_client_id`
     - `azure_ad_tenant_id`
     - `react_app_url`

2. **EKS Cluster Requirements**
   - Secrets Store CSI Driver installed
   - AWS Secrets Manager provider for CSI driver
   - Service account with IAM permissions to read secrets

3. **IAM Permissions**
   The service account `execution` needs policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "secretsmanager:GetSecretValue",
           "secretsmanager:DescribeSecret"
         ],
         "Resource": "arn:aws:secretsmanager:eu-north-1:*:secret:stallions/optimus_prime_se/webapp/*"
       }
     ]
   }
   ```

## Deployment Steps

### Step 1: Apply SecretProviderClass
```bash
# For development
kubectl apply -f helm/cirrus/env_values/secret-provider-class-dev.yaml

# For staging
kubectl apply -f helm/cirrus/env_values/secret-provider-class-stage.yaml

# For production
kubectl apply -f helm/cirrus/env_values/secret-provider-class-prod.yaml
```

### Step 2: Create Kubernetes Secret (optional, for fallback)
```bash
kubectl create secret generic ai-optimus-gui-secrets \
  --from-literal=api_endpoint='your-api_endpoint' \
  --from-literal=api_key='your-api-key' \
  --from-literal=azure_ad_client_id='your-client-id' \
  --from-literal=azure_ad_tenant_id='your-tenant-id' \
  --from-literal=react_app_url='your-url'
```

### Step 3: Deploy with Helm
```bash
# Development
helm upgrade --install ai-optimus-gui ./helm/cirrus \
  -f helm/cirrus/env_values/dev.yaml \
  --namespace default

# Staging
helm upgrade --install ai-optimus-gui ./helm/cirrus \
  -f helm/cirrus/env_values/stage.yaml \
  --namespace default

# Production
helm upgrade --install ai-optimus-gui ./helm/cirrus \
  -f helm/cirrus/env_values/prod.yaml \
  --namespace default
```

## Environment Variables Flow

1. **Build Time**: `.env.production` sets `VITE_API_BASE_URL=/api` (relative path)
2. **Container Runtime**: 
   - Entrypoint script reads from AWS Secrets Manager
   - Sets `API_ENDPOINT` environment variable
   - NGINX receives the full API endpoint via proxy_pass
3. **Client Side**: Browser requests `/api/*` which NGINX proxies to the actual backend

## Troubleshooting

### Secrets Not Loading
1. Check CSI driver logs:
   ```bash
   kubectl logs -n kube-system -l app=secrets-store-csi-driver
   ```

2. Verify secret mounting:
   ```bash
   kubectl exec -it <pod-name> -- ls -la /mnt/secrets/
   ```

3. Check pod logs:
   ```bash
   kubectl logs <pod-name>
   ```

### NGINX Configuration Issues
1. Validate template:
   ```bash
   docker run -it --rm -e API_ENDPOINT='test' -v $(pwd):/app alpine \
     sh -c 'apk add gettext && envsubst < /app/nginx.conf.template'
   ```

2. Check generated config in pod:
   ```bash
   kubectl exec -it <pod-name> -- cat /etc/nginx/nginx.conf
   ```

## Local Testing

To test the Docker image locally:

```bash
# Build image
docker build -t optimus-gui:local .

# Run with secrets simulation
docker run -it -p 8000:80 \
  -e API_ENDPOINT="http://localhost:8010/api/v1/" \
  -e API_KEY="test-key" \
  optimus-gui:local
```

## Security Considerations

1. **Secret Encryption**: Secrets are encrypted in AWS Secrets Manager
2. **IAM Policies**: Use least privilege for secret access
3. **Audit Logging**: Enable CloudTrail for secret access
4. **Secret Rotation**: Implement AWS Secrets Manager automatic rotation
5. **Pod Security**: Use Pod Security Standards to restrict container privileges

## Additional Notes

- The entrypoint script uses `envsubst` for variable substitution in NGINX config
- Secrets are NOT logged (except via warning messages)
- Fallback values are used if secrets are unavailable
- The CSI driver mounts secrets as read-only files
- Each pod gets its own copy of mounted secrets
