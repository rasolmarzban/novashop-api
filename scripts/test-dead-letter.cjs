const amqp = require('amqplib');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  const user = process.env.RABBITMQ_USER;
  const password = process.env.RABBITMQ_PASSWORD;
  const host = process.env.RABBITMQ_HOST || 'localhost';
  const port = process.env.RABBITMQ_PORT || '5672';

  if (!user || !password) {
    throw new Error(
      'RabbitMQ credentials are missing from .env. Check variable names without printing their values.',
    );
  }

  const connection = await amqp.connect(
    `amqp://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}`,
  );

  try {
    const channel = await connection.createChannel();

    // Send an invalid event directly to order_queue.
    // The worker should reject it, triggering dead-letter routing.
    const testEvent = {
      pattern: 'order.created',
      data: {
        test: 'dead-letter-verification',
        invalid: true,
      },
    };

    await channel.sendToQueue(
      'order_queue',
      Buffer.from(JSON.stringify(testEvent)),
      {
        persistent: true,
        contentType: 'application/json',
        messageId: `dlq-test-${Date.now()}`,
      },
    );

    console.log('Dead-letter test message published to order_queue.');

    await channel.close();
  } finally {
    await connection.close();
  }
}

main().catch((error) => {
  console.error('Test failed:', error.message);
  process.exitCode = 1;
});
