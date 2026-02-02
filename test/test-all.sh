#!/bin/bash

# ============================================
# TicketForge - Run All Tests
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "============================================"
echo "   TicketForge API Test Suite"
echo "============================================"
echo ""
echo "Prerequisites:"
echo "  - API running on http://localhost:4000"
echo "  - Database seeded (pnpm --filter api db:seed)"
echo "  - Required tools: curl, jq"
echo ""

# Check if API is running
echo -e "${BLUE}Checking API availability...${NC}"
API_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/)

if [ "$API_CHECK" != "200" ]; then
  echo -e "${RED}❌ API not responding at http://localhost:4000${NC}"
  echo "   Please start the API first: pnpm run dev"
  exit 1
fi

echo -e "${GREEN}✅ API is running${NC}"
echo ""

# Track results
PASSED=0
FAILED=0

run_test() {
  local name=$1
  local script=$2
  
  echo "============================================"
  echo -e "${BLUE}Running: $name${NC}"
  echo "============================================"
  
  if bash "$SCRIPT_DIR/$script"; then
    ((PASSED++))
    echo -e "${GREEN}✅ $name PASSED${NC}"
  else
    ((FAILED++))
    echo -e "${RED}❌ $name FAILED${NC}"
  fi
  echo ""
}

# Run individual test suites
run_test "Authentication Tests" "test-auth.sh"
run_test "CRUD Tests" "test-crud.sh"
run_test "Seat Management Tests" "test-seats.sh"
run_test "Booking Flow Tests" "test-booking.sh"
run_test "Payment Integration Tests" "test-payment.sh"
run_test "Upload API Tests" "test-upload.sh"
run_test "Full Lifecycle Tests" "test-lifecycle.sh"
run_test "Concurrency Tests" "test-concurrency.sh"

# Summary
echo "============================================"
echo "   Test Results Summary"
echo "============================================"
echo ""
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Some tests failed${NC}"
  exit 1
fi
