import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDownloadLink(moduleId: string, versionId: string) {
	return `/api/modules/${moduleId}/versions/${versionId}/download`;
}
