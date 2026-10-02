// builtin

// external
import type { FastifyInstance } from "fastify";
import {
	type BaseReply,
	type Failure,
	type ReplyConfig,
	type Task,
	type Process,
	type Climb,
	type Search,
	type Log,
} from "../../frontend/src/lib/types.ts";
import { handleFeaturedClimbs } from "./handlers/handleFeaturedClimbs.ts"
import { handleNewClimb } from "./handlers/handleNewClimb.ts"
import { handleArchive } from "./handlers/handleArchive.ts";
import { handleGetClimbs } from "./handlers/handleGetClimbs.ts";
import { handleLoggedClimbs } from "./handlers/handleLoggedClimbs.ts"
import { handleFilteredSearch } from "./handlers/handleFilteredSearch.ts"

//TODO: add post request for claiming a set climb, and ticking a climb
export function setupRoutes(server: FastifyInstance) {
	server.get<{
		Reply: any[] | { error: string };
	}>("/featured", async (req, res) => {
		const { reply: result, code } = await packageResponse(() =>
			handleFeaturedClimbs(server),
		);
		return res.status(code).send(result);
	});
	server.get<{
		Reply: any[] | { error: string };
	}>("/climbs/logged/:uuid", async (req, res) => {
		const { reply: result, code } = await packageResponse(() =>
			handleLoggedClimbs(server, req.params),
		);
		return res.status(code).send(result);
	});
	server.get<{
		Reply: any[] | { error: string };
	}>("/climbs", async (req, res) => {
		const { reply: result, code } = await packageResponse(() =>
			handleGetClimbs(server),
		);
		return res.status(code).send(result);
	});

	server.post<{
		Body: Climb;
		Reply: BaseReply<void>;
	}>("/climbs/new", async (req, res) => {
		const { reply, code } = await packageResponse(() =>
			handleNewClimb(server, req.body),
		);
		res.status(code).send(reply);
	});

	server.patch("/climbs/archive/:id", async (req, res) => {
		const { reply, code } = await packageResponse(() =>
			handleArchive(server, req.params),
		);
		res.status(code).send(reply);
	});

	server.get<{
		Querystring: Search;
	}>("/climbs/search/filter", async (req, res) => {
		const { reply, code } = await packageResponse(() =>
			handleFilteredSearch(server, req.query),
		);
		res.status(code).send(reply);
	});

	//TODO: prevent climbs from being logged twice
	server.post<{
		Body: {
			user: string;
			climb: number;
		};
		Reply: BaseReply<void>;
	}>("/climbs/log", async (req, res) => {
		const { reply, code } = await packageResponse(() => handleLog(req.body));
		res.status(code).send(reply);
	});

	async function handleLog(req: Log): Promise<Task> {
		const { user, climb } = req;
		const { data, error } = await server.supabase
			.from("completed_climbs")
			.insert([
				{
					climber: user,
					climb: climb,
				},
			])
			.select();
		if (error) {
			return { success: false, error: error, code: 500 };
		}
		return { success: true, data: data };
	}

	async function packageResponse<O>(
		handler: () => Promise<Process<O>>,
	): Promise<ReplyConfig<O>> {
		const result = await handler();

		if (result.success) {
			return {
				reply: { ...result },
				code: 200,
			};
		}

		if (result.code !== undefined) {
			return {
				reply: {
					success: false,
					error: result.error.message,
					message: result.error.message,
				},
				code: result.code,
			};
		}

		throw result.error;
	}
}
