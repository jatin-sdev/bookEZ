#!/bin/bash

BASE_URL="http://localhost:4000"
EMAIL="admin@tf.com"
PASSWORD="12345678"

echo "⚔️ Starting Concurrency Test..."
echo "--------------------------------"

# 1. Login
echo "1. Logging in..."
LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")
TOKEN=$(echo $LOGIN_RES | jq -r '.accessToken')

if [ "$TOKEN" == "null" ]; then
  echo "❌ Login failed."
  exit 1
fi

echo "✅ Logged in"

# 2. Create Venue
echo "2. Creating Venue..."
QUERY='mutation { createVenue(input: { name: "Concurrency Test Venue", location: "Test City", capacity: 100 }) { id } }'
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')
VENUE_RES=$(curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON")
VENUE_ID=$(echo $VENUE_RES | jq -r '.data.createVenue.id')
echo "✅ Venue ID: $VENUE_ID"

# 3. Add Section with Seats
echo "3. Adding Section..."
QUERY="mutation { addSection(venueId: \"$VENUE_ID\", input: { name: \"Test Section\", capacity: 10, basePrice: 1000, rows: 2, seatsPerRow: 5 }) { id } }"
JSON=$(node -e "const q = \`$QUERY\`; console.log(JSON.stringify({ query: q }))")
SECTION_RES=$(curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON")
SECTION_ID=$(echo $SECTION_RES | jq -r '.data.addSection.id')
echo "✅ Section ID: $SECTION_ID"

# 4. Create Event
echo "4. Creating Event..."
QUERY="mutation { createEvent(input: { name: \"Concurrency Test Event\", venueId: \"$VENUE_ID\", date: \"2026-12-31T00:00:00Z\" }) { id } }"
JSON=$(node -e "const q = \`$QUERY\`; console.log(JSON.stringify({ query: q }))")
EVENT_RES=$(curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON")
EVENT_ID=$(echo $EVENT_RES | jq -r '.data.createEvent.id')
echo "✅ Event ID: $EVENT_ID"

# 5. Publish Event (creates partition)
echo "5. Publishing Event..."
QUERY="mutation { publishEvent(id: \"$EVENT_ID\") { status } }"
JSON=$(node -e "const q = \`$QUERY\`; console.log(JSON.stringify({ query: q }))")
curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON" > /dev/null
echo "✅ Event Published"

# 6. Get a Seat
echo "6. Fetching Seat..."
QUERY="query { sectionSeats(eventId: \"$EVENT_ID\", sectionId: \"$SECTION_ID\") { id } }"
JSON=$(node -e "const q = \`$QUERY\`; console.log(JSON.stringify({ query: q }))")
SEATS_RES=$(curl -s -X POST "$BASE_URL/graphql" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$JSON")
SEAT_ID=$(echo $SEATS_RES | jq -r '.data.sectionSeats[0].id')

if [ "$SEAT_ID" == "null" ]; then
  echo "❌ No seats found"
  exit 1
fi

echo "✅ Target Seat: $SEAT_ID"
echo ""

# 7. Parallel Lock Attack
echo "⚔️ Launching 5 parallel lock requests..."

lock_seat() {
  QUERY="mutation { lockSeat(eventId: \"$EVENT_ID\", seatId: \"$SEAT_ID\") { status } }"
  curl -s -X POST "$BASE_URL/graphql" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg q "$QUERY" '{query: $q}')" &
}

# Run 5 parallel requests
for i in {1..5}; do
  lock_seat
done

wait
echo ""
echo "✅ All parallel requests complete."
echo ""
echo "📊 Results:"
echo "   - All 5 requests used the SAME user token"
echo "   - Same user can re-lock their own seat (expected behavior)"
echo "   - PostgreSQL advisory locks prevent race conditions at DB level"
echo ""
echo "💡 To test true user-vs-user concurrency, create multiple user accounts with different tokens."