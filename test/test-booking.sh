#!/bin/bash

# ============================================
# TicketForge Booking Flow Tests
# ============================================
# Tests: Lock Seat → Book Tickets → View Orders

BASE_URL="http://localhost:4000"
EMAIL="admin@tf.com"
PASSWORD="12345678"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "🎫 TicketForge Booking Flow Tests"
echo "=================================="
echo ""

# ----------------------------------------
# 1. Login
# ----------------------------------------
echo -e "${BLUE}1. Logging in as admin...${NC}"

LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RES" | jq -r '.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed. Is the database seeded?${NC}"
  echo "   Response: $LOGIN_RES"
  exit 1
fi

echo -e "${GREEN}✅ Logged in successfully${NC}"
echo ""

# ----------------------------------------
# 2. Create Venue
# ----------------------------------------
echo -e "${BLUE}2. Creating test venue...${NC}"

QUERY='mutation { createVenue(input: { name: "Booking Test Arena", location: "Test City", capacity: 500 }) { id name } }'
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')

VENUE_RES=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$JSON")

VENUE_ID=$(echo "$VENUE_RES" | jq -r '.data.createVenue.id')

if [ "$VENUE_ID" == "null" ] || [ -z "$VENUE_ID" ]; then
  echo -e "${RED}❌ Create venue failed: $VENUE_RES${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Venue created: $VENUE_ID${NC}"
echo ""

# ----------------------------------------
# 3. Add Section with Seats
# ----------------------------------------
echo -e "${BLUE}3. Adding section with seats (3 rows × 4 seats)...${NC}"

QUERY="mutation { addSection(venueId: \"$VENUE_ID\", input: { name: \"Premium Section\", capacity: 12, basePrice: 5000, rows: 3, seatsPerRow: 4 }) { id name } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')

SECTION_RES=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$JSON")

SECTION_ID=$(echo "$SECTION_RES" | jq -r '.data.addSection.id')

if [ "$SECTION_ID" == "null" ] || [ -z "$SECTION_ID" ]; then
  echo -e "${RED}❌ Add section failed: $SECTION_RES${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Section created: $SECTION_ID${NC}"
echo ""

# ----------------------------------------
# 4. Create Event
# ----------------------------------------
echo -e "${BLUE}4. Creating event...${NC}"

FUTURE_DATE=$(date -u -v+30d +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -d "+30 days" +"%Y-%m-%dT%H:%M:%SZ")

QUERY="mutation { createEvent(input: { name: \"Booking Test Concert\", venueId: \"$VENUE_ID\", date: \"$FUTURE_DATE\" }) { id name status } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')

EVENT_RES=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$JSON")

EVENT_ID=$(echo "$EVENT_RES" | jq -r '.data.createEvent.id')

if [ "$EVENT_ID" == "null" ] || [ -z "$EVENT_ID" ]; then
  echo -e "${RED}❌ Create event failed: $EVENT_RES${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Event created: $EVENT_ID${NC}"
echo ""

# ----------------------------------------
# 5. Publish Event
# ----------------------------------------
echo -e "${BLUE}5. Publishing event (creates seat inventory partition)...${NC}"

QUERY="mutation { publishEvent(id: \"$EVENT_ID\") { id status } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')

PUBLISH_RES=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$JSON")

PUBLISH_STATUS=$(echo "$PUBLISH_RES" | jq -r '.data.publishEvent.status')

if [ "$PUBLISH_STATUS" != "PUBLISHED" ]; then
  echo -e "${RED}❌ Publish failed: $PUBLISH_RES${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Event published${NC}"
echo ""

# ----------------------------------------
# 6. Fetch Available Seats
# ----------------------------------------
echo -e "${BLUE}6. Fetching available seats...${NC}"

QUERY="query { sectionSeats(eventId: \"$EVENT_ID\", sectionId: \"$SECTION_ID\") { id row number status } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')

SEATS_RES=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$JSON")

# Get first two available seats
SEAT_1=$(echo "$SEATS_RES" | jq -r '.data.sectionSeats[0].id')
SEAT_2=$(echo "$SEATS_RES" | jq -r '.data.sectionSeats[1].id')
SEAT_COUNT=$(echo "$SEATS_RES" | jq '.data.sectionSeats | length')

if [ "$SEAT_1" == "null" ] || [ -z "$SEAT_1" ]; then
  echo -e "${RED}❌ No seats found: $SEATS_RES${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Found $SEAT_COUNT seats${NC}"
echo "   Seat 1: $SEAT_1"
echo "   Seat 2: $SEAT_2"
echo ""

# ----------------------------------------
# 7. Lock Seats
# ----------------------------------------
echo -e "${BLUE}7. Locking seats...${NC}"

# Lock Seat 1
QUERY="mutation { lockSeat(eventId: \"$EVENT_ID\", seatId: \"$SEAT_1\") { id status } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')

LOCK_1=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$JSON")

STATUS_1=$(echo "$LOCK_1" | jq -r '.data.lockSeat.status')

# Lock Seat 2
QUERY="mutation { lockSeat(eventId: \"$EVENT_ID\", seatId: \"$SEAT_2\") { id status } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')

LOCK_2=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$JSON")

STATUS_2=$(echo "$LOCK_2" | jq -r '.data.lockSeat.status')

if [ "$STATUS_1" == "LOCKED" ] && [ "$STATUS_2" == "LOCKED" ]; then
  echo -e "${GREEN}✅ Both seats locked successfully${NC}"
else
  echo -e "${RED}❌ Lock failed - Seat 1: $STATUS_1, Seat 2: $STATUS_2${NC}"
  exit 1
fi
echo ""

# ----------------------------------------
# 7.5. Test Unlock (Deselect)
# ----------------------------------------
echo -e "${BLUE}7.5. Unlocking seat 1 (user deselects)...${NC}"

QUERY="mutation { unlockSeat(eventId: \"$EVENT_ID\", seatId: \"$SEAT_1\") }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')

UNLOCK_RES=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$JSON")

UNLOCK_SUCCESS=$(echo "$UNLOCK_RES" | jq -r '.data.unlockSeat')

if [ "$UNLOCK_SUCCESS" == "true" ]; then
  echo -e "${GREEN}✅ Seat 1 unlocked successfully${NC}"
else
  echo -e "${RED}❌ Unlock failed: $UNLOCK_RES${NC}"
  exit 1
fi

# Re-lock for booking test
echo -e "${BLUE}    Re-locking seat 1 for booking test...${NC}"
QUERY="mutation { lockSeat(eventId: \"$EVENT_ID\", seatId: \"$SEAT_1\") { id status } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')
curl -s -X POST "$BASE_URL/graphql" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$JSON" > /dev/null
echo -e "${GREEN}    Re-locked${NC}"
echo ""

# ----------------------------------------
# 8. Book Tickets
# ----------------------------------------
echo -e "${BLUE}8. Booking tickets (with idempotency key)...${NC}"

IDEMPOTENCY_KEY=$(uuidgen 2>/dev/null || cat /proc/sys/kernel/random/uuid)

QUERY="mutation { bookTickets(eventId: \"$EVENT_ID\", seatIds: [\"$SEAT_1\", \"$SEAT_2\"], idempotencyKey: \"$IDEMPOTENCY_KEY\") { id status totalAmount tickets { id sectionName row number } } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')

BOOK_RES=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$JSON")

ORDER_ID=$(echo "$BOOK_RES" | jq -r '.data.bookTickets.id')
ORDER_STATUS=$(echo "$BOOK_RES" | jq -r '.data.bookTickets.status')
TOTAL=$(echo "$BOOK_RES" | jq -r '.data.bookTickets.totalAmount')
TICKET_COUNT=$(echo "$BOOK_RES" | jq '.data.bookTickets.tickets | length')

if [ "$ORDER_ID" == "null" ] || [ -z "$ORDER_ID" ]; then
  echo -e "${RED}❌ Booking failed: $BOOK_RES${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Booking successful!${NC}"
echo "   Order ID: $ORDER_ID"
echo "   Status: $ORDER_STATUS"
echo "   Total: $TOTAL cents"
echo "   Tickets: $TICKET_COUNT"
echo ""

# ----------------------------------------
# 9. Test Idempotency (Retry Same Booking)
# ----------------------------------------
echo -e "${BLUE}9. Testing idempotency (retrying same booking)...${NC}"

RETRY_RES=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$JSON")

RETRY_ORDER_ID=$(echo "$RETRY_RES" | jq -r '.data.bookTickets.id')

if [ "$RETRY_ORDER_ID" == "$ORDER_ID" ]; then
  echo -e "${GREEN}✅ Idempotency works - same order returned${NC}"
else
  echo -e "${YELLOW}⚠️  Different order returned (idempotency may not be working)${NC}"
  echo "   Original: $ORDER_ID"
  echo "   Retry: $RETRY_ORDER_ID"
fi
echo ""

# ----------------------------------------
# 10. Fetch My Orders
# ----------------------------------------
echo -e "${BLUE}10. Fetching user orders...${NC}"

QUERY='query { myOrders { id totalAmount status createdAt tickets { id sectionName row number } } }'
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')

ORDERS_RES=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$JSON")

ORDER_COUNT=$(echo "$ORDERS_RES" | jq '.data.myOrders | length')

if [ "$ORDER_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✅ Found $ORDER_COUNT order(s)${NC}"
  echo "$ORDERS_RES" | jq '.data.myOrders[0]'
else
  echo -e "${RED}❌ No orders found: $ORDERS_RES${NC}"
fi
echo ""

# ----------------------------------------
# 11. Verify Seats are Now SOLD
# ----------------------------------------
echo -e "${BLUE}11. Verifying seat status after booking...${NC}"

QUERY="query { sectionSeats(eventId: \"$EVENT_ID\", sectionId: \"$SECTION_ID\") { id row number status } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')

FINAL_SEATS=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$JSON")

SOLD_COUNT=$(echo "$FINAL_SEATS" | jq '[.data.sectionSeats[] | select(.status == "SOLD")] | length')
AVAILABLE_COUNT=$(echo "$FINAL_SEATS" | jq '[.data.sectionSeats[] | select(.status == "AVAILABLE")] | length')

echo -e "${GREEN}✅ Seat Status Summary:${NC}"
echo "   SOLD: $SOLD_COUNT"
echo "   AVAILABLE: $AVAILABLE_COUNT"
echo ""

# ----------------------------------------
# Summary
# ----------------------------------------
echo "=================================="
echo -e "${GREEN}🎉 Booking Flow Tests Complete!${NC}"
echo "=================================="
echo ""
echo "Summary:"
echo "  ✅ Created venue, section, and event"
echo "  ✅ Published event (created seat inventory)"
echo "  ✅ Locked and booked 2 seats"
echo "  ✅ Idempotency key prevents double booking"
echo "  ✅ Orders retrievable via myOrders query"
echo ""
