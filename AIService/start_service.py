import json
import os
import pika

def get_rabbitmq_connection():
    rabbitmq_host = os.getenv("RABBIT_HOST", "localhost")
    rabbitmq_user = os.getenv("RABBIT_USER", "guest")
    rabbitmq_pass = os.getenv("RABBITMQ_PASS", "guest")

    try:
        credentials = pika.PlainCredentials(rabbitmq_user, rabbitmq_pass)
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=rabbitmq_host, credentials=credentials)
        )
        print(f"Connected to RabbitMQ at {rabbitmq_host}")
        return connection
    except Exception as e:
        print(f"Failed to connect to RabbitMQ: {e}")
        raise

def callback(ch, method, properties, body):
    print("Received message from ContentService")

    try:
        message = json.loads(body)
        print(f"Message content: {json.dumps(message, indent=2)}")

        # Example: Process based on content type
        if message.get("contentType") == "text":
            print(f"Processing text content: {message.get('title')}")
            # TODO: call your AI model here (e.g., summarization or tagging)

        elif message.get("contentType") == "pdf":
            print(f"Received PDF for processing: {message.get('fileName')}")
            # TODO: extract text and analyze

        else:
            print("Unknown content type")

    except Exception as e:
        print(f"Error processing message: {e}")

def start_listening():
    print("Starting AI Service...")
    
    try:
        connection = get_rabbitmq_connection()
        channel = connection.channel()

        # Declare exchange, queue, and binding (must match Spring config)
        exchange_name = os.getenv("RABBITMQ_EXCHANGE", "content.exchange")
        queue_name = os.getenv("RABBITMQ_QUEUE", "content.queue")
        routing_key = os.getenv("RABBITMQ_ROUTING_KEY", "content.routing.key")

        # Declare exchange
        channel.exchange_declare(exchange=exchange_name, exchange_type='direct', durable=True)
        print(f"Exchange declared: {exchange_name}")
        
        # Declare queue
        channel.queue_declare(queue=queue_name, durable=True)
        print(f"Queue declared: {queue_name}")
        
        # Bind queue to exchange with routing key
        channel.queue_bind(exchange=exchange_name, queue=queue_name, routing_key=routing_key)
        print(f"Queue bound to exchange with routing key: {routing_key}")

        print(f"Listening for messages on queue: {queue_name}")
        
        channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)

        try:
            channel.start_consuming()
        except KeyboardInterrupt:
            print("Stopping listener")
            channel.stop_consuming()
        finally:
            connection.close()
            
    except Exception as e:
        print(f"Error in start_listening: {e}")
        raise

if __name__ == "__main__":
    start_listening()
