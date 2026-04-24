import { SupabaseClient } from '@supabase/supabase-js';
import type { FastifyInstance } from "fastify";
declare module 'fastify' {
    interface FastifyInstance {
        supabase: SupabaseClient;
    }
}
export declare const supabase: SupabaseClient<any, "public", "public", any, any>;
declare const _default: (fastify: FastifyInstance) => Promise<void>;
export default _default;
//# sourceMappingURL=supabase.d.ts.map