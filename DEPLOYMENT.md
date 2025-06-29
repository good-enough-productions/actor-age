# Deployment Guide

This guide provides step-by-step instructions for deploying the IMDb Actor Age Extension API to Google Cloud Run.

## Prerequisites

- Google Cloud account with billing enabled
- `gcloud` CLI installed and configured
- Docker installed (for local testing)
- TMDB API key

## Step 1: Google Cloud Setup

### 1.1 Create a New Project
```bash
# Create project
gcloud projects create imdb-extension-api-[UNIQUE-ID]

# Set as active project
gcloud config set project imdb-extension-api-[UNIQUE-ID]

# Enable billing (required - do this in the console)
# Visit: https://console.cloud.google.com/billing
```

### 1.2 Enable Required APIs
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## Step 2: Secret Management

### 2.1 Store TMDB API Key
```bash
# Store your TMDB API key securely
echo "YOUR_ACTUAL_TMDB_API_KEY" | gcloud secrets create tmdb-api-key --data-file=-

# Verify the secret was created
gcloud secrets list
```

### 2.2 Grant Cloud Run Access to Secrets
```bash
# Get the project number
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

# Grant the Cloud Run service account access to the secret
gcloud secrets add-iam-policy-binding tmdb-api-key \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

## Step 3: Deploy to Cloud Run

### 3.1 Deploy Using Cloud Build
```bash
# Submit the build (this will build and deploy automatically)
gcloud builds submit --config cloudbuild.yaml

# Monitor the build
gcloud builds list --limit=5
```

### 3.2 Alternative: Manual Docker Deployment
```bash
# Build the Docker image
docker build -t gcr.io/$(gcloud config get-value project)/imdb-extension-api .

# Push to Container Registry
docker push gcr.io/$(gcloud config get-value project)/imdb-extension-api

# Deploy to Cloud Run
gcloud run deploy imdb-extension-api \
    --image gcr.io/$(gcloud config get-value project)/imdb-extension-api \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --set-env-vars NODE_ENV=production \
    --set-secrets TMDB_API_KEY=tmdb-api-key:latest
```

## Step 4: Verify Deployment

### 4.1 Test the Health Endpoint
```bash
# Get the service URL
SERVICE_URL=$(gcloud run services describe imdb-extension-api --region=us-central1 --format="value(status.url)")

# Test health endpoint
curl $SERVICE_URL/health
```

### 4.2 Test API Endpoints
```bash
# Test movie endpoint (using The Shawshank Redemption)
curl "$SERVICE_URL/api/movie/tt0111161"

# Test actor endpoint
curl "$SERVICE_URL/api/actor/Morgan%20Freeman"
```

## Step 5: Update Chrome Extension

### 5.1 Update API URL
Edit `src/services/ApiService.ts`:
```typescript
private static readonly BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-service-url.run.app'  // Replace with your actual URL
  : 'http://localhost:8080';
```

### 5.2 Update Manifest Permissions
Edit `src/manifest.json`:
```json
{
  "host_permissions": [
    "https://your-service-url.run.app/*"
  ]
}
```

### 5.3 Rebuild Extension
```bash
npm run build
```

## Step 6: Monitoring and Maintenance

### 6.1 View Logs
```bash
# View recent logs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=imdb-extension-api" --limit=50

# Follow logs in real-time
gcloud logs tail "resource.type=cloud_run_revision AND resource.labels.service_name=imdb-extension-api"
```

### 6.2 Monitor Performance
```bash
# Get service details
gcloud run services describe imdb-extension-api --region=us-central1

# View metrics in the console
echo "Visit: https://console.cloud.google.com/run/detail/us-central1/imdb-extension-api"
```

### 6.3 Update Deployment
```bash
# For code changes, simply run the build again
gcloud builds submit --config cloudbuild.yaml

# Or update specific configurations
gcloud run services update imdb-extension-api \
    --region us-central1 \
    --memory 1Gi \
    --max-instances 20
```

## Step 7: Cost Optimization

### 7.1 Set Up Budget Alerts
```bash
# Create a budget (adjust amount as needed)
gcloud billing budgets create \
    --billing-account=YOUR_BILLING_ACCOUNT_ID \
    --display-name="IMDb Extension API Budget" \
    --budget-amount=10USD \
    --threshold-rule=percent=50 \
    --threshold-rule=percent=90
```

### 7.2 Configure Auto-scaling
The current configuration includes:
- **Memory**: 512Mi (sufficient for the API)
- **CPU**: 1 (adequate for concurrent requests)
- **Max instances**: 10 (prevents runaway costs)
- **Min instances**: 0 (scales to zero when not used)

## Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Check build logs
   gcloud builds log $(gcloud builds list --limit=1 --format="value(id)")
   ```

2. **Service Won't Start**
   ```bash
   # Check service logs
   gcloud logs read "resource.type=cloud_run_revision" --limit=20
   ```

3. **Permission Denied**
   ```bash
   # Verify IAM permissions
   gcloud projects get-iam-policy $(gcloud config get-value project)
   ```

4. **Secret Access Issues**
   ```bash
   # Test secret access
   gcloud secrets versions access latest --secret="tmdb-api-key"
   ```

### Performance Tuning

1. **Increase Memory** (if needed):
   ```bash
   gcloud run services update imdb-extension-api --memory 1Gi --region us-central1
   ```

2. **Adjust CPU** (if needed):
   ```bash
   gcloud run services update imdb-extension-api --cpu 2 --region us-central1
   ```

3. **Configure Concurrency**:
   ```bash
   gcloud run services update imdb-extension-api --concurrency 100 --region us-central1
   ```

## Security Considerations

1. **API Key Security**: Never commit API keys to version control
2. **CORS Configuration**: Restrict origins in production
3. **Rate Limiting**: Monitor and adjust limits based on usage
4. **HTTPS Only**: Cloud Run enforces HTTPS by default
5. **IAM**: Use least-privilege access principles

## Cleanup

To avoid ongoing charges, you can delete resources:

```bash
# Delete the Cloud Run service
gcloud run services delete imdb-extension-api --region us-central1

# Delete the secret
gcloud secrets delete tmdb-api-key

# Delete the entire project (if desired)
gcloud projects delete $(gcloud config get-value project)
```

## Support

If you encounter issues:
1. Check the [troubleshooting section](#troubleshooting)
2. Review Cloud Run logs
3. Consult the [Google Cloud Run documentation](https://cloud.google.com/run/docs)
4. Open an issue in the project repository