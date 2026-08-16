package com.workbloom.employee.dto;

public class UpdateEmployeeRequest {


    private String department;

    private String designation;

    private Double salary;

	public String getDepartment() {
		return department;
	}

	public void setDepartment(String department) {
		this.department = department;
	}

	public String getDesignation() {
		return designation;
	}

	public void setDesignation(String designation) {
		this.designation = designation;
	}

	public Double getSalary() {
		return salary;
	}

	public void setSalary(Double salary) {
		this.salary = salary;
	}

	public UpdateEmployeeRequest(String department, String designation, Double salary) {
		super();
		this.department = department;
		this.designation = designation;
		this.salary = salary;
	}
    

}
