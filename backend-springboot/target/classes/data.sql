-- File: backend-springboot/src/main/resources/data.sql

INSERT INTO users (id, username, password, role) VALUES
(1, 'admin', '$2a$10$dXJ3u4TWuvZkqY0LUpavUOkM3okBvhRRxeuVGpHzMD1GmUO6l3XzO', 'USER');
-- password is 'admin123' hashed with BCrypt

INSERT INTO payrolls (id, employee_name, department, basic_salary, bonus, deductions, payment_date) VALUES
(1, 'John Doe', 'Finance', 15000.00, 2000.00, 1500.00, '2024-07-01'),
(2, 'Jane Smith', 'HR', 14000.00, 1500.00, 1200.00, '2024-07-01');
