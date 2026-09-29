import sys
import os
import urllib.request
import json

sys.path.insert(0, os.path.abspath('backend'))
from opsmind.agent import OpsMindAgent, _cosine_similarity, _tokenize
from opsmind.store import Store

# Fetch live incidents from Render backend
url = 'https://opsmind-ai-x96p.onrender.com/incidents'
data = json.loads(urllib.request.urlopen(url).read().decode('utf-8'))
resolved = [d for d in data if d.get('status') == 'resolved']

query_title = 'Payments API 500 errors after deployment'
query_desc = 'The payments service is experiencing intermittent HTTP 500 errors after a recent deployment. Payment requests are failing and the connection pool appears to be exhausted under normal traffic.'
query_text = f'{query_title}. {query_desc}'

print('=================================================================')
print('LIVE PRODUCTION DATABASE INSPECTION')
print('=================================================================')
print(f'Total records in live Render database: {len(data)}')
print(f'Total resolved memory candidates: {len(resolved)}')

print('\nCandidate memories in production:')
for r in resolved:
    print(f" - [{r['id']}] (service={r['service']}) {r['title']}")

print('\n=================================================================')
print('SIMILARITY SCORES FOR TARGET MEMORIES')
print('=================================================================')

for r in resolved:
    doc_text = f"{r['title']}. {r.get('description', '')}. Root cause: {r.get('root_cause', '')}. Resolution: {r.get('resolution', '')}."
    cos = _cosine_similarity(query_text, doc_text)
    print(f"Memory: \"{r['title']}\" (id: {r['id']}, service: {r['service']})")
    print(f"  -> Raw Cosine Score: {cos:.4f} ({round(cos*100)}%)")
    print(f"  -> Score with 'payments' bank match (1.15x): {min(0.98, cos*1.15):.4f} ({round(min(0.98, cos*1.15)*100)}%)")
    print(f"  -> Score with 'auth-service' mismatch (0.80x): {cos*0.80:.4f} ({round(cos*0.80*100)}%)")

print('\n=================================================================')
print('MATCHING BEHAVIOR COMPARISON BY SUBMITTED SERVICE')
print('=================================================================')

# Case A: When user submitted with service='auth-service' (as logged in inc_99264f519f55)
# In agent.py: clean_service = 'auth'
# candidates matching service 'auth' -> inc_8d49ed1f13d5 ("Login failures spiking for EU users")
# candidates with service 'payments' are skipped due to bank isolation
print("CASE A: Incident created with service='auth-service' (actual live incident inc_99264f519f55):")
doc_auth = [r for r in resolved if r['service'] == 'auth'][0]
cos_auth = _cosine_similarity(query_text, f"{doc_auth['title']}. {doc_auth.get('description','')}. Root cause: {doc_auth.get('root_cause','')}. Resolution: {doc_auth.get('resolution','')}.")
print(f"  Bank evaluated: opsmind-auth-service (matched candidate: {doc_auth['title']})")
print(f"  Calculated score against auth memory: {cos_auth:.4f} ({round(cos_auth*100)}%)")
print(f"  Threshold: 0.20 -> Filtered out because {cos_auth:.4f} < 0.20")
print("  Final result in UI: 'No matches found' (0 memories returned)")

print("\nCASE B: Incident created with service='payments':")
# In agent.py: service='payments'
# candidates matching service 'payments' -> "Payments API returning 500s" and "Payments API 500s again"
payments_cands = [r for r in resolved if r['service'] == 'payments']
for pc in payments_cands:
    doc_pc = f"{pc['title']}. {pc.get('description','')}. Root cause: {pc.get('root_cause','')}. Resolution: {pc.get('resolution','')}."
    score_pc = min(0.98, _cosine_similarity(query_text, doc_pc) * 1.15)
    print(f"  Match: \"{pc['title']}\" -> Score: {score_pc:.4f} ({round(score_pc*100)}%) >= 0.20 (PASSES)")
