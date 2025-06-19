from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.db.models import QuerySet, Count
from django.db.models.functions import TruncDate
from django.core.paginator import Paginator
from datetime import datetime, timedelta
import json

# Create your views here.

def index(request):
    return HttpResponse("Hello, world! This is the API root.")

from .models import ActivityEvent, Person


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

def random_persons(request):
    """Return up to 5 random Person records for the given customer.

    Query parameters:
    - customer_org_id (required)
    """

    customer_org_id = request.GET.get("customer_org_id")

    if not customer_org_id:
        return JsonResponse(
            {"error": "'customer_org_id' query parameter is required."},
            status=400,
        )

    persons_qs: QuerySet = (
        Person.objects.filter(customer_org_id=customer_org_id).order_by("?")[:5]
    )

    persons = list(persons_qs.values())
    return JsonResponse(persons, safe=False)

def activity_events(request):
    """Return paginated activity events for the given customer and account.

    Query parameters:
    - customer_org_id (required)
    - account_id (required)
    - page (optional, default=1)
    - page_size (optional, default=50)
    - date (optional, format: YYYY-MM-DD, for navigation to specific date)
    """
    customer_org_id = request.GET.get("customer_org_id")
    account_id = request.GET.get("account_id")
    page = int(request.GET.get("page", 1))
    page_size = int(request.GET.get("page_size", 50))
    target_date = request.GET.get("date")

    if not customer_org_id or not account_id:
        return JsonResponse(
            {
                "error": "Both 'customer_org_id' and 'account_id' query parameters are required."
            },
            status=400,
        )

    events_qs = ActivityEvent.objects.filter(
        customer_org_id=customer_org_id,
        account_id=account_id
    ).order_by('-timestamp')

    # If navigating to specific date, find the page containing that date
    if target_date:
        try:
            target_datetime = datetime.strptime(target_date, '%Y-%m-%d')
            # Find events on or before the target date
            events_before = events_qs.filter(timestamp__date__lte=target_datetime).count()
            page = max(1, (events_before // page_size) + 1)
        except ValueError:
            pass  # Invalid date format, ignore

    paginator = Paginator(events_qs, page_size)
    page_obj = paginator.get_page(page)

    # Get person data for involved people
    all_person_ids = set()
    for event in page_obj:
        if event.people and isinstance(event.people, list):
            for person in event.people:
                if isinstance(person, dict) and 'id' in person:
                    all_person_ids.add(person['id'])

    persons_dict = {}
    if all_person_ids:
        persons = Person.objects.filter(
            customer_org_id=customer_org_id,
            id__in=all_person_ids
        )
        persons_dict = {p.id: {
            'first_name': p.first_name,
            'last_name': p.last_name,
            'email_address': p.email_address,
            'job_title': p.job_title
        } for p in persons}

    # Serialize events
    events_data = []
    for event in page_obj:
        event_data = {
            'id': event.id,
            'timestamp': event.timestamp.isoformat(),
            'activity': event.activity,
            'channel': event.channel,
            'status': event.status,
            'direction': event.direction,
            'people': event.people,
            'involved_team_ids': event.involved_team_ids,
        }
        events_data.append(event_data)

    return JsonResponse({
        'events': events_data,
        'persons': persons_dict,
        'pagination': {
            'current_page': page_obj.number,
            'total_pages': paginator.num_pages,
            'total_count': paginator.count,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
        }
    })

def activity_timeline_data(request):
    """Return timeline data for the minimap chart.

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

    # Get daily counts of inbound activities
    daily_counts = (
        ActivityEvent.objects
        .filter(
            customer_org_id=customer_org_id,
            account_id=account_id,
            direction="IN"
        )
        .annotate(date=TruncDate('timestamp'))
        .values('date')
        .annotate(count=Count('id'))
        .order_by('date')
    )

    # Get first touchpoint per person
    first_touchpoints = []
    events_with_people = ActivityEvent.objects.filter(
        customer_org_id=customer_org_id,
        account_id=account_id
    ).exclude(people__isnull=True).exclude(people=[]).order_by('timestamp')

    seen_people = set()
    for event in events_with_people:
        if event.people and isinstance(event.people, list):
            for person in event.people:
                if isinstance(person, dict) and 'id' in person:
                    person_id = person['id']
                    if person_id not in seen_people:
                        seen_people.add(person_id)
                        first_touchpoints.append({
                            'person_id': person_id,
                            'timestamp': event.timestamp.isoformat(),
                            'date': event.timestamp.date().isoformat()
                        })

    # Convert daily counts to list
    timeline_data = [
        {
            'date': item['date'].isoformat(),
            'count': item['count']
        }
        for item in daily_counts
    ]

    return JsonResponse({
        'timeline_data': timeline_data,
        'first_touchpoints': first_touchpoints
    })
