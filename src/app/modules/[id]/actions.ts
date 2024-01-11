"use server";

import { db } from "@/server/db";

export async function updateDescription(moduleId: string, description: string) {
	await db.module.update({ where: { id: moduleId }, data: { description } });
}

export async function approveVersion(moduleId: string, versionId: string) {
	await db.version.update({
		where: { moduleId: moduleId, id: versionId },
		data: { approved: true },
	});
}

export async function denyVersion(moduleId: string, versionId: string) {
	await db.version.update({
		where: { moduleId: moduleId, id: versionId },
		data: { approved: false },
	});
}
