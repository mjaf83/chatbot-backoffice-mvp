import requests
import json

def debug_chat():
    url = "http://127.0.0.1:8000/api/chat"
    payload = {
        "message": "hola",
        "history": []
    }
    
    print(f"Sending request to {url}...")
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        try:
            print("Response JSON:", response.json())
        except:
            print("Response Text:", response.text)
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    debug_chat()
