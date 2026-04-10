#!/bin/bash
# ============================================
# Deploy Quest Website to GCP Cloud Run
# ============================================
# Prerequisites:
#   1. gcloud CLI installed: https://cloud.google.com/sdk/docs/install
#   2. Authenticated: gcloud auth login (use sstbrg@gmail.com)
#   3. Docker installed (or use Cloud Build)
#
# Usage: ./deploy.sh
# ============================================

set -euo pipefail

# ---- Configuration ----
PROJECT_ID="${GCP_PROJECT_ID:-}"
REGION="me-west1"               # Israel region for lowest latency
SERVICE_NAME="quest"
IMAGE_NAME="quest-website"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
GOLD='\033[0;33m'
NC='\033[0m'

echo -e "${GOLD}✦ Quest Website Deployment${NC}"
echo "================================"

# ---- Step 1: Ensure we have a project ----
if [ -z "$PROJECT_ID" ]; then
  PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
  if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Error: No GCP project set.${NC}"
    echo "Run: gcloud config set project YOUR_PROJECT_ID"
    echo "Or:  export GCP_PROJECT_ID=your-project-id"
    exit 1
  fi
fi

echo -e "Project: ${GREEN}${PROJECT_ID}${NC}"
echo -e "Region:  ${GREEN}${REGION}${NC}"
echo -e "Service: ${GREEN}${SERVICE_NAME}${NC}"
echo ""

# ---- Step 2: Enable required APIs ----
echo -e "${GOLD}Enabling required APIs...${NC}"
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com --project="$PROJECT_ID" --quiet

# ---- Step 3: Create Artifact Registry repo if needed ----
echo -e "${GOLD}Setting up Artifact Registry...${NC}"
gcloud artifacts repositories describe docker-repo \
  --location="$REGION" \
  --project="$PROJECT_ID" 2>/dev/null || \
gcloud artifacts repositories create docker-repo \
  --repository-format=docker \
  --location="$REGION" \
  --project="$PROJECT_ID" \
  --quiet

# ---- Step 4: Build and push with Cloud Build ----
echo -e "${GOLD}Building container with Cloud Build...${NC}"
IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/docker-repo/${IMAGE_NAME}:latest"

gcloud builds submit \
  --tag="$IMAGE_URI" \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --quiet

# ---- Step 5: Deploy to Cloud Run ----
echo -e "${GOLD}Deploying to Cloud Run...${NC}"
gcloud run deploy "$SERVICE_NAME" \
  --image="$IMAGE_URI" \
  --platform=managed \
  --region="$REGION" \
  --allow-unauthenticated \
  --port=8080 \
  --memory=128Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=3 \
  --project="$PROJECT_ID" \
  --quiet

# ---- Step 6: Get URL ----
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.url)")

echo ""
echo "================================"
echo -e "${GREEN}✓ Deployment successful!${NC}"
echo -e "Cloud Run URL: ${GREEN}${SERVICE_URL}${NC}"
echo ""
echo "================================"
echo -e "${GOLD}Next: Custom Domain Setup${NC}"
echo "================================"
echo ""
echo "To map quest.steinberg-tech.com:"
echo ""
echo "1. Map the domain in Cloud Run:"
echo "   gcloud beta run domain-mappings create \\"
echo "     --service=$SERVICE_NAME \\"
echo "     --domain=quest.steinberg-tech.com \\"
echo "     --region=$REGION \\"
echo "     --project=$PROJECT_ID"
echo ""
echo "2. Then add these DNS records in GoDaddy:"
echo "   (The exact records will be shown after running the command above)"
echo "   Typically: CNAME record quest -> ghs.googlehosted.com"
echo ""
echo "================================"
