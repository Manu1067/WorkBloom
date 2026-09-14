package com.workbloom.employee.specification;

import org.springframework.data.jpa.domain.Specification;

import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.entity.EmployeeStatus;

public class EmployeeSpecification {

    public static Specification<Employee> filterEmployees(
            String search,
            String department,
            EmployeeStatus status) {

        return (root, query, criteriaBuilder) -> {

            var predicates =
                    criteriaBuilder.conjunction();

            // =========================
            // SEARCH
            // =========================

            if (search != null && !search.trim().isEmpty()) {

                String searchValue =
                        "%" + search.trim().toLowerCase() + "%";

                var searchPredicate =
                        criteriaBuilder.or(
                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("firstName")
                                        ),
                                        searchValue
                                ),

                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("lastName")
                                        ),
                                        searchValue
                                ),

                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("email")
                                        ),
                                        searchValue
                                ),

                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("employeeCode")
                                        ),
                                        searchValue
                                ),

                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("department")
                                        ),
                                        searchValue
                                ),

                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("designation")
                                        ),
                                        searchValue
                                )
                        );

                predicates =
                        criteriaBuilder.and(
                                predicates,
                                searchPredicate
                        );
            }

            // =========================
            // DEPARTMENT
            // =========================

            if (department != null
                    && !department.trim().isEmpty()) {

                predicates =
                        criteriaBuilder.and(
                                predicates,
                                criteriaBuilder.equal(
                                        criteriaBuilder.lower(
                                                root.get("department")
                                        ),
                                        department
                                                .trim()
                                                .toLowerCase()
                                )
                        );
            }

            // =========================
            // STATUS
            // =========================

            if (status != null) {

                predicates =
                        criteriaBuilder.and(
                                predicates,
                                criteriaBuilder.equal(
                                        root.get("status"),
                                        status
                                )
                        );
            }

            return predicates;
        };
    }
}