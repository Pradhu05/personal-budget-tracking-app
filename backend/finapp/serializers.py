from rest_framework import serializers

from project.finapp.models import emp_details


class EmpDetailsSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='employee_category')

    class Meta:
        model = emp_details
        fields = ['employee', 'expenses_date', 'amount', 'category']
