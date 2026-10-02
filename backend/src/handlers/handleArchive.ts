import type { FastifyInstance } from "fastify";
import type { Task } from "../../../frontend/src/lib/types.js";


export async function handleArchive(server: FastifyInstance, params: { id?: string }): Promise<Task> {
	const { id } = params;
	const { data, error } = await server.supabase
		.from("climbs")
		.update({ archived: true })
		.eq("id", id)
		.select();
	if (error) {
		return { success: false, error: error, code: 500 };
	}
	return { success: true, data: data };
}