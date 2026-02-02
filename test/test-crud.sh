#!/bin/bash

# ============================================
# TicketForge CRUD Tests
# ============================================


BASE_URL="http://localhost:4000"
EMAIL="admin@tf.com"
PASSWORD="12345678"

echo ""
echo "🧪 TicketForge CRUD Tests"
echo "========================="
echo ""

# 1. Login
echo "1. Logging in as Admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed. Is the database seeded?"
  exit 1
fi

echo "✅ Logged in"
echo ""

# 2. Create Venue
echo "2. Creating Venue..."
QUERY='mutation { createVenue(input: { name: "CRUD Test Venue", location: "New York", capacity: 500 }) { id name } }'
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')

VENUE_RES=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$JSON")

VENUE_ID=$(echo "$VENUE_RES" | jq -r '.data.createVenue.id')

if [ "$VENUE_ID" == "null" ] || [ -z "$VENUE_ID" ]; then
  echo "❌ Create Venue Failed: $VENUE_RES"
  exit 1
fi

echo "✅ Venue created: $VENUE_ID"
echo ""

# 3. Query Venues
echo "3. Querying all venues..."
QUERY='query { venues { id name location } }'
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')

VENUES_RES=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$JSON")

VENUE_COUNT=$(echo "$VENUES_RES" | jq '.data.venues | length')
echo "✅ Found $VENUE_COUNT venue(s)"
echo ""

# 4. Add Section
echo "4. Adding section..."
QUERY="mutation { addSection(venueId: \"$VENUE_ID\", input: { name: \"Orchestra\", basePrice: 15000, rows: 5, seatsPerRow: 10 }) { id name } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')

SECTION_RES=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$JSON")

SECTION_ID=$(echo "$SECTION_RES" | jq -r '.data.addSection.id')

if [ "$SECTION_ID" == "null" ] || [ -z "$SECTION_ID" ]; then
  echo "❌ Add Section Failed: $SECTION_RES"
  exit 1
fi

echo "✅ Section created: $SECTION_ID"
echo ""

# 5. Create Event
echo "5. Creating Event..."
QUERY="mutation { createEvent(input: { name: \"CRUD Test Concert\", venueId: \"$VENUE_ID\", date: \"2026-12-31T20:00:00Z\" }) { id name status } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')

EVENT_RES=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$JSON")

EVENT_ID=$(echo "$EVENT_RES" | jq -r '.data.createEvent.id')

if [ "$EVENT_ID" == "null" ] || [ -z "$EVENT_ID" ]; then
  echo "❌ Create Event Failed: $EVENT_RES"
  exit 1
fi

echo "✅ Event created: $EVENT_ID"
echo ""

# 6. Publish Event
echo "6. Publishing Event..."
QUERY="mutation { publishEvent(id: \"$EVENT_ID\") { id status } }"
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')

PUBLISH_RES=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$JSON")

PUBLISH_STATUS=$(echo "$PUBLISH_RES" | jq -r '.data.publishEvent.status')

if [ "$PUBLISH_STATUS" == "PUBLISHED" ]; then
  echo "✅ Event published"
else
  echo "❌ Publish failed: $PUBLISH_RES"
  exit 1
fi
echo ""

# 7. Query Events
echo "7. Querying all events..."
QUERY='query { events { id name status venue { name } } }'
JSON=$(jq -n --arg q "$QUERY" '{query: $q}')

EVENTS_RES=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$JSON")

EVENT_COUNT=$(echo "$EVENTS_RES" | jq '.data.events | length')
echo "✅ Found $EVENT_COUNT event(s)"
echo ""

echo "========================="
echo "🎉 CRUD Tests Complete!"
echo "========================="
