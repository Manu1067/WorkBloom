package com.workbloom.wellness.serviceimpl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.repository.EmployeeRepository;
import com.workbloom.wellness.dto.TravelPreferenceRequest;
import com.workbloom.wellness.entity.TravelPreference;
import com.workbloom.wellness.repository.TravelPreferenceRepository;
import com.workbloom.wellness.service.TravelPreferenceService;

@Service
@Transactional
public class TravelPreferenceServiceImpl
        implements TravelPreferenceService {

    private final TravelPreferenceRepository
            travelPreferenceRepository;

    private final EmployeeRepository employeeRepository;

    public TravelPreferenceServiceImpl(
            TravelPreferenceRepository travelPreferenceRepository,
            EmployeeRepository employeeRepository) {

        this.travelPreferenceRepository =
                travelPreferenceRepository;

        this.employeeRepository =
                employeeRepository;
    }

    // =====================================================
    // SAVE OR UPDATE TRAVEL PREFERENCES
    // =====================================================

    @Override
    public TravelPreference saveOrUpdate(
            Long employeeId,
            TravelPreferenceRequest request) {

        // Find employee
        Employee employee =
                employeeRepository.findById(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found"));

        // Check whether preferences already exist
        TravelPreference preference =
                travelPreferenceRepository
                        .findByEmployee_Id(employeeId)
                        .orElseGet(TravelPreference::new);

        // Set employee
        preference.setEmployee(employee);

        // Set preferences
        preference.setEnvironment(
                request.getEnvironment()
        );

        preference.setTripStyle(
                request.getTripStyle()
        );

        preference.setBudget(
                request.getBudget()
        );

        // Save
        return travelPreferenceRepository.save(preference);
    }

    // =====================================================
    // GET EMPLOYEE TRAVEL PREFERENCES
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public TravelPreference getByEmployeeId(
            Long employeeId) {

        return travelPreferenceRepository
                .findByEmployee_Id(employeeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Travel preferences not found"));
    }
}