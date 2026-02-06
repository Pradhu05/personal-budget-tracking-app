from django import forms
from .models import emp_details
class Activeemployee(forms.Form):
    employee=forms.ModelChoiceField(
        queryset=emp_details.objects.filter(is_active=True),
        label="select the employee"
    )
