import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByName'
})
export class FilterByNamePipe implements PipeTransform {
transform(employees: any[], searchText: string): any[] {
    if (!employees) return [];
    if (!searchText) return employees;

    searchText = searchText.toLowerCase();
    return employees.filter(emp =>
      (`${emp.firstname} ${emp.lastname}`.toLowerCase().includes(searchText))
    );
  }
}