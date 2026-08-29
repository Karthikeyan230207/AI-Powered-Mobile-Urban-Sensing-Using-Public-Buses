def calculate_priority(severity, traffic_level, confidence, verification_count):
    traffic = {"LOW": .35, "MEDIUM": .65, "HIGH": 1.0}.get(traffic_level.upper(), .35)
    verification = min(verification_count / 3.0, 1.0)
    score = (severity / 10) * 40 + traffic * 25 + confidence * 25 + verification * 10
    return round(min(score, 100), 1)
