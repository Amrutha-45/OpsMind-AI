.PHONY: test test-stdlib run-stdlib run-fastapi seed seed-file demo up down

# Run the single-command zero-dependency offline demo (boots Fake Hindsight + Backend + Dashboard).
demo:
	python3 run_local_demo.py

# Run the full test suite (no pip install required).
test:
	cd backend && python3 -m unittest discover -s tests -t . -v

# Run the zero-dependency backend (no pip install, no Docker).
# Requires HINDSIGHT_API_URL to point at a running Hindsight server
# (real or backend/tests/fake_hindsight_server.py).
run-stdlib:
	cd backend && python3 -m opsmind.server_stdlib

# Run the production FastAPI backend (requires: pip install -r backend/requirements.txt).
run-fastapi:
	uvicorn opsmind.api:app --app-dir backend --reload

# Seed the minimal two-incident remember/recall/apply/learn/improve narrative.
seed:
	python3 scripts/seed_demo.py

# Bulk-load the richer multi-service sample dataset.
seed-file:
	python3 scripts/seed_from_file.py

# Bring up Hindsight + backend + dashboard via Docker Compose.
up:
	docker compose up --build

down:
	docker compose down
