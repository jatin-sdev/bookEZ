#!/bin/bash

BASE_URL="http://localhost:4000"
EMAIL="admin@tf.com"
PASSWORD="12345678"

echo "🧪 Starting Full Lifecycle Test (With Partitioning)..."

# 1. Login
echo "1. Logging In..."
LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")
TOKEN=$(echo $LOGIN_RES | jq -r '.accessToken')
echo "✅ Logged in"

# 2. Create Venue
echo "2. Creating Venue..."
QUERY='mutation { createVenue(input: { name: "Final Arena", location: "Tech City", capacity: 1000 }) { id } }'
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')
VENUE_RES=$(curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON")
VENUE_ID=$(echo $VENUE_RES | jq -r '.data.createVenue.id')

# 3. Add Section
echo "3. Adding Section..."
QUERY="mutation { addSection(venueId: \"$VENUE_ID\", input: { name: \"VIP\", capacity: 10, basePrice: 100, rows: 2, seatsPerRow: 5 }) { id } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')
SECTION_RES=$(curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON")
SECTION_ID=$(echo $SECTION_RES | jq -r '.data.addSection.id')

# 4. Create Event
echo "4. Creating Event..."
QUERY="mutation { createEvent(input: { name: \"Partitioned Concert\", venueId: \"$VENUE_ID\", date: \"2026-10-10T00:00:00Z\" }) { id } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')
EVENT_RES=$(curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON")
EVENT_ID=$(echo $EVENT_RES | jq -r '.data.createEvent.id')

# 5. Publish Event (Triggers Partition Creation)
echo "5. Publishing Event..."
QUERY="mutation { publishEvent(id: \"$EVENT_ID\") { status } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')
curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON" > /dev/null
echo "✅ Event Published & Partition Created"

# 6. Fetch Seat
echo "6. Fetching Seat ID..."
QUERY="query { sectionSeats(eventId: \"$EVENT_ID\", sectionId: \"$SECTION_ID\") { id status } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')
SEATS_RES=$(curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON")
SEAT_ID=$(echo $SEATS_RES | jq -r '.data.sectionSeats[0].id')
echo "✅ Seat ID: $SEAT_ID"

# 7. Lock Seat (New API)
echo "7. Locking Seat..."
QUERY="mutation { lockSeat(eventId: \"$EVENT_ID\", seatId: \"$SEAT_ID\") { status } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')
LOCK_RES=$(curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON")
STATUS=$(echo $LOCK_RES | jq -r '.data.lockSeat.status')

if [ "$STATUS" == "LOCKED" ]; then
  echo "✅ Seat Locked Successfully in Partition!"
else
  echo "❌ Lock Failed: $LOCK_RES"
  exit 1
fi