#!/bin/bash

# ============================================
# TicketForge Authentication Tests
# ============================================
# Tests: Register, Login, Refresh Token, REST & GraphQL endpoints

BASE_URL="http://localhost:4000"
TEST_EMAIL="testuser_$(date +%s)@test.com"
TEST_PASSWORD="testpass123"
TEST_NAME="Test User"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "🔐 TicketForge Authentication Tests"
echo "===================================="
echo ""

# ----------------------------------------
# 1. Test User Registration (REST)
# ----------------------------------------
echo "1. Testing User Registration (REST /auth/register)..."

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"fullName\": \"$TEST_NAME\", \"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}")

if echo "$REGISTER_RESPONSE" | grep -q "success\|registered\|created"; then
  echo -e "${GREEN}✅ Registration successful${NC}"
else
  echo -e "${YELLOW}⚠️  Registration response: $REGISTER_RESPONSE${NC}"
fi
echo ""

# ----------------------------------------
# 2. Test User Login (REST)
# ----------------------------------------
echo "2. Testing User Login (REST /auth/login)..."

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}")

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refreshToken')

if [ "$ACCESS_TOKEN" != "null" ] && [ -n "$ACCESS_TOKEN" ]; then
  echo -e "${GREEN}✅ Login successful${NC}"
  echo "   Access Token: ${ACCESS_TOKEN:0:30}..."
  echo "   Refresh Token: ${REFRESH_TOKEN:0:30}..."
else
  echo -e "${RED}❌ Login failed: $LOGIN_RESPONSE${NC}"
  exit 1
fi
echo ""

# ----------------------------------------
# 3. Test Token Refresh (REST)
# ----------------------------------------
echo "3. Testing Token Refresh (REST /auth/refresh)..."

REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.accessToken')

if [ "$NEW_ACCESS_TOKEN" != "null" ] && [ -n "$NEW_ACCESS_TOKEN" ]; then
  echo -e "${GREEN}✅ Token refresh successful${NC}"
  echo "   New Access Token: ${NEW_ACCESS_TOKEN:0:30}..."
else
  echo -e "${YELLOW}⚠️  Token refresh response: $REFRESH_RESPONSE${NC}"
fi
echo ""

# ----------------------------------------
# 4. Test GraphQL with Auth Token
# ----------------------------------------
echo "4. Testing Authenticated GraphQL Query (me)..."

QUERY='query { me { id email fullName role } }'
JSON_PAYLOAD=$(jq -n --arg q "$QUERY" '{query: $q}')

ME_RESPONSE=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "$JSON_PAYLOAD")

USER_EMAIL=$(echo "$ME_RESPONSE" | jq -r '.data.me.email')

if [ "$USER_EMAIL" == "$TEST_EMAIL" ]; then
  echo -e "${GREEN}✅ GraphQL 'me' query works${NC}"
  echo "   User: $(echo "$ME_RESPONSE" | jq -c '.data.me')"
else
  echo -e "${YELLOW}⚠️  me query response: $ME_RESPONSE${NC}"
fi
echo ""

# ----------------------------------------
# 5. Test Admin Login
# ----------------------------------------
echo "5. Testing Admin Login..."

ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@tf.com", "password": "12345678"}')

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | jq -r '.accessToken')

if [ "$ADMIN_TOKEN" != "null" ] && [ -n "$ADMIN_TOKEN" ]; then
  echo -e "${GREEN}✅ Admin login successful${NC}"
  echo "   Admin Token: ${ADMIN_TOKEN:0:30}..."
else
  echo -e "${RED}❌ Admin login failed (Is the database seeded?)${NC}"
  echo "   Response: $ADMIN_LOGIN"
fi
echo ""

# ----------------------------------------
# 6. Test Unauthenticated Request
# ----------------------------------------
echo "6. Testing Protected Query Without Token..."

QUERY='query { myOrders { id } }'
JSON_PAYLOAD=$(jq -n --arg q "$QUERY" '{query: $q}')

UNAUTH_RESPONSE=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -d "$JSON_PAYLOAD")

if echo "$UNAUTH_RESPONSE" | grep -qi "unauthorized\|unauthenticated\|error"; then
  echo -e "${GREEN}✅ Correctly rejected unauthenticated request${NC}"
else
  echo -e "${YELLOW}⚠️  Response: $UNAUTH_RESPONSE${NC}"
fi
echo ""

# ----------------------------------------
# Summary
# ----------------------------------------
echo "===================================="
echo -e "${GREEN}🎉 Authentication Tests Complete!${NC}"
echo "===================================="
echo ""
