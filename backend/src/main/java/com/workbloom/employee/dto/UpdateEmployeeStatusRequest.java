package com.workbloom.employee.dto;

import java.time.LocalDate;

import com.workbloom.employee.entity.EmployeeStatus;

public class UpdateEmployeeStatusRequest {
	 private Long id;

	    private String firstName;

	    private String lastName;

	    private String email;

	    private String phone;

	    private String department;

	    private String designation;

	    private LocalDate joiningDate;

	    private Double salary;
        private EmployeeStatus status;
	  
	    public UpdateEmployeeStatusRequest() {
	    }

	   public UpdateEmployeeStatusRequest(
        Long id,
        String employeeCode,
        String firstName,
        String lastName,
        String email,
        String phone,
        String department,
        String designation,
        LocalDate joiningDate,
        Double salary,
        String profileImage,
        EmployeeStatus status) {

    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
    this.department = department;
    this.designation = designation;
    this.joiningDate = joiningDate;
    this.salary = salary;
    this.status = status;
}

		public Long getId() {
			return id;
		}

		public void setId(Long id) {
			this.id = id;
		}

		public String getFirstName() {
			return firstName;
		}

		public void setFirstName(String firstName) {
			this.firstName = firstName;
		}

		public String getLastName() {
			return lastName;
		}

		public void setLastName(String lastName) {
			this.lastName = lastName;
		}

		public String getEmail() {
			return email;
		}

		public void setEmail(String email) {
			this.email = email;
		}

		public String getPhone() {
			return phone;
		}

		public void setPhone(String phone) {
			this.phone = phone;
		}

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

		public LocalDate getJoiningDate() {
			return joiningDate;
		}

		public void setJoiningDate(LocalDate joiningDate) {
			this.joiningDate = joiningDate;
		}

		public Double getSalary() {
			return salary;
		}

		public void setSalary(Double salary) {
			this.salary = salary;
		}

		public EmployeeStatus getStatus() {
			return status;
		}

		public void setStatus(EmployeeStatus status) {
			this.status = status;
		}


}
