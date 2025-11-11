import pika
import os

def get_rabbitmq_connection():
    rabbitmq_host = os.getenv("RABBIT_HOST", "localhost")
    rabbitmq_user = os.getenv("RABBIT_USER", "guest")
    rabbitmq_pass = os.getenv("RABBITMQ_PASS", "guest")

    credentials = pika.PlainCredentials(rabbitmq_user, rabbitmq_pass)
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=rabbitmq_host, credentials=credentials)
    )
    return connection
