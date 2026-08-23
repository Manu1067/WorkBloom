package com.workbloom.wellness.serviceimpl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.repository.EmployeeRepository;
import com.workbloom.wellness.dto.MoodRequest;
import com.workbloom.wellness.dto.WellnessRequest;
import com.workbloom.wellness.dto.WellnessResponse;
import com.workbloom.wellness.entity.Moodlog;
import com.workbloom.wellness.entity.WellnessLog;
import com.workbloom.wellness.repository.MoodLogRepository;
import com.workbloom.wellness.repository.WellnessLogRepository;
import com.workbloom.wellness.service.WellnessService;

@Service
@Transactional
public class WellnessServiceImpl implements WellnessService {

    private final MoodLogRepository moodLogRepository;
    private final WellnessLogRepository wellnessLogRepository;
    private final EmployeeRepository employeeRepository;

    public WellnessServiceImpl(
            MoodLogRepository moodLogRepository,
            WellnessLogRepository wellnessLogRepository,
            EmployeeRepository employeeRepository) {

        this.moodLogRepository = moodLogRepository;
        this.wellnessLogRepository = wellnessLogRepository;
        this.employeeRepository = employeeRepository;
    }

    // =========================================================
    // RECORD MOOD
    // =========================================================

    @Override
    public WellnessResponse recordMood(
            Long employeeId,
            MoodRequest request) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        Moodlog moodLog = new Moodlog();

        moodLog.setEmployee(employee);
        moodLog.setMood(request.getMood());
        moodLog.setNote(request.getNote());
        moodLog.setRecordedAt(LocalDateTime.now());

        Moodlog savedMood =
                moodLogRepository.save(moodLog);

        return mapMoodToResponse(savedMood);
    }

    // =========================================================
    // RECORD WELLNESS
    // =========================================================

    @Override
    public WellnessResponse recordWellness(
            Long employeeId,
            WellnessRequest request) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        // =====================================================
        // CALCULATE STRESS SCORE
        // =====================================================

        double stressAverage = (
                request.getOverwhelmLevel()
                + request.getConcentrationDifficulty()
                + (6 - request.getRelaxationLevel())
        ) / 3.0;

        int stressLevel = (int) Math.round(stressAverage);


        // =====================================================
        // CALCULATE ENERGY SCORE
        // =====================================================

        double energyAverage = (
                request.getEnergyLevel()
                + request.getMotivationLevel()
                + request.getSleepQuality()
        ) / 3.0;

        int energyLevel = (int) Math.round(
                energyAverage * 2
        );

        // =====================================================
        // CREATE WELLNESS LOG
        // =====================================================

        WellnessLog wellnessLog = new WellnessLog();

        wellnessLog.setEmployee(employee);

        // =====================================================
        // SAVE QUESTIONNAIRE RESPONSES
        // =====================================================

        wellnessLog.setOverwhelmLevel(
                request.getOverwhelmLevel()
        );

        wellnessLog.setConcentrationDifficulty(
                request.getConcentrationDifficulty()
        );

        wellnessLog.setEnergyLevel(
                request.getEnergyLevel()
        );

        wellnessLog.setMotivationLevel(
                request.getMotivationLevel()
        );

        wellnessLog.setSleepQuality(
                request.getSleepQuality()
        );

        wellnessLog.setRelaxationLevel(
                request.getRelaxationLevel()
        );

        // =====================================================
        // SAVE CALCULATED VALUES
        // =====================================================

        wellnessLog.setStressLevel(
                stressLevel
        );

        /*
         * The current questionnaire collects sleep quality,
         * not actual hours slept.
         *
         * We keep using the existing sleepHours field for
         * compatibility with the current database structure.
         */
        wellnessLog.setSleepHours(
                request.getSleepQuality()
        );

        // =====================================================
        // SAVE NOTE AND TIMESTAMP
        // =====================================================

        wellnessLog.setNote(
                request.getNote()
        );

        wellnessLog.setRecordedAt(
                LocalDateTime.now()
        );

        // =====================================================
        // SAVE TO DATABASE
        // =====================================================

        WellnessLog savedWellness =
                wellnessLogRepository.save(
                        wellnessLog
                );

        return mapWellnessToResponse(
                savedWellness
        );
    }

    // =========================================================
    // GET EMPLOYEE WELLNESS HISTORY
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<WellnessResponse> getEmployeeWellness(
            Long employeeId) {

        return wellnessLogRepository
                .findByEmployee_Id(employeeId)
                .stream()
                .map(this::mapWellnessToResponse)
                .toList();
    }

    // =========================================================
    // GET EMPLOYEE MOOD HISTORY
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<WellnessResponse> getEmployeeMoodHistory(
            Long employeeId) {

        return moodLogRepository
                .findByEmployee_Id(employeeId)
                .stream()
                .map(this::mapMoodToResponse)
                .toList();
    }

    // =========================================================
    // MOOD → RESPONSE
    // =========================================================

    private WellnessResponse mapMoodToResponse(
            Moodlog moodLog) {

        WellnessResponse response =
                new WellnessResponse();

        Employee employee =
                moodLog.getEmployee();

        response.setId(
                moodLog.getId()
        );

        response.setEmployeeId(
                employee.getId()
        );

        response.setEmployeeName(
                employee.getFirstName()
                + " "
                + (employee.getLastName() == null
                    ? ""
                    : employee.getLastName())
        );

        response.setMood(
                moodLog.getMood()
        );

        response.setNote(
                moodLog.getNote()
        );

        response.setRecordedAt(
                moodLog.getRecordedAt()
        );

        return response;
    }

    // =========================================================
    // WELLNESS → RESPONSE
    // =========================================================

    private WellnessResponse mapWellnessToResponse(
            WellnessLog wellnessLog) {

        WellnessResponse response =
                new WellnessResponse();

        Employee employee =
                wellnessLog.getEmployee();

        response.setId(
                wellnessLog.getId()
        );

        response.setEmployeeId(
                employee.getId()
        );

        response.setEmployeeName(
                employee.getFirstName()
                + " "
                + (employee.getLastName() == null
                    ? ""
                    : employee.getLastName())
        );

        response.setStressLevel(
                wellnessLog.getStressLevel()
        );

        response.setEnergyLevel(
                wellnessLog.getEnergyLevel()
        );

        response.setSleepHours(
                wellnessLog.getSleepHours()
        );

        response.setNote(
                wellnessLog.getNote()
        );

        response.setRecordedAt(
                wellnessLog.getRecordedAt()
        );
        response.setOverwhelmLevel(
        wellnessLog.getOverwhelmLevel()
);

response.setConcentrationDifficulty(
        wellnessLog.getConcentrationDifficulty()
);

response.setEnergyLevel(
        wellnessLog.getEnergyLevel()
);

response.setMotivationLevel(
        wellnessLog.getMotivationLevel()
);

response.setSleepQuality(
        wellnessLog.getSleepQuality()
);

response.setRelaxationLevel(
        wellnessLog.getRelaxationLevel()
);

        return response;
    }
}