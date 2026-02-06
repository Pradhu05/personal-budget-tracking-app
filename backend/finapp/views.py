from http.client import responses
from django.db.models.expressions import result
from django.views.decorators.csrf import csrf_exempt
import json
from django.db.models import Sum
from datetime import datetime
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Employee, budget_details,emp_details
from django.utils.timezone import now
from django.db.models.functions import TruncMonth, TruncDate
from django.contrib.auth.hashers import check_password, make_password

@csrf_exempt
def auth_token(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        try:
            employee = Employee.objects.get(email=email)

            # Check hashed password
            if check_password(password, employee.password):
                return JsonResponse({
                    'message': 'Login successful',
                    'employee_id': employee.id,
                    'firstname': employee.firstname,
                    'lastname': employee.lastname,
                    'email': employee.email
                })
            else:
                return JsonResponse({'error': 'Invalid password'}, status=401)

        except Employee.DoesNotExist:
            return JsonResponse({'error': 'Employee not found'}, status=404)
@csrf_exempt
def get_employee_by_id(request, emp_id):
    if request.method=='GET':
        try:
            emp = Employee.objects.get(id=emp_id)
            employee_data = {
                'id': emp.id,
                 'firstname': emp.firstname,
                  'lastname': emp.lastname,
                  'email': emp.email,
                   'age': emp.age,
                    'dateofbirth': emp.dateofbirth.strftime('%Y-%m-%d') if emp.dateofbirth else None,
                      'dateofjoining': emp.dateofjoining.strftime('%Y-%m-%d') if emp.dateofjoining else None,
            }
            return JsonResponse(employee_data, status=200)
        except Employee.DoesNotExist:
            return JsonResponse({'error': 'Employee not found'}, status=404)

# Create Employee
@csrf_exempt
def create_employee(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            emp = Employee.objects.create(
                firstname=data['firstname'],
                lastname=data['lastname'],
                age=data['age'],
                dateofbirth=datetime.strptime(data['dateofbirth'], "%Y-%m-%d").date(),
                dateofjoining=datetime.strptime(data['dateofjoining'], "%Y-%m-%d").date(),
                category=data['category'],
                description=data['description'],
                email = data['email'],
                password = data['password']
            )
            return JsonResponse({'message': 'Employee created', 'id': emp.id})
        except KeyError as e:
            return JsonResponse({'error': f'Missing key: {str(e)}'}, status=400)
    return JsonResponse({'message': 'Invalid request method'}, status=405)
# Read Employee(s)
@csrf_exempt
def read_employee(request, emp_id=None):
    if request.method == 'GET':
        if emp_id:
            emp = Employee.objects.filter(id=emp_id).first()
            if emp:
                emp_data = {
                    'id': emp.id,
                    'firstname': emp.firstname,
                    'lastname': emp.lastname,
                    'age': emp.age,
                    'dateofbirth': emp.dateofbirth,
                    'dateofjoining': emp.dateofjoining,
                    'category': emp.category,
                    'description': emp.description
                }
                return JsonResponse(emp_data, safe=False)
            return JsonResponse({'message': 'Employee not found'}, status=404)
        employees = list(Employee.objects.values(
            'id', 'firstname', 'lastname', 'age', 'dateofbirth', 'dateofjoining', 'category', 'description'))
        return JsonResponse(employees, safe=False)
    return JsonResponse({'message': 'Invalid request method'}, status=405)
# Update Employee
@csrf_exempt
def update_employee(request, emp_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            emp = Employee.objects.filter(id=emp_id).first()
            if emp:
                emp.firstname = data.get('firstname', emp.firstname)
                emp.lastname = data.get('lastname', emp.lastname)
                emp.age = data.get('age', emp.age)
                emp.dateofbirth = datetime.strptime(data['dateofbirth'], "%Y-%m-%d").date()
                emp.dateofjoining = datetime.strptime(data['dateofjoining'], "%Y-%m-%d").date()
                emp.category = data.get('category', emp.category)
                emp.description = data.get('description', emp.description)
                emp.email=data.get('email',emp.email)
                emp.password=data.get('password',emp.password)
                emp.save()
                return JsonResponse({'message': 'Employee updated'})
            return JsonResponse({'message': 'Employee not found'}, status=404)
        except KeyError as e:
            return JsonResponse({'error': f'Missing key: {str(e)}'}, status=400)
    return JsonResponse({'message': 'Invalid request method'}, status=405)

# Delete Employee
@csrf_exempt
def delete_employee(request, emp_id):
    if request.method == 'DELETE':
        emp = Employee.objects.filter(id=emp_id).first()
        if emp:
            emp.delete()
            return JsonResponse({'message': 'Employee deleted'})
        return JsonResponse({'message': 'Employee not found'}, status=404)
    return JsonResponse({'message': 'Invalid request method'}, status=405)

@csrf_exempt
def emp_details_view(request):
        if request.method == 'POST':
            try:
                data = json.loads(request.body)
                employee_id = data.get('employee_id')
                category_id = data.get('category_id')
                status_key = data.get('status_key')
                amount = data.get('amount')
                expenses_date = data.get('expenses_date')
                if not all([employee_id, category_id, status_key, amount, expenses_date]):
                    return JsonResponse({"error": "Missing required fields."}, status=400)
                employee = Employee.objects.get(id=employee_id)
                employee_name = f"{employee.firstname} {employee.lastname}"
                category_name = Utils.get_category_name_by_id(category_id)
                emp_dt = emp_details.objects.create(
                    employee=employee_name,
                    employee_category=category_name,
                    amount=amount,
                    status_key=status_key,
                    created_by=employee_name,
                    expenses_date=datetime.strptime(expenses_date, "%Y-%m-%d").date()
                )
                emp_dt.save()
                return JsonResponse({"message": "Employee detail created successfully!"}, status=201)
            except Employee.DoesNotExist:
                return JsonResponse({"error": "Employee not found."}, status=400)
            except Exception as e:
                return JsonResponse({"error": str(e)}, status=400)
        return JsonResponse({"error": "Invalid HTTP method."}, status=405)

# Get Employees
def emp_view(request):
    if request.method == 'GET':
        employee = Employee.objects.filter(status_key=1)
        data = list(employee.values('id', 'firstname', 'lastname', 'status_key'))
        return JsonResponse({'employees': data})
    return JsonResponse({'message': 'Invalid request method'}, status=405)

def data_view(request):
    if request.method == 'GET':
        employee = Employee.objects.filter(status_key=1)
        data = list(employee.values('id', 'dateofbirth','dateofjoining'))
        return JsonResponse({'employees': data})
    return JsonResponse({'message': 'Invalid request method'}, status=405)


from django.http import JsonResponse
from .utils.utile import categories_details, Utils
@csrf_exempt
def categories_dropdown(request):
    if request.method=='GET':
        categories = categories_details()
    return JsonResponse(categories, safe=False)

#view_all_employeee
@csrf_exempt
def employee_list(request):
    if request.method == 'GET':
        employees = Employee.objects.all().values('id', 'firstname', 'lastname')
        return JsonResponse(list(employees), safe=False)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

#create_budget
@csrf_exempt
def create_budget(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            employee_id = data.get('employee_id')
            category_id = data.get('category_id')
            status_key = data.get('status_key')
            amount = data.get('amount')
            employee = Employee.objects.get(id=employee_id)
            employee_name = f"{employee.firstname} {employee.lastname}"
            category_name = Utils.get_category_name_by_id(category_id)
            budget = budget_details(
                employee=employee_name,
                employee_category=category_name,
                status_key=status_key,
                budget_amount=amount,
                created_by=employee_name,
            )
            budget.save()
            return JsonResponse({"message": "Budget created successfully!"}, status=201)
        except Employee.DoesNotExist:
            return JsonResponse({"error": "Employee not found."}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid HTTP method."}, status=405)

#view_budget
@csrf_exempt
def get_budget(request):
    if request.method == 'GET':
        try:
            budgets = budget_details.objects.all()
            budget_list = []
            for b in budgets:
                budget_list.append({
                    "id": b.id,
                    "employee": b.employee,
                    "employee_category": b.employee_category,
                    "status_key": b.status_key,
                    "budget_amount": b.budget_amount,
                    "created_by": b.created_by,
                })
            return JsonResponse(budget_list, safe=False, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
@api_view(['GET'])
def get_dashboard_stats(request):
    total_employees = Employee.objects.count()
    total_budgets = budget_details.objects.count()
    total_amount = budget_details.objects.aggregate(total=Sum('budget_amount'))['total'] or 0
    return Response({
        'total_employees': total_employees,
        'total_budgets': total_budgets,
        'total_amount': total_amount
    })

@csrf_exempt
def add_expense(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            employee_id = data.get('employee_id')
            category = data.get('category')
            amount = data.get('amount')
            expenses_date = data.get('expenses_date')
            if not all([employee_id, category, amount, expenses_date]):
                return JsonResponse({'error': 'Missing fields'}, status=400)
            employee = Employee.objects.get(id=employee_id)
            employee_name = f"{employee.firstname} {employee.lastname}"
            emp_details.objects.create(
                employee=employee_name,
                employee_category=category,
                amount=amount,
                created_by=employee_name,
                expenses_date=datetime.strptime(expenses_date, '%Y-%m-%d').date(),
            )
            return JsonResponse({
                'employee': employee_name,
                'category': category,
                'amount': amount,
                'expenses_date': expenses_date,
                'message': 'Expense added successfully'
            }, status=201)
        except Employee.DoesNotExist:
            return JsonResponse({'error': 'Employee not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
def get_employee_expenses(request, emp_id):
    if request.method == 'GET':
        try:
            employee = Employee.objects.get(id=emp_id)
            employee_name = f"{employee.firstname} {employee.lastname}"
        except Employee.DoesNotExist:
            return JsonResponse({'error': 'Employee not found.'}, status=404)
        expenses = emp_details.objects.filter(employee=employee_name, is_active=True).order_by('-expenses_date')
        data = []
        for expense in expenses:
            data.append({
                'employee': employee_name,
                'id': expense.id,
                'category': expense.employee_category,
                'amount': expense.amount,
                'expenses_date': expense.expenses_date.strftime('%Y-%m-%d'),
            })
        return JsonResponse(data, safe=False)

@csrf_exempt
def update_expense(request, expense_id):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            amount = data.get('amount')
            category = data.get('category')
            expenses_date = data.get('expenses_date')
            expense = emp_details.objects.get(id=expense_id)
            if amount:
                expense.amount = amount
            if category:
                expense.employee_category = category
            if expenses_date:
                expense.expenses_date = datetime.strptime(expenses_date, '%Y-%m-%d').date()
            expense.save()
            return JsonResponse({'message': 'Expense updated successfully'}, status=200)
        except emp_details.DoesNotExist:
            return JsonResponse({'error': 'Expense not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid method'}, status=405)

@api_view(['DELETE'])
def delete_expense(request, id):
    if request.method == 'DELETE':
        try:
            expense = emp_details.objects.get(id=id)
            expense.delete()
            return Response({'message': 'Expense deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
        except emp_details.DoesNotExist:
            return Response({'error': 'Expense not found.'}, status=status.HTTP_404_NOT_FOUND)

@csrf_exempt
def category_budget_by_id(request, category_id):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)
    user = request.GET.get('user', None)
    if not user:
        return JsonResponse({'error': 'User parameter is required'}, status=400)
    category_name = Utils.get_category_name_by_id(category_id)
    if not category_name:
        return JsonResponse({'error': 'Invalid category ID'}, status=400)
    income_qs = budget_details.objects.filter(
        employee_category__iexact=category_name,
        status_key=1,
        is_active=True,
        created_by=user
    )
    expense_qs = budget_details.objects.filter(
        employee_category__iexact=category_name,
        status_key=2,
        is_active=True,
        created_by=user
    )
    income = sum(entry.budget_amount for entry in income_qs)
    expense = sum(entry.budget_amount for entry in expense_qs)
    balance = income - expense
    data = {
        'id': category_id,
        'category': category_name,
        'income': income,
        'expense': expense,
        'balance': balance,
        'user': user
    }
    return JsonResponse(data)

@csrf_exempt
def expense_or_income(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            employee = data.get('employee')
            category_id = data.get('employee_category')
            category_name = Utils.get_category_name_by_id(int(category_id))
            amount = data.get('amount')
            status_key = data.get('status_key')
            expenses_date = data.get('expenses_date')
            if not all([employee, category_name, amount, status_key]):
                return JsonResponse({'error': 'Missing required fields'}, status=400)
            emp_entry = emp_details.objects.create(
                employee=employee,
                employee_category=category_name,
                amount=amount,
                status_key=status_key,
                expenses_date=expenses_date or now().date(),
                is_active=True
            )
            return JsonResponse({'message': 'Entry created successfully', 'id': emp_entry.id})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Only POST method allowed'}, status=405)

@csrf_exempt
def category_summary(request, employee_id, category_id):
    if request.method == 'GET':
        category_name = Utils.get_category_name_by_id(int(category_id))
        if not category_name:
            return JsonResponse({'error': 'Invalid category ID'}, status=400)
        try:
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            return JsonResponse({'error': 'Employee not found'}, status=404)
        employee_name = f"{employee.firstname.strip()} {employee.lastname.strip()}"
        income = emp_details.objects.filter(
            employee=employee_name,
            employee_category=category_name,
            status_key=1,
            is_active=True
        ).aggregate(total=Sum('amount'))['total'] or 0
        expenses = emp_details.objects.filter(
            employee=employee_name,
            employee_category=category_name,
            status_key=2,
            is_active=True
        ).aggregate(total=Sum('amount'))['total'] or 0
        try:
            budget_obj = budget_details.objects.get(
                employee=employee_name,
                employee_category=category_name,
                is_active=True
            )
            budget = budget_obj.budget_amount or 0
        except budget_details.DoesNotExist:
            budget = 0
        balance = income - expenses
        return JsonResponse({
            'employee': employee_name,
            'category': category_name,
            'budget': float(budget),
            'income': float(income),
            'expenses': float(expenses),
            'balance': float(balance)
        })

@csrf_exempt
@api_view(['GET'])
def food_summary(request, emp_id):
    if request.method == 'GET':
        try:
            employee = Employee.objects.get(id=emp_id)
            full_name = f"{employee.firstname} {employee.lastname}"
            category_name = Utils.Food_val  # 'Food'
            entries = emp_details.objects.filter(
                employee=full_name,
                employee_category=category_name,
                status_key=1,
                is_active=1
            )
            total_income = sum(entry.amount for entry in entries)
            data = {
                "employee_id": employee.id,
                "category": category_name,
                "total_income": total_income,
                "entries": [
                    {
                        "name": full_name,
                        "amount": entry.amount,
                        "date": entry.expenses_date,
                    }
                    for entry in entries
                ]
            }
            return Response(data, status=status.HTTP_200_OK)
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": "Server error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['GET'])
def food_expense(request, emp_id):
    if request.method == 'GET':
        try:
            employee = Employee.objects.get(id=emp_id)
            full_name = f"{employee.firstname} {employee.lastname}"
            category_name = Utils.Food_val  # 'Food'
            entries = emp_details.objects.filter(
                employee=full_name,
                employee_category=category_name,
                status_key=2,
                is_active=1
            )
            total_expense = sum(entry.amount for entry in entries)
            data = {
                "employee_id": employee.id,
                "category": category_name,
                "total_expense": total_expense,
                "entries": [
                    {
                        "name": full_name,
                        "amount": entry.amount,
                        "date": entry.expenses_date,
                    }
                    for entry in entries
                ]
            }
            return Response(data, status=status.HTTP_200_OK)
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": "Server error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['GET'])
def expense_all(request, emp_id,category_id):
    if request.method == 'GET':
        try:
            employee = Employee.objects.get(id=emp_id)
            full_name = f"{employee.firstname} {employee.lastname}"
            category_map = {
                1: Utils.Food_val,
                2: Utils.Jewellery_val,
                3: Utils.Travel_val,
                4:Utils.Shopping_val,
            }
            category_name = category_map.get(int(category_id))
            if not category_name:
                return Response({"error": "Invalid category ID"}, status=status.HTTP_400_BAD_REQUEST)
            entries = emp_details.objects.filter(
                employee=full_name,
                employee_category=category_name,
                status_key=2,
                is_active=1
            )
            total_expense = sum(entry.amount for entry in entries)
            data = {
                "employee_id": employee.id,
                "category": category_name,
                "total_expense": total_expense,
                "entries": [
                    {
                        "name": full_name,
                        "amount": entry.amount,
                        "date": entry.expenses_date,
                    }
                    for entry in entries
                ]
            }
            return Response(data, status=status.HTTP_200_OK)
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": "Server error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['GET'])
def income_all(request, emp_id,category_id):
    if request.method == 'GET':
        try:
            employee = Employee.objects.get(id=emp_id)
            full_name = f"{employee.firstname} {employee.lastname}"
            category_map = {
                1: Utils.Food_val,
                2: Utils.Jewellery_val,
                4: Utils.Shopping_val,
                3: Utils.Travel_val,
            }
            category_name = category_map.get(int(category_id))
            if not category_name:
                return Response({"error": "Invalid category ID"}, status=status.HTTP_400_BAD_REQUEST)
            entries = emp_details.objects.filter(
                employee=full_name,
                employee_category=category_name,
                status_key=1,
                is_active=1
            )
            total_income = sum(entry.amount for entry in entries)
            data = {
                "employee_id": employee.id,
                "category": category_name,
                "total_income": total_income,
                "entries": [
                    {
                        "name": full_name,
                        "amount": entry.amount,
                        "date": entry.expenses_date,
                    }
                    for entry in entries
                ]
            }
            return Response(data, status=status.HTTP_200_OK)
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": "Server error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
def income_expense_combined(request, emp_id, category_id):
    if request.method == 'GET':
        try:
            employee = Employee.objects.get(id=emp_id)
            full_name = f"{employee.firstname} {employee.lastname}"
            category_map = {
                1: Utils.Food_val,
                2: Utils.Jewellery_val,
                3: Utils.Travel_val,
                4: Utils.Shopping_val,
            }
            category_name = category_map.get(int(category_id))
            if not category_name:
                return Response({"error": "Invalid category ID"}, status=status.HTTP_400_BAD_REQUEST)
            expense_entries = emp_details.objects.filter(
                employee=full_name,employee_category=category_name, status_key=2,is_active=1 )
            income_entries = emp_details.objects.filter(
                employee=full_name,employee_category=category_name,status_key=1,is_active=1
            )
            combined_entries = [
                {
                    "employee": full_name,"amount": entry.amount, "expenses_date": entry.expenses_date,"category":category_name,
                    "type": "Expense"
                }
                for entry in expense_entries
            ] + [ {
                    "employee": full_name,"amount": entry.amount,"expenses_date": entry.expenses_date,"category": category_name,
                    "type": "Income"
                }for entry in income_entries
            ]
            combined_entries.sort(key=lambda x: x["expenses_date"], reverse=True)
            data = {
                "employee_id": employee.id,
                "category": category_name,
                "entries": combined_entries
            }
            return Response(data, status=status.HTTP_200_OK)
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": "Server error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
def total_summary(request, emp_id):
    if request.method == 'GET':
        try:
            employee = Employee.objects.get(id=emp_id)
            emp_name = f"{employee.firstname} {employee.lastname}"
            income = emp_details.objects.filter(employee=emp_name, status_key=1).aggregate(Sum('amount'))['amount__sum'] or 0
            expenses = emp_details.objects.filter(employee=emp_name, status_key=2).aggregate(Sum('amount'))['amount__sum'] or 0
            budget = budget_details.objects.filter(employee=emp_name).aggregate(Sum('budget_amount'))['budget_amount__sum'] or 0
            balance = income - expenses
            return JsonResponse({
                'employee_id': employee.id,
                'employee_name': emp_name,
                'income': income,
                'expenses': expenses,
                'balance': balance,
                'budget': budget
            })
        except Employee.DoesNotExist:
            return JsonResponse({'error': 'Employee not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
# pie-chart
@csrf_exempt
def expense_category(request, emp_id):
    if request.method == 'GET':
        try:
            emp = Employee.objects.get(id=emp_id)
            emp_name = emp.firstname + ' ' + emp.lastname
            expenses = emp_details.objects.filter(status_key=2, employee=emp_name)
            category_expenses = expenses.values('employee_category').annotate(total=Sum('amount'))
            expense_data = {item['employee_category']: item['total'] for item in category_expenses}
            return JsonResponse({'expenses': expense_data})
        except Employee.DoesNotExist:
            return JsonResponse({'error': 'Employee not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

#allemployee-pie chart
@csrf_exempt
def all_expense_categories(request):
    if request.method == 'GET':
        try:
            expenses = emp_details.objects.filter(status_key=2)
            category_expenses = expenses.values('employee_category') \
                                        .annotate(total=Sum('amount')) \
                                        .order_by('employee_category')
            expense_data = {
                item['employee_category']: float(item['total'])
                for item in category_expenses
            }

            return JsonResponse({'expenses': expense_data})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['GET'])
def income_vs_expense(request, emp_id):
    if request.method == 'GET':
        category_data = []
        for category_id, category_name in Utils.type_arr.items():
            emp = Employee.objects.get(id=emp_id)
            emp_name = emp.firstname + ' ' + emp.lastname
            income = emp_details.objects.filter(
                employee_category=category_name,
                status_key=1,
                employee=emp_name
            ).aggregate(Sum('amount'))['amount__sum'] or 0
            expense = emp_details.objects.filter(
                employee_category=category_name,
                status_key=2,
                employee=emp_name
            ).aggregate(Sum('amount'))['amount__sum'] or 0
            category_data.append({
                "category": category_name,
                "income": income,
                "expense": expense
            })
        return Response({"data": category_data})

#line graph
@csrf_exempt
@api_view(['GET'])
def monthly_category(request, emp_id, category_id):
    if request.method == 'GET':
        try:
            employee = Employee.objects.get(id=emp_id)
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found"}, status=404)
        full_name = f"{employee.firstname} {employee.lastname}"
        category_map = {
                1: Utils.Food_val,
                2: Utils.Jewellery_val,
                3: Utils.Shopping_val,
                4: Utils.Travel_val,
        }
        category_name = category_map.get(category_id)
        if not category_name:
            return Response({"error": "Invalid category ID"}, status=400)
        income_data = emp_details.objects.filter(
            employee=full_name,
                employee_category=category_name,
                status_key=1
        ).values('expenses_date', 'amount')
        expense_data = emp_details.objects.filter(
            employee=full_name,
                employee_category=category_name,
                status_key=2
        ).values('expenses_date', 'amount')
        return Response({
            "employee_id": emp_id,
            "employee": full_name,
            "category": category_name,
            "income": list(income_data),
            "expense": list(expense_data),
        })
#total_income or expenses_all_category
@csrf_exempt
@api_view(['GET'])
def total_income_expense(request):
    if request.method=='GET':
        income_data = (
        emp_details.objects
        .filter(status_key=1)  # 1 = income
        .annotate(date=TruncDate('expenses_date'))
        .values('date')
        .annotate(total=Sum('amount'))
        .order_by('date')
    )
    expense_data = (
        emp_details.objects
        .filter(status_key=2)
        .annotate(date=TruncDate('expenses_date'))
        .values('date')
        .annotate(total=Sum('amount'))
        .order_by('date')
    )
    return Response({
        'income': list(income_data),
        'expense': list(expense_data)
    })

#budget_alarm
def check_budget_alarm(emp_name, category):
    try:
        budget_obj = budget_details.objects.get(employee=emp_name, employee_category=category)
        budget_amount = budget_obj.budget_amount
        threshold = 0.8
    except budget_details.DoesNotExist:
        return {"alarm": False}
    total_expense = emp_details.objects.filter(
        employee=emp_name, employee_category=category, status_key=2
    ).aggregate(total=Sum('amount'))['total'] or 0
    if total_expense >= threshold * budget_amount:
        percent = (total_expense / budget_amount) * 100
        return {
            "alarm": True,
            "message": f"Warning: You've used {total_expense:.2f} of {budget_amount:.2f} "
                       f"({percent:.1f}%) of your budget for '{category}'."
        }
    return {"alarm": False}
@api_view(['GET'])
def category_summary_alarm(request, emp_id, category_id):
    if request.method == 'GET':
        try:
            emp = Employee.objects.get(id=emp_id)
            emp_name =  f"{emp.firstname} {emp.lastname}"
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found"}, status=404)
        category = Utils.get_category_name_by_id(category_id)
        if not category:
            return Response({"error": "Invalid category ID"}, status=400)
        total_income = emp_details.objects.filter(
            employee=emp_name, employee_category=category, status_key=1
        ).aggregate(total=Sum('amount'))['total'] or 0
        total_expense = emp_details.objects.filter(
            employee=emp_name, employee_category=category, status_key=2
        ).aggregate(total=Sum('amount'))['total'] or 0
        balance = total_income - total_expense
        alarm_data = check_budget_alarm(emp_name, category)
        return Response({
            "employee": emp_name,
            "category": category,
            "income": total_income,
            "expense": total_expense,
            "balance": balance,
            "alarm": alarm_data["alarm"],
            "alarm_message": alarm_data.get("message", "")
        })
    else:
        return Response({"error": "Method not allowed"}, status=405)

@csrf_exempt
@api_view(['POST'])
def reset_password(request):
    email = request.data.get('email')
    new_password = request.data.get('new_password')
    if not email or not new_password:
        return Response({'error': 'Email and new password are required'}, status=400)
    try:
        user = Employee.objects.get(email=email)
        user.password = new_password
        user.save()
        return Response({'message': 'Password reset successful'})
    except Employee.DoesNotExist:
        return Response({'error': 'Email not found'}, status=404)




