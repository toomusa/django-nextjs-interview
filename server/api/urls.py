from django.urls import path
from . import views

app_name = "api"

urlpatterns = [
    # placeholder root view
    path("", views.index, name="index"),
    path("api/events/random/", views.random_activity_events, name="random-activity-events"),
    path("api/people/random/", views.random_persons, name="random-people"),
] 