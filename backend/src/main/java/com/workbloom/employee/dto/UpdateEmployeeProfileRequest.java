package com.workbloom.employee.dto;


public class UpdateEmployeeProfileRequest {
	
    private String phone;
    
    private String profileImage;

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getProfileImage() {
		return profileImage;
	}

	public void setProfileImage(String profileImage) {
		this.profileImage = profileImage;
	}

	public UpdateEmployeeProfileRequest(Long id, String firstName, String lastName, String phone, String profileImage) {
		super();
		this.phone = phone;
		this.profileImage = profileImage;
	}
    


}
