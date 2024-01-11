"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { exec } from "child_process";
import { randomBytes } from "crypto";
import { rm, writeFile } from "fs/promises";
import { env } from "../../../env.mjs";
import { getServerAuthSession } from "../../../server/auth";
import { db } from "../../../server/db";
import { deserializeModuleDefinition } from "./helpers";

const s3 = new S3Client({
	apiVersion: "2006-03-01",
	forcePathStyle: true,
	region: "eu2",
	endpoint: env.S3_ENDPOINT,
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY,
		secretAccessKey: env.S3_SECRET_KEY,
	},
});

type CheckResult =
	| {
			Success: true;
			Name: string;
			Description: string;
			Version: string;
			RequiredDependencies: string[];
			OptionalDependencies: string[];
			Errors: null;
	  }
	| {
			Success: false;
			Name: string;
			Description: null;
			Version: null;
			RequiredDependencies: null;
			OptionalDependencies: null;
			Errors: string;
	  };

// FIXME: Replace with API call
async function checkModule(file: string): Promise<CheckResult> {
	try {
		const jsonOutput: string = await new Promise((res, rej) => {
			const proc = exec(`dotnet "${env.VERIFICATION_TOOL}" "${file}"`, {
				encoding: "utf8",
			});
			proc.on("error", rej);

			let output = "";
			proc.stdout!.on("data", (data) => (output += data));

			proc.on("exit", (code) => {
				if (code === 0) {
					res(output);
				} else {
					rej(new Error(`Verification tool exited with code ${code}`));
				}
			});
		});

		return JSON.parse(jsonOutput);
	} catch (error) {
		return Promise.reject(`Error parsing JSON output: ${(error as Error).message}`);
	}
}

export async function uploadModule(data: FormData) {
	const session = await getServerAuthSession();
	console.log(session);
	if (!session) throw new Error("Not authenticated");

	const { changelog, ...def } = deserializeModuleDefinition(data);
	const tmpFile = `./tmp/${randomBytes(16).toString("hex")}.cs`;

	const fileContent = Buffer.from(await def.file.arrayBuffer());
	await writeFile(tmpFile, fileContent);

	const check = await checkModule(tmpFile);
	console.log(check);

	await rm(tmpFile);

	if (!check.Success) throw new Error(check.Errors);

	const fileKey = `${check.Name}-${check.Version}`;
	const res = await s3.send(new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: fileKey, Body: fileContent }));
	console.log(res);

	await db.version.create({
		data: {
			name: check.Version,
			changelog,
			s3Key: fileKey,
			dependsOnBinaries: {
				createMany: {
					data: def.binaryDependencies.map((dep) => ({ optional: dep.optional, url: dep.url })),
				},
			},
			dependsOnModules: {
				createMany: {
					data: check.RequiredDependencies.map((dep) => ({
						optional: false,
						moduleId: /* TODO: Get module ID by module name */ 1,
					})),
				},
			},
			module: {
				connectOrCreate: {
					where: { name: check.Name },
					create: {
						name: check.Name,
						description: check.Description,
						shortDescription: "",
						publisher: {
							connect: {
								id: session.user.id,
							},
						},
					},
				},
			},
		},
	});
}
