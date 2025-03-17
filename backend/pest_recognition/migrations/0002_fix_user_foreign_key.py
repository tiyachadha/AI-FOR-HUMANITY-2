from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('pest_recognition', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            # SQL to execute
            """
            -- Fix any orphaned records
            DELETE FROM pest_recognition_plantdiseasedetection 
            WHERE user_id NOT IN (SELECT id FROM users_user);
            """,
            # SQL to execute when rolling back
            """
            -- No rollback operation needed
            """,
        ),
    ]
