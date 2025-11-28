import requests
import json
import time

def test_mcq_generation():
    url = "http://localhost:8084/api/mcq/generate_mcqs"
    text = """
    Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll pigments. 
    During photosynthesis in green plants, light energy is captured and used to convert water, carbon dioxide, and minerals into oxygen and energy-rich organic compounds.
    """
    
    payload = {
        "text": text,
        "num_questions": 3
    }
    
    print(f"Sending request to {url}...")
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        result = response.json()
        print("Response received:")
        print(json.dumps(result, indent=2))
        
        if "questions" in result and len(result["questions"]) > 0:
            print("SUCCESS: MCQs generated.")
        else:
            print("WARNING: No questions generated or empty response.")
            
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    # Wait for service to start
    print("Waiting for service to start...")
    time.sleep(5) 
    test_mcq_generation()
