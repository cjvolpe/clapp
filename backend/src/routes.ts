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
    type Log,
    type ClimbRecord,
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
        Reply: BaseReply<ClimbRecord[]>;

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
        Reply: BaseReply<ClimbRecord[]>;
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
    async function handleNewClimb(req: Climb): Promise<Process<ClimbRecord[]>> {
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
    async function handleFilteredSearch(req: Search): Promise<Process<ClimbRecord[]>> {
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