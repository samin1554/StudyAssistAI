import boto3
from botocore.exceptions import ClientError
import logging
from app.config import S3_ENDPOINT_URL, S3_ACCESS_KEY, S3_SECRET_KEY

logger = logging.getLogger(__name__)

class S3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            endpoint_url=S3_ENDPOINT_URL,
            aws_access_key_id=S3_ACCESS_KEY,
            aws_secret_access_key=S3_SECRET_KEY
        )
    
    def download_file(self, bucket_name: str, object_key: str) -> bytes:
        try:
            logger.info(f"Downloading: {bucket_name}/{object_key}")
            response = self.s3_client.get_object(Bucket=bucket_name, Key=object_key)
            file_bytes = response['Body'].read()
            logger.info(f"Downloaded {len(file_bytes)} bytes")
            return file_bytes
        except ClientError as e:
            error_code = e.response['Error']['Code']
            logger.error(f"S3 error: {error_code}")
            if error_code == 'NoSuchKey':
                raise ValueError(f"File not found: {object_key}")
            elif error_code == 'NoSuchBucket':
                raise ValueError(f"Bucket not found: {bucket_name}")
            else:
                raise ValueError(f"S3 error: {str(e)}")
        except Exception as e:
            logger.error(f"Download failed: {e}")
            raise ValueError(f"Failed to download: {str(e)}")

s3_service = S3Service()
