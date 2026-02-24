# Environment Variable Configuration

This document describes the environment variable configuration for the CI/CD pipeline.

## Overview

The pipeline uses environment variables to configure services during testing and deployment. Variables can be set at multiple levels:

1. **Workflow-level**: Global variables used across all jobs (e.g., `REGISTRY`, `IMAGE_PREFIX`)
2. **Job-level**: Variables specific to each service type (Java, Python, Frontend)
3. **GitHub Secrets**: Sensitive values stored securely in repository or environment secrets

## Workflow-Level Environment Variables

These variables are configured at the top of the workflow and available to all jobs:

| Variable | Value | Description |
|----------|-------|-------------|
| `REGISTRY` | `ghcr.io` | Container registry URL |
| `IMAGE_PREFIX` | `ghcr.io/${{ github.repository_owner }}/${{ github.event.repository.name }}` | Prefix for all Docker image names |

## Job-Level Environment Variables

### Java Services (UserService, ContentService)

Environment variables for Java service testing:

| Variable | Secret Name | Default Value | Description |
|----------|-------------|---------------|-------------|
| `SPRING_DATASOURCE_URL` | `TEST_DATABASE_URL` | `jdbc:postgresql://localhost:5432/testdb` | JDBC URL for test database |
| `SPRING_DATASOURCE_USERNAME` | `TEST_DB_USERNAME` | `postgres` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | `TEST_DB_PASSWORD` | `postgres` | Database password |
| `SPRING_RABBITMQ_HOST` | `TEST_RABBITMQ_HOST` | `localhost` | RabbitMQ host |
| `SPRING_RABBITMQ_PORT` | `TEST_RABBITMQ_PORT` | `5672` | RabbitMQ port |
| `SPRING_RABBITMQ_USERNAME` | `TEST_RABBITMQ_USERNAME` | `guest` | RabbitMQ username |
| `SPRING_RABBITMQ_PASSWORD` | `TEST_RABBITMQ_PASSWORD` | `guest` | RabbitMQ password |

### Python Services (AIService, MCQService)

Environment variables for Python service testing:

| Variable | Secret Name | Default Value | Description |
|----------|-------------|---------------|-------------|
| `DATABASE_URL` | `TEST_DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/testdb` | PostgreSQL connection URL |
| `S3_ENDPOINT_URL` | `TEST_S3_ENDPOINT_URL` | `http://localhost:9000` | S3/MinIO endpoint URL |
| `S3_ACCESS_KEY` | `TEST_S3_ACCESS_KEY` | `testkey` | S3 access key |
| `S3_SECRET_KEY` | `TEST_S3_SECRET_KEY` | `testsecret` | S3 secret key |
| `S3_BUCKET_NAME` | `TEST_S3_BUCKET_NAME` | `testbucket` | S3 bucket name |

### Frontend

Environment variables for frontend testing:

| Variable | Secret Name | Default Value | Description |
|----------|-------------|---------------|-------------|
| `VITE_API_URL` | `TEST_API_URL` | `http://localhost:8080` | API endpoint URL |
| `NODE_ENV` | N/A | `test` | Node environment (hardcoded) |

## GitHub Environments

The pipeline uses GitHub Environments to separate staging and production deployments:

### Staging Environment

- **Name**: `staging`
- **Used for**: All non-main branches
- **URL**: `https://staging.example.com` (update to your actual staging URL)
- **Approval**: Not required
- **Jobs**: `push-images`, `deployment-manifest`

### Production Environment

- **Name**: `production`
- **Used for**: Main branch only
- **URL**: `https://production.example.com` (update to your actual production URL)
- **Approval**: Can be configured to require manual approval
- **Jobs**: `push-images`, `deployment-manifest`

## Configuring Secrets

### Repository Secrets

Repository secrets are available to all workflows and environments:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the secret name and value
4. Click **Add secret**

### Environment Secrets

Environment secrets override repository secrets for specific environments:

1. Go to **Settings** → **Environments**
2. Click on the environment name (e.g., `production`)
3. Click **Add secret**
4. Add the secret name and value
5. Click **Add secret**

## Secret Precedence

When a secret is defined at multiple levels, the following precedence applies:

1. **Environment secrets** (highest priority)
2. **Repository secrets**
3. **Default values** (lowest priority)

## Example Configuration

### Development/Testing (Default Values)

For local development and CI testing, the default values are used. No secrets need to be configured.

### Staging Environment

Configure staging-specific secrets:

```
TEST_DATABASE_URL=jdbc:postgresql://staging-db.example.com:5432/stagingdb
TEST_DB_USERNAME=staging_user
TEST_DB_PASSWORD=<staging-password>
TEST_S3_ENDPOINT_URL=https://s3-staging.example.com
TEST_S3_ACCESS_KEY=<staging-access-key>
TEST_S3_SECRET_KEY=<staging-secret-key>
TEST_API_URL=https://api-staging.example.com
```

### Production Environment

Configure production-specific secrets:

```
TEST_DATABASE_URL=jdbc:postgresql://prod-db.example.com:5432/proddb
TEST_DB_USERNAME=prod_user
TEST_DB_PASSWORD=<production-password>
TEST_S3_ENDPOINT_URL=https://s3.example.com
TEST_S3_ACCESS_KEY=<production-access-key>
TEST_S3_SECRET_KEY=<production-secret-key>
TEST_API_URL=https://api.example.com
```

## Security Best Practices

1. **Never commit secrets**: Always use GitHub Secrets for sensitive values
2. **Use environment-specific secrets**: Configure different secrets for staging and production
3. **Rotate secrets regularly**: Update secrets periodically for security
4. **Limit secret access**: Use environment protection rules to restrict who can access production secrets
5. **Use least privilege**: Grant only the minimum required permissions
6. **Audit secret usage**: Review workflow logs to ensure secrets are not exposed

## Troubleshooting

### Secret Not Found

If a secret is not found, the default value will be used. Check:

1. Secret name matches exactly (case-sensitive)
2. Secret is configured at the repository or environment level
3. Environment name matches the workflow configuration

### Secret Not Working

If a secret value is not being used:

1. Verify the secret is configured correctly
2. Check the workflow logs for the actual value being used (secrets are masked)
3. Ensure the environment is correctly specified in the workflow
4. Verify environment protection rules are not blocking access

### Default Values Used Instead of Secrets

If default values are being used when secrets are configured:

1. Check the secret name matches the expected name
2. Verify the secret is available to the workflow (repository or environment level)
3. Ensure the syntax `${{ secrets.SECRET_NAME || 'default' }}` is correct
4. Check if environment protection rules are preventing access

## References

- [GitHub Actions: Using secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [GitHub Actions: Using environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [GitHub Actions: Environment protection rules](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment#environment-protection-rules)
