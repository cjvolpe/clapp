import './bootstrap.js';
import Fastify, {type FastifyInstance} from 'fastify'
// import {setupRoutes} from "./routes.js";
import supabasePlugin from "./supabase.js";
import cors from '@fastify/cors';


const FRONTEND_URL: string | undefined = process.env.FRONTEND_URL;
if (!FRONTEND_URL) throw new Error("Environment variable FRONTEND_URL is not set!");

const fastify: FastifyInstance = Fastify({
    logger: true
})


fastify.get('/', async (_request, _reply) => {

    return {hello: 'world'}
})

const start = async () => {
    try {
        await fastify.register(cors, {
            origin: "*",
            methods: ["GET", "POST"],
        });
        await fastify.register(supabasePlugin)
        // setupRoutes(fastify);
        await fastify.listen({port: 8000})
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }


}
start()

