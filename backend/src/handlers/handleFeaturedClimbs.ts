import type { FastifyInstance } from "fastify";
import type { Task } from "../../../frontend/src/lib/types.js";

export async function handleFeaturedClimbs(server: FastifyInstance): Promise<Task> {
		const twoWeeksAgo = new Date();
		twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
		const query = server.supabase
			.from("climbs")
			.select("*")
			.gte("date_set", twoWeeksAgo.toISOString())
			.eq("archived", false)
			.order("date_set", { ascending: false });
		const { data, error } = await query;
		if (error) {
			return { success: false, error: error, code: 500 };
		}
		return { success: true, data: data };
	}