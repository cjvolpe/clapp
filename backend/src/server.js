import './bootstrap.js';
import Fastify, {} from 'fastify';
import supabasePlugin from "./supabase.js";
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { setupRoutes } from "./routes.js";
const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL)
    throw new Error("Environment variable FRONTEND_URL is not set!");
const fastify = Fastify({
    logger: true
});
const start = async () => {
    try {
        await fastify.register(cors, {
            origin: "*",
            methods: ["GET", "POST", "PATCH"],
        });
        // Register rate limiting with global default: 100 req/min
        await fastify.register(rateLimit, {
            max: 100,
            timeWindow: '1 minute',
            keyGenerator: (request) => {
                return request.ip ?? request.socket.remoteAddress ?? '127.0.0.1';
            },
            addHeadersOnExceeding: { 'x-ratelimit-limit': true, 'x-ratelimit-remaining': true, 'x-ratelimit-reset': true },
            addHeaders: { 'x-ratelimit-limit': true, 'x-ratelimit-remaining': true, 'x-ratelimit-reset': true, 'retry-after': true },
        });
        await fastify.register(supabasePlugin);
        // Health endpoint (unlimited - registered before routes, with rateLimit disabled)
        fastify.get('/health', {
            config: {
                rateLimit: false,
            }
        }, async (_request, reply) => {
            try {
                const { error } = await fastify.supabase.from('climbs').select('id', { count: 'exact', head: true });
                if (error) {
                    return reply.status(503).send({ status: 'error', supabase: 'disconnected' });
                }
                return { status: 'ok', supabase: 'connected' };
            }
            catch {
                return reply.status(503).send({ status: 'error', supabase: 'disconnected' });
            }
        });
        fastify.get('/', async (_request, _reply) => {
            return { hello: 'world' };
        });
        setupRoutes(fastify);
        await fastify.listen({
            port: 8000,
            host: "0.0.0.0"
        });
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map