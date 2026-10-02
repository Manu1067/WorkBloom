package com.workbloom.travel.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workbloom.travel.entity.TravelQuestionOption;

public interface TravelQuestionOptionRepository
        extends JpaRepository<TravelQuestionOption, Long> {

    List<TravelQuestionOption> findByIdIn(Collection<Long> ids);
}
