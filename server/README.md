# Django API Quick-Start

This Django project provides a simple API for storing and retrieving **ActivityEvent** records.

---

## 1. Setup

```bash
# (Recommended) Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Database migrations
Apply migrations before first use:

```bash
python manage.py migrate --no-input
```

---

## 2. Importing data from JSON Lines
A custom management command ingests records that match the `ActivityEvent` model schema. Each line in the file must be a valid JSON object.

```bash
python manage.py ingest_activityevents data/account_31crr1tcp2bmcv1fk6pcm0k6ag.jsonl
```

The command converts epoch-millisecond or ISO-8601 `timestamp` values to timezone-aware datetimes and bulk-inserts the data.

---

## 3. Running the development server

```bash
python manage.py runserver 8000
```

Django will be available at `http://localhost:8000/`.

---

## 4. API Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/` | Simple health/index page |
| GET | `/api/events/random/` | Return up to 10 random `ActivityEvent` objects for a customer/account |

### Query parameters (required)

* `customer_org_id` – the customer organisation ID
* `account_id` – the account identifier

If either parameter is missing, the endpoint returns **400 Bad Request**.

#### Example cURL request
```bash
curl "http://localhost:8000/api/events/random/?customer_org_id=org_4m6zyrass98vvtk3xh5kcwcmaf&account_id=account_31crr1tcp2bmcv1fk6pcm0k6ag"
```

Example response (truncated):
```json
[
  {
    "id": 17,
    "customer_org_id": "ORG123",
    "account_id": "ACC456",
    "touchpoint_id": "abcd1234",
    "timestamp": "2025-01-15T14:22:33.456Z",
    "activity": "Email sent to customer …",
    "channel": "EMAIL",
    "status": "SENT",
    "record_type": "COMMUNICATION",
    …
  }
]
```

---

Happy hacking! :)

