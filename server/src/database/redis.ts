import { createClient } from "redis";
import { config } from "../config/app.config";

const redis = createClient({
  username: config.REDIS_USER,
  password: config.REDIS_PASSWORD,
  socket: {
    host: config.REDIS_HOST,
    port: Number(config.REDIS_PORT),
  },
});

redis.on("error", (err) => console.info("Redis Client Error", err));
redis.on("connect", () => console.info("Redis Client Connected"));

export default redis;
