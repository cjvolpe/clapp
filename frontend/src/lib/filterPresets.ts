import type {Search} from "./types.ts";

export interface FilterPreset {
    name: string;
    filter: PresetFilter;
}

export interface PresetFilter {
    type: string;
    lowerDifficulty: string;
    upperDifficulty: string;
    color: string;
    gym: string;
    startDate: string;
    endDate: string;
    archived: boolean;
}

const STORAGE_KEY = "clapp.filterPresets";

export function loadPresets(): FilterPreset[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (p): p is FilterPreset =>
                p && typeof p.name === "string" && p.filter && typeof p.filter === "object"
        );
    } catch {
        return [];
    }
}

export function savePresets(presets: FilterPreset[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

export function upsertPreset(presets: FilterPreset[], preset: FilterPreset): FilterPreset[] {
    const idx = presets.findIndex(p => p.name === preset.name);
    if (idx === -1) return [...presets, preset];
    const next = presets.slice();
    next[idx] = preset;
    return next;
}

export function removePreset(presets: FilterPreset[], name: string): FilterPreset[] {
    return presets.filter(p => p.name !== name);
}

export function presetToSearch(preset: PresetFilter): Search {
    return {
        lowerDifficulty: preset.lowerDifficulty,
        upperDifficulty: preset.upperDifficulty,
        type: preset.type,
        color: preset.color,
        startDate: preset.startDate as unknown as Date,
        endDate: preset.endDate as unknown as Date,
        gym: preset.gym,
        archived: preset.archived,
    };
}
