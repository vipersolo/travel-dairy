from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone

class CustomUserManager(BaseUserManager):
    """
    Custom manager to handle user creation using email instead of a username.
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class BaseUser(AbstractBaseUser, PermissionsMixin):
    """
    The core authentication table. Strictly handles login credentials.
    Profile data is stored in separate role-based tables.
    """
    ROLE_CHOICES = (
        ('CITIZEN', 'Citizen'),
        ('MODERATOR', 'Moderator'),
        ('MANAGER', 'Manager'),
    )

    email = models.EmailField(unique=True, db_index=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CITIZEN')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False) # Required for Django Admin access
    date_joined = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.email} ({self.role})"


# ==========================================
# Separate Role Tables for Record-Keeping
# ==========================================



class Citizen(models.Model):
    """
    Table for standard travelers. Contains data specific to app users.
    """
    user = models.OneToOneField(BaseUser, on_delete=models.CASCADE, related_name='citizen_profile')
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    preferred_currency = models.CharField(max_length=3, default='USD')
    
    def __str__(self):
        return f"Citizen: {self.first_name} {self.last_name}"

class Admin(models.Model):
    """
    Table for moderators who manage platform content, reviews, and safety.
    """
    user = models.OneToOneField(BaseUser, on_delete=models.CASCADE, related_name='admin_profile')
    department = models.CharField(max_length=100, default='Content Moderation')
    clearance_level = models.IntegerField(default=1)
    
    def __str__(self):
        return f"Admin (Moderator): {self.user.email}"

class Manager(models.Model):
    """
    Table for business owners managing hotels, restaurants, or tour packages.
    """
    user = models.OneToOneField(BaseUser, on_delete=models.CASCADE, related_name='manager_profile')
    company_name = models.CharField(max_length=255)
    business_registration_number = models.CharField(max_length=100, unique=True)
    contact_phone = models.CharField(max_length=20)
    is_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Manager: {self.company_name}"
