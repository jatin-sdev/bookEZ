#!/bin/bash

BASE_URL="http://localhost:4000"
# Use Seeded Admin Credentials
EMAIL="admin@tf.com"
PASSWORD="12345678"

echo "🪑 Starting Seat Tests..."
echo "--------------------------------"

# 1. Login (As Admin)
echo "1. Logging In as Admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

# Extract Token using jq
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed."
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Got Admin Token: ${TOKEN:0:20}..."
echo ""

# 2. Create Venue
echo "2. Creating Venue..."
QUERY='mutation { createVenue(input: { name: "Seat Test Venue", location: "Test City", capacity: 100 }) { id name } }'
JSON_PAYLOAD=$(node -e "console.log(JSON.stringify({ query: '$QUERY' }))")

VENUE_RESPONSE=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$JSON_PAYLOAD")

VENUE_ID=$(echo "$VENUE_RESPONSE" | jq -r '.data.createVenue.id')

if [ "$VENUE_ID" == "null" ] || [ -z "$VENUE_ID" ]; then
   echo "❌ Create Venue Failed: $VENUE_RESPONSE"
   exit 1
fi

echo "✅ Created Venue ID: $VENUE_ID"
echo ""

# 3. Add Section with Seats
echo "3. Adding Section with Seats (Rows: 5, Seats/Row: 4)..."
QUERY="mutation { addSection(venueId: \"$VENUE_ID\", input: { name: \"Orchestra\", capacity: 20, basePrice: 5000, rows: 5, seatsPerRow: 4 }) { id name } }"
JSON_PAYLOAD=$(node -e "const q = \`$QUERY\`; console.log(JSON.stringify({ query: q }))")

SECTION_RESPONSE=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$JSON_PAYLOAD")

SECTION_ID=$(echo "$SECTION_RESPONSE" | jq -r '.data.addSection.id')

if [ "$SECTION_ID" == "null" ] || [ -z "$SECTION_ID" ]; then
   echo "❌ Add Section Failed: $SECTION_RESPONSE"
   exit 1
fi

echo "✅ Created Section ID: $SECTION_ID"
echo ""

# 4. Create Event (Required for partitioned seat inventory)
echo "4. Creating Event..."
QUERY="mutation { createEvent(input: { name: \"Seat Test Event\", venueId: \"$VENUE_ID\", date: \"2026-12-31T00:00:00Z\" }) { id name } }"
JSON_PAYLOAD=$(node -e "const q = \`$QUERY\`; console.log(JSON.stringify({ query: q }))")

EVENT_RESPONSE=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$JSON_PAYLOAD")

EVENT_ID=$(echo "$EVENT_RESPONSE" | jq -r '.data.createEvent.id')

if [ "$EVENT_ID" == "null" ] || [ -z "$EVENT_ID" ]; then
   echo "❌ Create Event Failed: $EVENT_RESPONSE"
   exit 1
fi

echo "✅ Created Event ID: $EVENT_ID"
echo ""

# 5. Publish Event (Creates partition and populates inventory)
echo "5. Publishing Event..."
QUERY="mutation { publishEvent(id: \"$EVENT_ID\") { id status } }"
JSON_PAYLOAD=$(node -e "const q = \`$QUERY\`; console.log(JSON.stringify({ query: q }))")

PUBLISH_RESPONSE=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$JSON_PAYLOAD")

PUBLISH_STATUS=$(echo "$PUBLISH_RESPONSE" | jq -r '.data.publishEvent.status')

if [ "$PUBLISH_STATUS" != "PUBLISHED" ]; then
   echo "❌ Publish Event Failed: $PUBLISH_RESPONSE"
   exit 1
fi

echo "✅ Event Published (Partition Created)"
echo ""

# 6. Get Seats (Now requires eventId)
echo "6. Fetching Seats for Section..."
QUERY="query { sectionSeats(eventId: \"$EVENT_ID\", sectionId: \"$SECTION_ID\") { id row number status } }"
JSON_PAYLOAD=$(node -e "const q = \`$QUERY\`; console.log(JSON.stringify({ query: q }))")

SEATS_RESPONSE=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$JSON_PAYLOAD")

# Get first seat ID
SEAT_ID=$(echo "$SEATS_RESPONSE" | jq -r '.data.sectionSeats[0].id')

if [ "$SEAT_ID" == "null" ] || [ -z "$SEAT_ID" ]; then
   echo "❌ No seats found (or fetch failed): $SEATS_RESPONSE"
   exit 1
fi

echo "✅ Found Seat ID: $SEAT_ID"
echo ""

# 7. Lock Seat (Now requires eventId)
echo "7. Locking Seat..."
QUERY="mutation { lockSeat(eventId: \"$EVENT_ID\", seatId: \"$SEAT_ID\") { id status } }"
JSON_PAYLOAD=$(node -e "const q = \`$QUERY\`; console.log(JSON.stringify({ query: q }))")

LOCK_RESPONSE=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$JSON_PAYLOAD")

LOCK_STATUS=$(echo "$LOCK_RESPONSE" | jq -r '.data.lockSeat.status')

if [ "$LOCK_STATUS" != "LOCKED" ]; then
    echo "❌ Failed to lock seat: $LOCK_RESPONSE"
    exit 1
fi

echo "✅ Seat Locked Successfully! Status: $LOCK_STATUS"
echo ""

# 8. Unlock Seat (Now requires eventId)
echo "8. Unlocking Seat..."
QUERY="mutation { unlockSeat(eventId: \"$EVENT_ID\", seatId: \"$SEAT_ID\") }"
JSON_PAYLOAD=$(node -e "const q = \`$QUERY\`; console.log(JSON.stringify({ query: q }))")

UNLOCK_RESPONSE=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$JSON_PAYLOAD")

UNLOCK_RESULT=$(echo "$UNLOCK_RESPONSE" | jq -r '.data.unlockSeat')

if [ "$UNLOCK_RESULT" != "true" ]; then
    echo "❌ Failed to unlock seat: $UNLOCK_RESPONSE"
    exit 1
fi

echo "✅ Seat Unlocked Successfully!"
echo ""

echo "🎉 Seat Test Complete!"
