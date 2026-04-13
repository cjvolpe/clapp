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
    BOULDER_GRADES
} from "../../frontend/src/lib/types.ts";

const ropeGrades: string[] = Object.keys(ROPE_GRADES);
const boulderGrades: string[] = Object.keys(BOULDER_GRADES);

//TODO: add post request for claiming a set climb, and ticking a climb
export function setupRoutes(server: FastifyInstance) {
    server.get<{
        Reply: any[] | { error: string };
    }>("/featured", async (request, reply) => {
        const {reply: result, code} = await packageResponse(() => handleFeaturedClimbs());
        return reply.status(code).send(result);
    });
    server.post<{
        Body: Climb;
        Reply: BaseReply<void>;

    }>("/climbs", async (req, res) => {
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
    server.post<{
        Body: string;
        Reply: BaseReply<void>;
    }>("/climbs/search", async (req, res) => {
        const {reply, code} = await packageResponse(() => handleSearch(req.body));
        res.status(code).send(reply);
    });

    async function handleFeaturedClimbs(): Promise<Task> {
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const query = server.supabase.from("climbs")
            .select("*").gte('date_set', twoWeeksAgo.toISOString()).order("date_set", {ascending: false});
        const {data, error} = await query;
        if (error) {
            return {success: false, error: error, code: 500};
        }
        return {success: true, data: data};

    }

//TODO: Handle pictures & fix date for postman
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
//TODO: fix difficulty selection
    async function handleFilteredSearch(req: Search): Promise<Task> {
        const {name, lowerDifficulty, upperDifficulty, type, setter, color, startDate, endDate, gym, archived} = req;
        const query = server.supabase.from("climbs").select('*');
        let gradeLock: boolean = false;
        const filter: Record<string, any> = {
            name: name,
            lowerDifficulty: lowerDifficulty,
            upperDifficulty: upperDifficulty,
            type: type,
            setter: setter,
            color: color,
            startDate: startDate,
            endDate: endDate,
            gym: gym,
            archived: archived,
        }
        if (filter[lowerDifficulty] !== null && filter[upperDifficulty] !== null) {
            let gradeList: string[] = [];
            if (filter["type"] === "Top Rope") {
                gradeList = Array.from(ropeGrades);
                console.log(gradeList);
                gradeList = sortByRopeGradeUpperLower(filter[lowerDifficulty], filter[upperDifficulty], gradeList);

            } else if (filter["type"] === "Boulder") {
                gradeList = Array.from(boulderGrades);
                console.log(gradeList + "sdf");
                gradeList = sortByBoulderGradeUpperLower(filter[lowerDifficulty], filter[upperDifficulty], gradeList);
            }


            console.log(gradeList);
            query.in("difficulty", gradeList);
            gradeLock = true;
            console.log(gradeLock);
        }
        for (const key in filter) {
            if (filter[key] === null) {
                continue;
            }
            if (key === "name") {
                query.textSearch("name", filter[key], {
                    config: "english",
                    type: "websearch"
                });
            } else if ((key === "lowerDifficulty" || key === "upperDifficulty") && !gradeLock) {
                let gradeList: string[] = [];
                if (filter["type"] === "Top Rope") {
                    gradeList = Array.from(ropeGrades);
                    console.log(gradeList);
                    if (key === "lowerDifficulty") gradeList = sortByRopeGrade("lower", filter[key], gradeList);
                    if (key === "upperDifficulty") gradeList = sortByRopeGrade("upper", filter[key], gradeList);
                } else if (filter["type"] === "Boulder") {
                    gradeList = Array.from(boulderGrades);
                    console.log(gradeList);
                    if (key === "lowerDifficulty") gradeList = sortByBoulderGrade("lower", filter[key], gradeList);
                    if (key === "upperDifficulty") gradeList = sortByBoulderGrade("upper", filter[key], gradeList);
                }
                console.log(gradeList);
                query.in("difficulty", gradeList);
            } else if (key === "type") {
                query.eq('type', filter[key]);
            } else if (key === "color") {
                query.eq('color', filter[key]);
            } else if (key === "setter") {
                query.textSearch("setter", filter[key], {
                    config: "english",
                    type: "websearch"
                });
            } else if (key === "gym") {
                query.eq('gym', filter[key]);
            } else if (key === "archived") {
                query.eq('archived', filter[key]);
            } else if (key === "startDate") {
                query.gte('startDate', filter[key]);
            } else if (key === "endDate") {
                query.lte('endDate', filter[key]);
            }
        }
        const {data, error} = await query;
        gradeLock = false;
        if (error) {
            return {success: false, error: error, code: 500};
        }
        return {success: true, data: data};
    }

    async function handleSearch(req: string): Promise<Task> {
        const searchTerm: string = `${req.search}:*`;
        console.log(searchTerm);
        const {
            data,
            error
        } = await server.supabase.from("climbs").select('*').or(`name.wfts.${searchTerm},setter.wfts.${searchTerm}`);
        if (error) {
            return {success: false, error: error, code: 500};
        }
        return {success: true, data: data};
    }

    function sortByRopeGrade(bound: string, filterGrade: string, gradeList: string[]) {
        if (bound === "lower") {
            return gradeList.filter(grade => ROPE_GRADES[grade] >= ROPE_GRADES[filterGrade]);
        } else if (bound === "upper") {
            return gradeList.filter(grade => ROPE_GRADES[grade] <= ROPE_GRADES[filterGrade]);
        }
    }

    function sortByBoulderGrade(bound: string, filterGrade: string, gradeList: string[]) {
        if (bound === "lower") {
            return gradeList.filter(grade => BOULDER_GRADES[grade] >= BOULDER_GRADES[filterGrade]);
        } else if (bound === "upper") {
            return gradeList.filter(grade => BOULDER_GRADES[grade] <= BOULDER_GRADES[filterGrade]);
        }
    }

    function sortByRopeGradeUpperLower(lowerFilter: string, upperFilter: string, gradeList: string[]) {
        return gradeList.filter(grade => ROPE_GRADES[lowerFilter] >= ROPE_GRADES[grade] <= ROPE_GRADES[upperFilter]);
    }

    function sortByBoulderGradeUpperLower(lowerFilter: string, upperFilter: string, gradeList: string[]) {
        return gradeList.filter(grade => BOULDER_GRADES[lowerFilter] >= BOULDER_GRADES[grade] <= BOULDER_GRADES[upperFilter]);
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