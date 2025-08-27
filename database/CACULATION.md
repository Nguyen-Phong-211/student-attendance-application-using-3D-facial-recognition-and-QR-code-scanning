```bash
UPDATE subjects 
SET sessions_per_class = CASE 
    WHEN total_credits = 2 THEN 2
    ELSE 3
END;
```