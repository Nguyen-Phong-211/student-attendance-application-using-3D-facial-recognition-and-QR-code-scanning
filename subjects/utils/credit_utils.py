def calculate_max_leave_days(theoretical_credits, practical_credits):
    t = theoretical_credits or 0
    p = practical_credits or 0
    total_lessons = t * 30 + p * 45
    return round(total_lessons * 0.3)