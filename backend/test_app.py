import json
import httpx

# Load the example payload with UTF-8 encoding
with open("examplepayload.json", "r", encoding="utf-8") as file:
    payload = json.load(file)

# Define the API URL
api_url = "http://127.0.0.1:8000/webhook"  # Adjust to your local FastAPI URL if needed

# Send the POST request with a higher timeout
timeout = httpx.Timeout(30.0)  # Set a 30-second timeout

with httpx.Client(timeout=timeout) as client:
    response = client.post(api_url, json=payload)

# Print the response
print("Status Code:", response.status_code)
print("Response JSON:", response.json())
