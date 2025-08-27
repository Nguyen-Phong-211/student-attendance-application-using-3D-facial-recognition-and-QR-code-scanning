```bash
CREATE OR REPLACE FUNCTION add_credit_limit_for_new_student()
RETURNS TRIGGER AS $$
DECLARE
    sem_id BIGINT;
BEGIN
    -- Lấy semester_id từ subject_registration_requests
    SELECT semester_id 
    INTO sem_id
    FROM subject_registration_requests
    WHERE student_id = NEW.student_id
    ORDER BY created_at DESC
    LIMIT 1;

    -- Thêm record vào credit_limits
    INSERT INTO credit_limits(student_id, semester_id, min_credits, max_credits, created_at)
    VALUES (NEW.student_id, sem_id, 15, 23, NOW());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

```bash
CREATE TRIGGER trg_add_credit_limit
AFTER INSERT ON students
FOR EACH ROW
EXECUTE FUNCTION add_credit_limit_for_new_student();
```

```bash
CREATE OR REPLACE FUNCTION handle_approved_registration()
RETURNS TRIGGER AS $$
DECLARE
    total_periods INT;
    allowed_periods NUMERIC;
    max_leave_days INT;
    subject_credits_theory INT;
    subject_credits_practice INT;
    subject_sessions_per_class INT;
BEGIN
    -- Chỉ xử lý khi status = 'approved'
    IF NEW.status = 'approved' THEN
        -- Lấy dữ liệu môn học
        SELECT credits_theory, credits_practice, sessions_per_class
        INTO subject_credits_theory, subject_credits_practice, subject_sessions_per_class
        FROM subjects
        WHERE subject_id = NEW.subject_id;

        -- Tính toán
        total_periods := subject_credits_theory * 15 + subject_credits_practice * 30;
        allowed_periods := total_periods * 0.3;
        max_leave_days := FLOOR(allowed_periods / subject_sessions_per_class);

        -- Insert sang students_subjects
        INSERT INTO students_subjects(student_id, subject_id, max_leave_days, created_at, updated_at)
        VALUES (NEW.student_id, NEW.subject_id, max_leave_days, NOW(), NOW());
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_subject_registration_approved
AFTER UPDATE ON subject_registration_requests
FOR EACH ROW
WHEN (NEW.status = 'approved')
EXECUTE FUNCTION handle_approved_registration();
```