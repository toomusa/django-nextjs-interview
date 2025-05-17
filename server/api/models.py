from django.db import models

# Create your models here.

class ActivityEvent(models.Model):
    """Represents a single customer-facing activity/touchpoint event."""

    # Core identifiers
    customer_org_id = models.CharField(max_length=60)
    account_id = models.CharField(max_length=50)
    touchpoint_id = models.CharField(max_length=64)

    # Timing
    # The raw JSON source stores Unix epoch milliseconds.  
    # Persist as a timezone-aware DateTime for easier querying in Django.
    timestamp = models.DateTimeField()

    # Descriptive data
    activity = models.TextField(null=True)
    channel = models.CharField(max_length=100)
    status = models.CharField(max_length=100)
    record_type = models.CharField(max_length=100)

    # Source system information
    source_record_type = models.CharField(max_length=100, null=True)
    source_record_id = models.CharField(max_length=255, null=True)

    # Campaign linkage (optional)
    campaign_id = models.CharField(max_length=255, null=True, blank=True)
    campaign_name = models.CharField(max_length=255, null=True, blank=True)

    # Direction (IN / OUT, etc.)
    direction = models.CharField(max_length=10)

    # Complex structures – leverage JSONField for flexibility
    people = models.JSONField()
    involved_team_ids = models.JSONField()
    related_opportunity_ids = models.JSONField()

    # Grouping
    activity_grouping_id = models.CharField(max_length=255, null=True)

    # Meta / dunder helpers
    class Meta:
        ordering = ["-timestamp"]
        unique_together = (
            "customer_org_id",
            "account_id",
            "touchpoint_id",
        )

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.channel} | {self.activity[:50]}... @ {self.timestamp.isoformat()}"
