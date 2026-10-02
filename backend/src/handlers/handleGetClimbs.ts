import type { FastifyInstance } from "fastify";
import type { Task } from "../../../frontend/src/lib/types.js";

export async function handleGetClimbs(server: FastifyInstance): Promise<Task> {
		const query = server.supabase.from("climbs").select("*");
		const { data, error } = await query;
		if (error) {
			return { success: false, error: error, code: 500 };
		}
		return { success: true, data: data };
	}