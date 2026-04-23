// builtin

// external
import type {FastifyInstance} from "fastify";
import {
    type BaseReply,
    type Failure,
    type ReplyConfig,
    type Task,
    type Process,
    type Climb,
    type Search,
    ROPE_GRADES,
    BOULDER_GRADES, type Log, type Rating
} from "../../frontend/src/lib/types.ts";

//TODO: add post request for claiming a set climb, and ticking a climb
export function setupRoutes(server: FastifyInstance) {
    server.get<{
        Reply: any[] | { error: string };
    }>("/featured", async (req, res) => {
        const {reply: result, code} = await packageResponse(() => handleFeaturedClimbs());
        return res.status(code).send(result);
    });
    server.get<{
        Reply: any[] | { error: string };
    }>("/climbs/logged/:uuid", async (req, res) => {
        const {reply: result, code} = await packageResponse(() => handleLoggedClimbs(req.params));
        return res.status(code).send(result);
    });
    server.get<{
        Reply: any[] | { error: string };
    }>("/climbs", async (req, res) => {
        const {reply: result, code} = await packageResponse(() => handleGetClimbs());
        return res.status(code).send(result);
    });

    server.post<{
        Body: Climb;
        Reply: BaseReply<void>;

    }>("/climbs/new", async (req, res) => {
        const {reply, code} = await packageResponse(() => handleNewClimb(req.body));
        res.status(code).send(reply);
    });

    server.patch('/climbs/archive/:id', async (req, res) => {
        const {reply, code} = await packageResponse(() => handleArchive(req.params));
        res.status(code).send(reply);

    });

    server.post<{
        Body: Search;
        Reply: BaseReply<void>;
    }>("/climbs/search/filter", async (req, res) => {
        const {reply, code} = await packageResponse(() => handleFilteredSearch(req.body));
        res.status(code).send(reply);
    });

    //TODO: prevent climbs from being logged twice
    server.post<{
        Body: {
            user: string,
            climb: number
        };
        Reply: BaseReply<void>;
    }>("/climbs/log", async (req, res) => {
        const {reply, code} = await packageResponse(() => handleLog(req.body));
        res.status(code).send(reply);
    });

    server.post<{
        Body: Rating;
        Reply: BaseReply<void>;
    }>("/climbs/rate", async (req, res) => {
        const {reply, code} = await packageResponse(() => handleRate(req.body));
        res.status(code).send(reply);
    });

    server.get<{
        Params: { climbId: string };
        Reply: BaseReply<void>;
    }>("/climbs/rating/:climbId", async (req, res) => {
        const {reply, code} = await packageResponse(() => handleRatingSummary(req.params));
        res.status(code).send(reply);
    });

    server.get<{
        Params: { climbId: string; userId: string };
        Reply: BaseReply<void>;
    }>("/climbs/rating/:climbId/:userId", async (req, res) => {
        const {reply, code} = await packageResponse(() => handleUserRating(req.params));
        res.status(code).send(reply);
    });

    async function handleFeaturedClimbs(): Promise<Task> {
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const query = server.supabase.from("climbs")
            .select("*").gte('date_set', twoWeeksAgo.toISOString()).eq("archived", false).order("date_set", {ascending: false});
        const {data, error} = await query;
        if (error) {
            return {success: false, error: error, code: 500};
        }
        return {success: true, data: data};

    }

    async function handleGetClimbs(): Promise<Task> {
        const query = server.supabase.from("climbs").select("*");
        const {data, error} = await query;
        if (error) {
            return {success: false, error: error, code: 500};
        }
        return {success: true, data: data};

    }

//TODO: Handle pictures
    async function handleNewClimb(req: Climb): Promise<Task> {
        const {name, difficulty, type, color, setter, dateSet, gym} = req;
        const {data, error} = await server.supabase.from("climbs").insert([
            {
                name: name,
                difficulty: difficulty,
                type: type,
                color: color,
                setter: setter,
                date_set: dateSet,
                gym: gym,
            }
        ]).select();
        if (error) {
            return {success: false, error: error, code: 500};
        }
        return {success: true, data: data};
    }

    async function handleArchive(params: { id?: string }): Promise<Task> {
        const {id} = params;
        const {data, error} = await server.supabase.from("climbs").update({archived: true}).eq("id", id).select();
        if (error) {
            return {success: false, error: error, code: 500};
        }
        return {success: true, data: data};

    }

    async function handleLoggedClimbs(params: { uuid?: string }): Promise<Task> {
        const {uuid} = params;
        const {data, error} = await server.supabase.from("completed_climbs").select(`
            *,
            climbs:climb(*)`).eq("climber", uuid);
        if (error) {
            return {success: false, error: error, code: 500};
        }
        return {success: true, data: data};
    }

//TODO: remove for loop
    async function handleFilteredSearch(req: Search): Promise<Task> {
        const {lowerDifficulty, upperDifficulty, type, color, startDate, endDate, gym, archived} = req;
        const query = server.supabase.from("climbs").select('*');
        let boulderList: string[] = Object.keys(BOULDER_GRADES);
        let ropeList: string[] = Object.keys(ROPE_GRADES);
        const filter: Record<string, any> = {
            lowerDifficulty: lowerDifficulty,
            upperDifficulty: upperDifficulty,
            type: type,
            color: color,
            startDate: startDate,
            endDate: endDate,
            gym: gym,
            archived: archived,
        }
        if (filter["type"] !== "Any") {
            query.eq('type', filter["type"]);
            if (filter["lowerDifficulty"] !== null) {
                if (filter["type"] === "Top Rope") {
                    ropeList = sortByGrade("Top Rope", "lower", filter["lowerDifficulty"], ropeList);
                } else if (filter["type"] === "Boulder") {
                    boulderList = sortByGrade("Boulder", "lower", filter["lowerDifficulty"], boulderList);
                }
            }
            if (filter["upperDifficulty"] !== null) {
                if (filter["type"] === "Top Rope") {
                    ropeList = sortByGrade("Top Rope", "upper", filter["upperDifficulty"], ropeList);
                } else if (filter["type"] === "Boulder") {
                    boulderList = sortByGrade("Boulder", "upper", filter["upperDifficulty"], boulderList);
                }
            }
            console.log(ropeList);
            if (filter["type"] === "Boulder") {
                query.in("difficulty", boulderList);
            } else if (filter["type"] === "Top Rope") {
                query.in("difficulty", ropeList);
            }
        }
        if (filter["color"] !== "Any") {
            query.eq('color', filter["color"]);
        }
        if (filter["gym"] !== "Any") {
            query.eq('gym', filter["gym"]);
        }
        if (filter["archived"] !== null) {
            query.or('archived.eq.true,archived.eq.false');
        }
        if (filter["startDate"] !== "") {
            query.gte('date_set', filter["startDate"]);
        }
        if (filter["endDate"] !== "") {
            query.lte('date_set', filter["endDate"]);
        }

        const {data, error} = await query;
        if (error) {
            return {success: false, error: error, code: 500};
        }
        return {success: true, data: data};
    }

    function sortByGrade(type: string, bound: string, filterGrade: string, gradeList: string[]) {
        if (type === "Top Rope") {
            if (bound === "lower") {
                return gradeList.filter(grade => ROPE_GRADES[grade] >= ROPE_GRADES[filterGrade]);
            } else if (bound === "upper") {
                return gradeList.filter(grade => ROPE_GRADES[grade] <= ROPE_GRADES[filterGrade]);
            }
        } else if (type === "Boulder") {
            if (bound === "lower") {
                return gradeList.filter(grade => BOULDER_GRADES[grade] >= BOULDER_GRADES[filterGrade]);
            } else if (bound === "upper") {
                return gradeList.filter(grade => BOULDER_GRADES[grade] <= BOULDER_GRADES[filterGrade]);
            }
        }
    }

    async function handleLog(req: Log): Promise<Task> {
        const {user, climb} = req;
        const {data, error} = await server.supabase.from("completed_climbs").insert([{
            climber: user,
            climb: climb,
        }]).select();
        if (error) {
            return {success: false, error: error, code: 500};
        }
        return {success: true, data: data};
    }


    async function handleRate(req: Rating): Promise<Task> {
        const {user, climb, rating} = req;
        if (!user || !climb || typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            return {success: false, error: new Error("rating must be an integer between 1 and 5"), code: 400};
        }
        const {data, error} = await server.supabase
            .from("climb_ratings")
            .upsert(
                {climber: user, climb: climb, rating: rating, updated_at: new Date().toISOString()},
                {onConflict: "climb,climber"}
            )
            .select();
        if (error) {
            return {success: false, error: error, code: 500};
        }
        return {success: true, data: data as any};
    }

    async function handleRatingSummary(params: { climbId?: string }): Promise<Task> {
        const {climbId} = params;
        if (!climbId) {
            return {success: false, error: new Error("climbId required"), code: 400};
        }
        const {data, error} = await server.supabase
            .from("climb_ratings")
            .select("rating")
            .eq("climb", climbId);
        if (error) {
            return {success: false, error: error, code: 500};
        }
        const ratings = (data ?? []) as { rating: number }[];
        const count = ratings.length;
        const average = count === 0
            ? 0
            : Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / count) * 100) / 100;
        return {success: true, data: {average, count} as any};
    }

    async function handleUserRating(params: { climbId?: string; userId?: string }): Promise<Task> {
        const {climbId, userId} = params;
        if (!climbId || !userId) {
            return {success: false, error: new Error("climbId and userId required"), code: 400};
        }
        const {data, error} = await server.supabase
            .from("climb_ratings")
            .select("rating")
            .eq("climb", climbId)
            .eq("climber", userId)
            .maybeSingle();
        if (error) {
            return {success: false, error: error, code: 500};
        }
        return {success: true, data: (data ?? {rating: 0}) as any};
    }


    async function packageResponse<O>(handler: () => Promise<Process<O>>,): Promise<ReplyConfig<O>> {
        const result = await handler();

        if (result.success) {
            return {
                reply: {...result},
                code: 200
            };
        }

        if (result.code !== undefined) {
            return {
                reply: {
                    success: false,
                    error: result.error.message,
                    message: result.error.message,
                },
                code: result.code
            };
        }

        throw result.error;

    }
}