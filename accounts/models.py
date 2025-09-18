from django.db import models
import random
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import uuid

# Better: use UUID or hash to reduce collision probability
def generate_random_code():
    return str(uuid.uuid4())[:20]

class Role(models.Model):
    role_id = models.BigAutoField(primary_key=True)
    role_name = models.CharField(max_length=50, unique=True)
    role_code = models.CharField(max_length=50, unique=True, default=generate_random_code)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'roles'
        managed = True
        verbose_name = 'Role'
        verbose_name_plural = 'Roles'

    def __str__(self):
        return self.role_name

class AccountManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if not extra_fields.get('is_staff'):
            raise ValueError('Superuser must have is_staff=True.')
        if not extra_fields.get('is_superuser'):
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class Account(AbstractBaseUser, PermissionsMixin):
    account_id = models.BigAutoField(primary_key=True)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    email = models.CharField(max_length=200, unique=True)
    password = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    phone_number = models.CharField(max_length=10, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login_at = models.DateTimeField(auto_now=True)  # Updated on each login
    avatar_url = models.ImageField(upload_to='avatars/', blank=True, null=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    is_locked = models.BooleanField(default=False)
    is_verified_email = models.BooleanField(default=False)
    user_type = models.CharField(max_length=50)  # Consider using choices here
    is_staff = models.BooleanField(default=False)

    objects = AccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone_number']

    class Meta:
        db_table = 'accounts'
        indexes = [
            models.Index(fields=['role']),
        ]
        managed = True
        verbose_name = 'Account'
        verbose_name_plural = 'Accounts'

    def __str__(self):
        return self.email

# Fixed name: Permission (not Permisson)
class Permission(models.Model):
    permission_id = models.BigAutoField(primary_key=True)
    entity_name = models.CharField(max_length=255)
    field_name = models.CharField(max_length=100)
    read = models.BooleanField(default=False)
    insert = models.BooleanField(default=False)
    update = models.BooleanField(default=False)
    delete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    role = models.ForeignKey(Role, on_delete=models.CASCADE, null=True, blank=True)
    account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        db_table = 'permissions'
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['account'])
        ]
        managed = True
        verbose_name = 'Permission'
        verbose_name_plural = 'Permissions'

    def __str__(self):
        return f"{self.entity_name}.{self.field_name}"
