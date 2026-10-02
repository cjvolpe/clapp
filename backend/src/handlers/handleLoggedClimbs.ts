import type { FastifyInstance } from "fastify";
import type { Task } from "../../../frontend/src/lib/types.js";

export async function handleLoggedClimbs(server: FastifyInstance, params: { uuid?: string }): Promise<Task> {
		const { uuid } = params;
		const { data, error } = await server.supabase
			.from("completed_climbs")
			.select(`
            *,
            climbs:climb(*)`)
			.eq("climber", uuid);
		if (error) {
			return { success: false, error: error, code: 500 };
		}
		return { success: true, data: data };
	}