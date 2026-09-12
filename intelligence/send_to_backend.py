import requests

from .incident import IncidentBuilder, mock_detection


BACKEND_URL = "http://127.0.0.1:8000/api/incidents/from-m4"


def send_incident(incident):

    response = requests.post(
        BACKEND_URL,
        json=incident.to_dict(),
        timeout=10
    )

    response.raise_for_status()

    return response.json()


if __name__ == "__main__":

    builder = IncidentBuilder()

    detection = mock_detection(
        detection_type="pothole"
    )

    incident = builder.build(detection)

    if incident is None:
        print("Detection was not reportable.")
    else:
        print("\nM4 INCIDENT CREATED")
        print(incident.to_json())

        result = send_incident(incident)

        print("\nBACKEND RESPONSE")
        print(result)