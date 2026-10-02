import type { Climb, Task } from "../../../frontend/src/lib/types.js";
import type { FastifyInstance } from "fastify";

export async function handleNewClimb(server: FastifyInstance, req: Climb): Promise<Task> {
		const { name, difficulty, type, color, setter, dateSet, gym } = req;
		const { data, error } = await server.supabase
			.from("climbs")
			.insert([
				{
					name: name,
					difficulty: difficulty,
					type: type,
					color: color,
					setter: setter,
					date_set: dateSet,
					gym: gym,
				},
			])
			.select();
		if (error) {
			return { success: false, error: error, code: 500 };
		}
		return { success: true, data: data };
	}