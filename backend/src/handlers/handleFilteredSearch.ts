import type { FastifyInstance } from "fastify";
import {
	type Task,
	type Search,
	ROPE_GRADES,
	BOULDER_GRADES,
} from "../../../frontend/src/lib/types.ts";

export async function handleFilteredSearch(server: FastifyInstance, req: Search): Promise<Task> {
	const {
		lowerDifficulty,
		upperDifficulty,
		type,
		color,
		startDate,
		endDate,
		gym,
		archived,
	} = req;
	let query = server.supabase.from("climbs").select("*");
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
	};
	if (type && type !== "Any") {
		query = query.eq("type", filter["type"]);
		if (lowerDifficulty !== null) {
			if (type === "Top Rope") {
				ropeList = sortByGrade(
					"Top Rope",
					"lower",
					lowerDifficulty,
					ropeList,
				);
			} else if (type === "Boulder") {
				boulderList = sortByGrade(
					"Boulder",
					"lower",
					lowerDifficulty,
					boulderList,
				);
			}
		}
		if (upperDifficulty !== null) {
			if (type === "Top Rope") {
				ropeList = sortByGrade(
					"Top Rope",
					"upper",
					upperDifficulty,
					ropeList,
				);
			} else if (type === "Boulder") {
				boulderList = sortByGrade(
					"Boulder",
					"upper",
					upperDifficulty,
					boulderList,
				);
			}
		}
		if (type && type === "Boulder") {
			query = query.in("difficulty", boulderList);
		} else if (type && type === "Top Rope") {
			query = query.in("difficulty", ropeList);
		}
	}
	if (color && color !== "Any") {
		query = query.eq("color", filter["color"]);
	}
	if (gym && gym !== "Any") {
		query = query.eq("gym", filter["gym"]);
	}
	if (archived !== null) {
		query = query.or("archived.eq.true,archived.eq.false");
	}
	if (startDate) {
		query = query.gte("date_set", filter["startDate"]);
	}
	if (endDate) {
		query = query.lte("date_set", filter["endDate"]);
	}

	const { data, error } = await query;
	if (error) {
		return { success: false, error: error, code: 500 };
	}
	return { success: true, data: data };
}

function sortByGrade(
	type: string,
	bound: string,
	filterGrade: string,
	gradeList: string[],
) {
	if (type === "Top Rope") {
		if (bound === "lower") {
			return gradeList.filter(
				(grade) => ROPE_GRADES[grade] >= ROPE_GRADES[filterGrade],
			);
		} else if (bound === "upper") {
			return gradeList.filter(
				(grade) => ROPE_GRADES[grade] <= ROPE_GRADES[filterGrade],
			);
		}
	} else if (type === "Boulder") {
		if (bound === "lower") {
			return gradeList.filter(
				(grade) => BOULDER_GRADES[grade] >= BOULDER_GRADES[filterGrade],
			);
		} else if (bound === "upper") {
			return gradeList.filter(
				(grade) => BOULDER_GRADES[grade] <= BOULDER_GRADES[filterGrade],
			);
		}
	}
}