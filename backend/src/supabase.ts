import fp from 'fastify-plugin';
import {createClient,SupabaseClient} from '@supabase/supabase-js';
import type {FastifyInstance} from "fastify";

declare module 'fastify' {
    interface FastifyInstance {
        supabase: SupabaseClient;
    }
}

export default fp(async (fastify: FastifyInstance) => {
    const supabaseURL = process.env.DB_URL;
    const supabaseKey = process.env.DB_KEY;

    if (!supabaseURL || !supabaseKey) {
        throw new Error("Supabase URL and KEY must be provided");
    }

    const supabase = createClient(supabaseURL,supabaseKey);

    fastify.decorate('supabase',supabase);
})