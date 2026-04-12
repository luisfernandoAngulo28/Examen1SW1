package com.workflow.engine.service;

import com.workflow.engine.model.Department;
import com.workflow.engine.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public List<Department> findAll() {
        return departmentRepository.findAll();
    }

    public Department create(Department department) {
        return departmentRepository.save(department);
    }

    public Department findById(String id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Departamento no encontrado"));
    }

    public void delete(String id) {
        departmentRepository.deleteById(id);
    }
}
