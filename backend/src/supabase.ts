import fp from 'fastify-plugin';
import {createClient, SupabaseClient} from '@supabase/supabase-js';
import type {FastifyInstance} from "fastify";

declare module 'fastify' {
    interface FastifyInstance {
        supabase: SupabaseClient;
    }
}

//
const supabaseURL = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseURL || !supabaseKey) {
    throw new Error("Supabase URL and KEY must be provided");
}


export const supabase = createClient(supabaseURL, supabaseKey);

export default fp(async (fastify: FastifyInstance) => {
    fastify.decorate('supabase', supabase);
})