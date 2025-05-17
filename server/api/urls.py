from django.urls import path
from . import views

app_name = "api"

urlpatterns = [
    # placeholder root view
    path("", views.index, name="index"),
] 