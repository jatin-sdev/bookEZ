#!/bin/bash

# Test Upload API Endpoint
# This script demonstrates how to upload an image to the API using the TEST_ACCESS_TOKEN

set -e  # Exit on error

API_URL="${API_URL:-http://localhost:4000}"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "   TicketForge - Upload API Test"
echo "========================================="

# 1. Load TEST_ACCESS_TOKEN from .env
if [ -f "../.env" ]; then
  export $(grep -v '^#' ../.env | grep TEST_ACCESS_TOKEN | xargs)
fi

# 2. Use TEST_ACCESS_TOKEN or login to get a token
if [ -n "$TEST_ACCESS_TOKEN" ]; then
  echo -e "${GREEN}✅ Using TEST_ACCESS_TOKEN from .env${NC}"
  TOKEN="$TEST_ACCESS_TOKEN"
else
  echo -e "${YELLOW}⚠️  No TEST_ACCESS_TOKEN found, logging in...${NC}"
  
  # Login to get token
  LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@tf.com", "password": "12345678"}')
  
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
  
  if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Login failed. Response: $LOGIN_RESPONSE${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✅ Logged in successfully${NC}"
fi

echo "   Token: ${TOKEN:0:20}..."
echo ""

# 3. Create a test image (1x1 pixel PNG)
TEST_IMAGE="/tmp/test-upload.png"
echo -e "${YELLOW}Creating test image...${NC}"

# Create a minimal valid 1x1 PNG image
base64 -d > "$TEST_IMAGE" << 'EOF'
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==
EOF

echo -e "${GREEN}✅ Test image created at $TEST_IMAGE${NC}"
echo ""

# 4. Upload the image
echo -e "${YELLOW}Uploading image to $API_URL/api/upload...${NC}"

UPLOAD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$TEST_IMAGE" \
  -F "folder=test")

# Parse response
HTTP_CODE=$(echo "$UPLOAD_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$UPLOAD_RESPONSE" | sed '$d')

echo ""
echo "HTTP Code: $HTTP_CODE"
echo "Response: $RESPONSE_BODY"
echo ""

# 5. Validate response
if [ "$HTTP_CODE" == "201" ]; then
  IMAGE_URL=$(echo "$RESPONSE_BODY" | jq -r '.url')
  
  if [ "$IMAGE_URL" != "null" ] && [ -n "$IMAGE_URL" ]; then
    echo -e "${GREEN}✅ Upload successful!${NC}"
    echo "   Image URL: $IMAGE_URL"
  else
    echo -e "${RED}❌ Upload failed - no URL in response${NC}"
    exit 1
  fi
else
  echo -e "${RED}❌ Upload failed with HTTP $HTTP_CODE${NC}"
  exit 1
fi

# Cleanup
rm -f "$TEST_IMAGE"
echo -e "${GREEN}✅ Test completed successfully${NC}"
