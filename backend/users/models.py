from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    farm_location = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)  # Add phone field
    is_premium = models.BooleanField(default=False)  # Add is_premium field

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',  # Change related_name to avoid conflict
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions_set',  # Change related_name to avoid conflict
        blank=True
    )

    def __str__(self):
        return self.username

    