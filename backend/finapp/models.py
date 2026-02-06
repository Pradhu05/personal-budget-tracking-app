from django.db import models
from django.utils.timezone import now
from django.contrib.auth.hashers import make_password

class Employee(models.Model):
    firstname = models.CharField(max_length=50)
    lastname = models.CharField(max_length=50)
    age = models.IntegerField()
    dateofbirth = models.DateField()
    dateofjoining = models.DateField()
    category = models.CharField(max_length=100)
    description = models.TextField()
    status_key = models.IntegerField(default=1)
    email = models.EmailField(unique=True,null=True)
    password = models.CharField(max_length=128,null=True)
    def save(self, *args, **kwargs):
        if not self.pk or not self.password.startswith('pbkdf2_'):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)


class emp_details(models.Model):
    employee=models.CharField(max_length=20,null=True)
    employee_category=models.CharField(max_length=100,null=True)
    amount=models.IntegerField(null=True)
    status_key=models.IntegerField(default=1)
    created_by=models.CharField(max_length=200,null=True)
    created_date=models.DateField(default=now)
    expenses_date = models.DateField(null=True, blank=True)
    is_active=models.BooleanField(default=True)

class budget_details(models.Model):
    employee = models.CharField(max_length=100,null=True)
    employee_category = models.CharField(max_length=100,null=True)
    budget_amount=models.IntegerField(null=True)
    status_key = models.IntegerField(default=1)
    created_by = models.CharField(max_length=50,null=True)
    created_date = models.DateField(default=now)
    is_active = models.BooleanField(default=True)
