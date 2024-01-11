/* eslint-disable @next/next/no-assign-module-variable */
import { type BinaryDependency, type Module, type ModuleDependency, type User, type Version } from "@prisma/client";
import { Link } from "lucide-react";
import { GoDownload, GoHistory } from "react-icons/go";
import { HiExternalLink } from "react-icons/hi";
import { SiDiscord } from "react-icons/si";
import { SanitizedMarkdown } from "../../../components/sanitized-markdown";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { cn, formatDownloadLink } from "../../../lib/utils";
import { db } from "../../../server/db";
import { ApprovalButtons, ModuleDetails } from "./main-view";

function ModuleApprovalAlert({ version, canApprove }: { version: Version; canApprove: boolean }) {
	if (!canApprove) return null;

	const isApproved = version.approved;
	if (isApproved) return null;

	if (isApproved === null) {
		return (
			<Alert variant={"default"} className={"border-red-500 text-red-500"}>
				<AlertTitle>Heads up!</AlertTitle>
				<AlertDescription>This module version failed the review process.</AlertDescription>
			</Alert>
		);
	}

	return (
		<Alert variant={"default"} className={"border-yellow-500 text-yellow-500"}>
			<AlertTitle>Heads up!</AlertTitle>
			<AlertDescription>
				This module version is still being reviewed and isn&apos;t visible to others yet.
			</AlertDescription>
		</Alert>
	);
}

function sortDependencies<T extends { optional: boolean }>(a: T, b: T) {
	if (a.optional && !b.optional) return 1;
	if (!a.optional && b.optional) return -1;

	return 0;
}

function DependenciesCard({
	modules,
	binaries,
}: {
	modules: (ModuleDependency & { module: Module })[];
	binaries: BinaryDependency[];
}) {
	if (!modules.length && !binaries.length) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Dependencies</CardTitle>
			</CardHeader>

			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Type</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{modules.sort(sortDependencies).map((dependency) => (
							<TableRow key={dependency.moduleId}>
								<TableCell>
									<Link href={`/module/${dependency.moduleId}`}>
										<div className="flex gap-1 transition-colors hover:text-blue-600">
											<span>{dependency.module.name}</span>
											<HiExternalLink />
										</div>
									</Link>
								</TableCell>
								<TableCell className="capitalize">Module {dependency.optional ? "(optional)" : ""}</TableCell>
							</TableRow>
						))}

						{binaries.sort(sortDependencies).map((dependency) => (
							<TableRow key={dependency.id}>
								<TableCell>{dependency.url}</TableCell>
								<TableCell className="capitalize">Binary {dependency.optional ? "(optional)" : ""}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

function Sidebar({ module }: { module: Module & { versions: Version[]; publisher: User } }) {
	// const user = useContext(UserContext);

	const latest = module.versions[0];
	if (!latest) return null;

	const user = { role: "ADMIN" };

	// const approvable = !latest.approved && (user?.role === "ADMIN" || user?.role === "MODERATOR");
	const canApprove = latest.approved === null && true;

	return (
		<Card className="flex flex-col gap-3 lg:w-3/12">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<div className="flex flex-col">
						<p>{module.publisher.name}</p>
						<p className="mt-1 flex items-center text-sm">
							<SiDiscord className="mr-1 h-4 w-4" />@{module.publisher.name}
						</p>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-3">
					<p className={cn("my-2 flex items-center", !latest.approved && "text-yellow-500")}>
						<GoHistory className="mr-2 h-4 w-4" />
						Latest version: {latest.name}
					</p>
					<a href={formatDownloadLink(module.id, latest.id)} download>
						<Button className="w-full">
							<GoDownload className="mr-2 h-4 w-4" /> Download
						</Button>
					</a>
					{canApprove ? <ApprovalButtons moduleId={module.id} versionId={latest.id} /> : null}
					<p className="mt-4">Older versions</p>
					<div className="flex flex-col divide-y-2">
						{(module.versions.length ?? 0) > 1
							? module.versions.slice(1).map((version) => (
									<div key={version.id} className="bg-color-white flex justify-between py-2">
										<p className="flex items-center">
											<GoHistory className="mr-2 h-4 w-4" />
											{version.name}
										</p>
										<a href={formatDownloadLink(module.id, version.id)} download>
											<Button variant={"outline"} size={"sm"}>
												Download
											</Button>
										</a>
									</div>
								))
							: "None"}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default async function ModulePage({ params: { id } }: { params: { id: string } }) {
	const module = await db.module.findUnique({
		where: { id },
		include: {
			publisher: true,
			versions: {
				// TODO: Only include approved versions for non-mods
				// where: { approved: true },
				orderBy: { number: "desc" },
				include: { dependsOnBinaries: true, dependsOnModules: { include: { module: true } } },
			},
		},
	});
	if (!module) return <>404</>;

	// TODO: Get user role
	const canApprove = true;
	const canEdit = true;

	const latest = module.versions[0]!;

	return (
		<div className="flex flex-col gap-4 lg:flex-row">
			<div className="flex flex-col gap-3 lg:w-9/12">
				<div className="flex flex-col gap-3">
					{module.versions.length > 0 && <ModuleApprovalAlert version={latest} canApprove={canApprove} />}

					<ModuleDetails module={module} canEdit={canEdit} />

					<DependenciesCard modules={latest.dependsOnModules} binaries={latest.dependsOnBinaries} />

					<Card>
						<CardHeader>
							<CardTitle>Changelog</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{module.versions.map((version) => (
								<div key={version.id}>
									<h3 className="text-2xl font-bold">{version.name}</h3>
									<SanitizedMarkdown markdown={version.changelog} />
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</div>

			<Sidebar module={module} />
		</div>
	);
}
