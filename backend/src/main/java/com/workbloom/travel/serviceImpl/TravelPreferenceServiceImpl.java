package com.workbloom.travel.serviceImpl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.repository.EmployeeRepository;
import com.workbloom.travel.dto.TravelPreferenceRequest;
import com.workbloom.travel.dto.TravelPreferenceResponse;
import com.workbloom.travel.entity.TravelPreference;
import com.workbloom.travel.repository.TravelPreferenceRepository;
import com.workbloom.travel.service.TravelPreferenceService;

@Service
@Transactional
public class TravelPreferenceServiceImpl
        implements TravelPreferenceService {

    private final TravelPreferenceRepository travelPreferenceRepository;
    private final EmployeeRepository employeeRepository;

    public TravelPreferenceServiceImpl(
            TravelPreferenceRepository travelPreferenceRepository,
            EmployeeRepository employeeRepository) {

        this.travelPreferenceRepository = travelPreferenceRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public TravelPreferenceResponse saveOrUpdate(
            Long employeeId,
            TravelPreferenceRequest request) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        TravelPreference preference =
                travelPreferenceRepository
                        .findByEmployee_Id(employeeId)
                        .orElseGet(TravelPreference::new);

        preference.setEmployee(employee);
        preference.setEnvironment(request.getEnvironment());
        preference.setTripStyle(request.getTripStyle());
        preference.setBudget(request.getBudget());

        TravelPreference savedPreference =
                travelPreferenceRepository.save(preference);

        return TravelPreferenceResponse.fromEntity(savedPreference);
    }

    @Override
    @Transactional(readOnly = true)
    public TravelPreferenceResponse getByEmployeeId(Long employeeId) {

        TravelPreference preference =
                travelPreferenceRepository
                        .findByEmployee_Id(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Travel preferences not found"));

        return TravelPreferenceResponse.fromEntity(preference);
    }
}