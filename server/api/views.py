from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.db.models import QuerySet

# Create your views here.

def index(request):
    return HttpResponse("Hello, world! This is the API root.")

from .models import ActivityEvent


# -----------------------------------------------------------------------------
# API Endpoints
# -----------------------------------------------------------------------------

def random_activity_events(request):
    """Return up to 10 random ActivityEvent records for the given customer.

    Query parameters:
    - customer_org_id (required)
    - account_id (required)
    """
    customer_org_id = request.GET.get("customer_org_id")
    account_id = request.GET.get("account_id")

    if not customer_org_id or not account_id:
        return JsonResponse(
            {
                "error": "Both 'customer_org_id' and 'account_id' query parameters are required."
            },
            status=400,
        )

    events_qs: QuerySet = (
        ActivityEvent.objects.filter(
            customer_org_id=customer_org_id, account_id=account_id
        )
        .order_by("?")[:10]
    )

    # Use .values() to get dictionaries of all model fields.
    events = list(events_qs.values())
    return JsonResponse(events, safe=False)
