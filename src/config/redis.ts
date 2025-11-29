import { createClient } from 'redis';

export const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    },
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

export const connectRedis = async () => {
    await redisClient.connect();
    console.log('Redis connected successfully');
};
