#!/bin/bash
echo "🧪 Testing LIF3 AI Features..."

echo "1. Testing semantic search for transactions..."
curl -s -X POST http://localhost:8000/api/v1/collections/lif3_financial_transactions/query \
  -H "Content-Type: application/json" \
  -d '{"query_texts": ["consulting income"], "n_results": 2}' | jq '.'

echo -e "\n2. Testing business intelligence search..."
curl -s -X POST http://localhost:8000/api/v1/collections/lif3_business_intelligence/query \
  -H "Content-Type: application/json" \
  -d '{"query_texts": ["market demand analysis"], "n_results": 1}' | jq '.'

echo -e "\n✅ AI features test complete!"
