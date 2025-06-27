from django.db import models
import random
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

def generate_random_code():
    length = random.randint(10, 20) 
    return ''.join(str(random.randint(0,9)) for _ in range(length))

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
            raise ValueError("Email phải được cung cấp")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser phải có is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser phải có is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class Account(AbstractBaseUser, PermissionsMixin):
    account_id = models.BigAutoField(primary_key=True)
    role = models.ForeignKey("accounts.Role", on_delete=models.CASCADE)
    email = models.CharField(max_length=200, unique=True)
    password = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    phone_number = models.CharField(max_length=10, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login_at = models.DateTimeField(auto_now_add=True)
    avatar_url = models.ImageField(upload_to='avatars/', blank=True, null=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    is_locked = models.BooleanField(default=False)
    # reset_token = models.CharField(max_length=255, null=True, blank=True)
    is_verified_email = models.BooleanField(default=False)
    user_type = models.CharField(max_length=50)
    is_staff = models.BooleanField(default=False)

    objects = AccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone_number']

    class Meta:
        db_table = 'accounts'
        indexes = [
            models.Index(fields=['role_id']),
        ]
        managed = True
        verbose_name = 'Account'
        verbose_name_plural = 'Accounts'

    def __str__(self):
        return self.email

class Permisson(models.Model):
    permission_id = models.BigAutoField(primary_key=True)
    entity_name = models.CharField(max_length=255)
    field_name = models.CharField(max_length=100)
    read = models.CharField(max_length=1)
    insert = models.CharField(max_length=1)
    update = models.CharField(max_length=1)
    delete = models.CharField(max_length=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    account = models.OneToOneField("accounts.Account", on_delete=models.CASCADE)

    class Meta:
        db_table = 'permissions'
        indexes = [
            models.Index(fields=['role_id']),
            models.Index(fields=['account_id'])
        ]
        managed = True
        verbose_name = 'Permission'
        verbose_name_plural = 'Permissions'

    def __str__(self):
        return f"{self.role.role_name} - {self.entity_name} ({self.field_name})"