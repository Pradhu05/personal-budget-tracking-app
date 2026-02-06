from tkinter.font import names

from django.urls import path
from . import views

urlpatterns = [
    path('auth_token/', views.auth_token, name='create_employee'),
    path('employee/<int:emp_id>/', views.get_employee_by_id,name='emp_id'),
    path('create_employee/', views.create_employee, name='create_employee'),
    path('api/read_employee/', views.read_employee,name='read_employee'),
    path('read_employee/<int:emp_id>/', views.read_employee),
    path('update_employee/<int:emp_id>/', views.update_employee,name='update_employee'),
    path('delete_employee/<int:emp_id>/', views.delete_employee,name='delete_employee'),
    path('details/', views.emp_details_view, name='emp_details'),
    path('view/', views.emp_view, name='emp_view'),
    path('api/date/',views.data_view,name='date_view'),
    path('categories/',views.categories_dropdown,name='categories_dropdown'),
    path('employee/', views.employee_list,name='employee_list'),
    path('budget/', views.create_budget, name='budget'),
    path('budget_view/',views.get_budget,name='budget_view'),
    path('api/category/id/<int:category_id>/budget/', views.category_budget_by_id,name='category_budget'),
    path('api/dashboard/',views.get_dashboard_stats,name='dashboard'),
    path('api/expense/add/', views.add_expense, name='add_expense'),
    path('api/expenses/<int:emp_id>/', views.get_employee_expenses, name='get_employee_expenses'),
    path('expense/update/<int:expense_id>/', views.update_expense, name='update_expense'),
    path('expenses/delete/<int:id>/', views.delete_expense, name='delete_expense'),
    path('income/',views.expense_or_income,name='dashboard'),
    path('category/summary/<int:employee_id>/<int:category_id>/', views.category_summary,name='summary'),
    path('api/food/<int:emp_id>/', views.food_summary, name='food-income-summary'),
    path('expenses/<int:emp_id>/', views.food_expense, name='food-expenses-summary'),
    path('api/exp/<int:emp_id>/<int:category_id>/', views.expense_all, name='expenses'),
    path('api/inc/<int:emp_id>/<int:category_id>/', views.income_all, name='income'),
    path('api/combine/<int:emp_id>/<int:category_id>/', views.income_expense_combined, name='income_expense_combined'),
    path('report/summary/<int:emp_id>/', views.total_summary,name='total'),
    path('api/chart/<int:emp_id>/', views.expense_category,name='expenses_chart'),
    path('api/chart/expense/', views.all_expense_categories,name='all_expenses_chart'),
    path('income/expense/<int:emp_id>/', views.income_vs_expense,name='income_chart'),
    path('api/monthly/category/<int:emp_id>/<int:category_id>/',views.monthly_category,name='monthly'),
    path('total/income/expenses/',views.total_income_expense,name='total_income'),
    path('alarm/summary/<int:emp_id>/<int:category_id>/', views.category_summary_alarm,name='alarm'),
    path('reset/password/', views.reset_password, name='reset_password'),
]

