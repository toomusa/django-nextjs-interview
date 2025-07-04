# Generated by Django 5.2 on 2025-05-17 23:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="activityevent",
            name="activity",
            field=models.TextField(null=True),
        ),
        migrations.AlterField(
            model_name="activityevent",
            name="activity_grouping_id",
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name="activityevent",
            name="customer_org_id",
            field=models.CharField(max_length=60),
        ),
        migrations.AlterField(
            model_name="activityevent",
            name="source_record_id",
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name="activityevent",
            name="source_record_type",
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AlterUniqueTogether(
            name="activityevent",
            unique_together={("customer_org_id", "account_id", "touchpoint_id")},
        ),
    ]
