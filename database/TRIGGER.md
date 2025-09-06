```bash
CREATE OR REPLACE FUNCTION add_credit_limit_for_new_student()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO credit_limits(student_id, semester_id, min_credits, max_credits, created_at)
    VALUES (NEW.student_id, NULL, 15, 23, NOW());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_add_credit_limit
AFTER INSERT ON students
FOR EACH ROW
EXECUTE FUNCTION add_credit_limit_for_new_student();
```

```bash
CREATE OR REPLACE FUNCTION update_credit_limit_with_semester()
RETURNS TRIGGER AS $$
BEGIN
    -- nếu chưa có dòng credit_limits cho student này thì chèn mới
    IF NOT EXISTS (
        SELECT 1 FROM credit_limits WHERE student_id = NEW.student_id
    ) THEN
        INSERT INTO credit_limits(student_id, semester_id, min_credits, max_credits, created_at)
        VALUES (NEW.student_id, NEW.semester_id, 15, 23, NOW());
    ELSE
        -- nếu đã có nhưng đang NULL semester_id thì cập nhật
        UPDATE credit_limits
        SET semester_id = NEW.semester_id
        WHERE student_id = NEW.student_id
          AND semester_id IS NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
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
        SELECT theoretical_credits, practical_credits, sessions_per_class
        INTO subject_credits_theory, subject_credits_practice, subject_sessions_per_class
        FROM subjects
        WHERE subject_id = NEW.subject_id;

        -- Tính toán số tiết và số buổi nghỉ tối đa
        total_periods := subject_credits_theory * 15 + subject_credits_practice * 30;
        allowed_periods := total_periods * 0.3;
        max_leave_days := FLOOR(allowed_periods / subject_sessions_per_class);

        -- Insert sang student_subjects
        INSERT INTO student_subjects(
            student_id,
            subject_id,
            max_leave_days,
            semester_id,
            registration_status,
            subject_registration_request_id,
            created_at
        )
        VALUES (
            NEW.student_id,
            NEW.subject_id,
            max_leave_days,
            NEW.semester_id,
            'auto',
            NEW.subject_registration_request_id,
            NOW()
        );
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
### ADD DATA INTO class_students FROM subject_classes
```bash
CREATE OR REPLACE FUNCTION add_to_class_students()
RETURNS TRIGGER AS $$
BEGIN
    -- Chỉ thực hiện khi status được update thành 'approved'
    IF NEW.status = 'approved' THEN
        INSERT INTO class_students(
            class_id,
            student_id,
            is_active,
            created_at,
            registration_status,
            registered_by_account_id
        )
        SELECT
            sc.class_id,                 -- Lấy class_id từ subject_classes
            NEW.student_id,
            '1' AS is_active,            -- Mặc định active
            NOW() AS created_at,
            'auto' AS registration_status,
            NEW.approved_by_id           -- Ai approve
        FROM subject_classes sc
        WHERE sc.subject_id = NEW.subject_id
          AND sc.semester_id = NEW.semester_id;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

```bash
CREATE TRIGGER trg_subject_request_approved
AFTER UPDATE ON subject_registration_requests
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION add_to_class_students();
```