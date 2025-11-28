import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:sam2424@localhost:5432/contentdb")

S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL", "http://localhost:9000")
S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY", "5LOINNTM4WLINUNUXOR1")
S3_SECRET_KEY = os.getenv("S3_SECRET_KEY", "CTfTZCCMHSezoWL4gh09Uaj65Z2UC2MjLDW8bPI7")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "contentpdfai")

SUMMARIZATION_MODEL = os.getenv("SUMMARIZATION_MODEL", "facebook/bart-large-cnn")
MAX_SUMMARY_LENGTH = int(os.getenv("MAX_SUMMARY_LENGTH", "200"))
MIN_SUMMARY_LENGTH = int(os.getenv("MIN_SUMMARY_LENGTH", "80"))
