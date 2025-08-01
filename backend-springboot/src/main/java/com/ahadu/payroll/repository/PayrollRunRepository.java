package com.ahadu.payroll.repository;

import com.ahadu.payroll.model.PayrollRun;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PayrollRunRepository extends MongoRepository<PayrollRun, String> {}