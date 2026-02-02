#!/bin/bash

# ============================================
# TicketForge Payment Flow Tests (Razorpay)
# ============================================
# Tests: Book Tickets -> Create Payment Order -> Verify Payment -> Check Status

BASE_URL="http://localhost:4000"
EMAIL="admin@tf.com"
PASSWORD="12345678"

# Source .env for RAZORPAY_KEY_SECRET
if [ -f ".env" ]; then
    export $(cat ".env" | grep -v '#' | xargs)
elif [ -f "../.env" ]; then
    export $(cat "../.env" | grep -v '#' | xargs)
fi

if [ -z "$RAZORPAY_KEY_SECRET" ]; then
    echo "❌ RAZORPAY_KEY_SECRET not found in .env"
    exit 1
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "💳 TicketForge Payment Flow Tests"
echo "=================================="
echo ""

# 1. Login
echo -e "${BLUE}1. Logging in...${NC}"
LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")
TOKEN=$(echo "$LOGIN_RES" | jq -r '.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed.${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Logged in${NC}"

# ... (We reuse Venue/Event creation from booking test for isolation, 
# but for brevity let's try to assume we can create a fresh one quickly)

# 2. Setup Short-flow (Create Event)
echo -e "${BLUE}2. Setting up Event...${NC}"
RANDOM_SUFFIX=$(date +%s)
QUERY="mutation { createVenue(input: { name: \"PayVenue $RANDOM_SUFFIX\", location: \"Test City\", capacity: 100 }) { id } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')
VENUE_RES=$(curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON")
VENUE_ID=$(echo "$VENUE_RES" | jq -r '.data.createVenue.id')

QUERY="mutation { addSection(venueId: \"$VENUE_ID\", input: { name: \"VIP\", capacity: 5, basePrice: 1000, rows: 1, seatsPerRow: 5 }) { id } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')
SECTION_RES=$(curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON")
SECTION_ID=$(echo "$SECTION_RES" | jq -r '.data.addSection.id')

FUTURE_DATE=$(date -u -v+30d +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -d "+30 days" +"%Y-%m-%dT%H:%M:%SZ")
QUERY="mutation { createEvent(input: { name: \"PayEvent $RANDOM_SUFFIX\", venueId: \"$VENUE_ID\", date: \"$FUTURE_DATE\" }) { id } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')
EVENT_RES=$(curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON")
EVENT_ID=$(echo "$EVENT_RES" | jq -r '.data.createEvent.id')

QUERY="mutation { publishEvent(id: \"$EVENT_ID\") { status } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')
curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON" > /dev/null

echo -e "${GREEN}✅ Event setup complete: $EVENT_ID${NC}"

# 3. Get Seat
QUERY="query { sectionSeats(eventId: \"$EVENT_ID\", sectionId: \"$SECTION_ID\") { id } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')
SEATS_RES=$(curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON")
SEAT_ID=$(echo "$SEATS_RES" | jq -r '.data.sectionSeats[0].id')

# 4. Lock & Book (Create Pending Order)
echo -e "${BLUE}3. Booking Ticket (PENDING Order)...${NC}"
QUERY="mutation { lockSeat(eventId: \"$EVENT_ID\", seatId: \"$SEAT_ID\") { status } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')
curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON" > /dev/null

IDEMPOTENCY_KEY="pay-test-$RANDOM_SUFFIX"
QUERY="mutation { bookTickets(eventId: \"$EVENT_ID\", seatIds: [\"$SEAT_ID\"], idempotencyKey: \"$IDEMPOTENCY_KEY\") { id status totalAmount } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')
BOOK_RES=$(curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON")
ORDER_ID=$(echo "$BOOK_RES" | jq -r '.data.bookTickets.id')
STATUS=$(echo "$BOOK_RES" | jq -r '.data.bookTickets.status')

if [ "$STATUS" != "PENDING" ]; then
    echo -e "${RED}❌ Order status should be PENDING, got $STATUS${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Order Created: $ORDER_ID (Status: $STATUS)${NC}"

# 5. Create Payment Order
echo -e "${BLUE}4. Creating Razorpay Order...${NC}"
QUERY="mutation { createPaymentOrder(orderId: \"$ORDER_ID\") { id amount currency } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')
PAY_RES=$(curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON")

RZP_ORDER_ID=$(echo "$PAY_RES" | jq -r '.data.createPaymentOrder.id')
if [ "$RZP_ORDER_ID" == "null" ]; then
    echo -e "${RED}❌ Payment Order Creation Failed: $PAY_RES${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Razorpay Order ID: $RZP_ORDER_ID${NC}"

# 6. Simulate Payment & Verify Signature
echo -e "${BLUE}5. Verifying Payment Signature...${NC}"
RZP_PAYMENT_ID="pay_mock_$RANDOM_SUFFIX"
PAYLOAD="$RZP_ORDER_ID|$RZP_PAYMENT_ID"

# Generate HMAC SHA256 Signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$RAZORPAY_KEY_SECRET" -hex | sed 's/^.* //')

QUERY="mutation { confirmPayment(orderId: \"$ORDER_ID\", razorpayOrderId: \"$RZP_ORDER_ID\", razorpayPaymentId: \"$RZP_PAYMENT_ID\", signature: \"$SIGNATURE\") }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')
CONFIRM_RES=$(curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON")
SUCCESS=$(echo "$CONFIRM_RES" | jq -r '.data.confirmPayment')

if [ "$SUCCESS" != "true" ]; then
    echo -e "${RED}❌ Payment Confirmation Failed: $CONFIRM_RES${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Payment Confirmed!${NC}"

# 7. Check Final Order Status
echo -e "${BLUE}6. Checking Final Order Status...${NC}"
QUERY="query { myOrders { id status } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')
ORDERS_RES=$(curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON")

# Use jq to find the order with our specific ID and check its status
FINAL_STATUS=$(echo "$ORDERS_RES" | jq -r ".data.myOrders[] | select(.id == \"$ORDER_ID\") | .status")

if [ "$FINAL_STATUS" == "COMPLETED" ]; then
    echo -e "${GREEN}✅ Order $ORDER_ID is COMPLETED${NC}"
else
    echo -e "${RED}❌ Order status mismatch. Expected COMPLETED, got $FINAL_STATUS${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Payment Flow Test Passed!${NC}"
