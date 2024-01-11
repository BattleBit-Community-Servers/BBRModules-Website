import { db } from "@/server/db";
import { type Module, type User, type Version } from "@prisma/client";
import Link from "next/link";
import { memo } from "react";
import { FaDownload, FaEye } from "react-icons/fa6";
import { SiDiscord } from "react-icons/si";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "../../components/ui/pagination";
import { cn, formatDownloadLink } from "../../lib/utils";
import { getServerAuthSession } from "../../server/auth";
import { Search } from "./search";

const UnapprovedBadge = memo(({ className }: { className?: string }) => (
	<Badge variant="danger" className={cn("pointer-events-none select-none tracking-normal", className)}>
		Unapproved
	</Badge>
));
UnapprovedBadge.displayName = "UnapprovedBadge";

function ModuleCard({ module }: { module: Module & { versions: Version[]; publisher: User } }) {
	const latest = module.versions.length > 0 ? module.versions[0] : null;
	const isApproved = latest?.approved;

	return (
		<Card className="flex flex-col justify-between">
			<CardHeader>
				<CardTitle>
					<Link href={`/modules/${module.id}`}>
						<div className="flex items-baseline gap-2">
							<span className="overflow-hidden overflow-ellipsis leading-snug">{module.name}</span>

							{latest && <span className="text-sm text-muted-foreground">{latest.name}</span>}
						</div>

						{!isApproved && <UnapprovedBadge />}
					</Link>
				</CardTitle>

				<div className="flex items-center text-muted-foreground">
					<SiDiscord className="mr-1 h-4 w-4" />
					<span className="text-sm">@{module.publisher.name}</span>
				</div>

				<CardDescription>{module.shortDescription}</CardDescription>
			</CardHeader>

			<CardFooter className="flex justify-end gap-2">
				{latest && (
					<a href={formatDownloadLink(module.id, latest.id)} download>
						<Button variant={isApproved ? "outline" : "danger"} size="icon">
							<FaDownload className="h-4 w-4" />
						</Button>
					</a>
				)}

				<Link href={`/modules/${module.id}`}>
					<Button variant="default">
						<FaEye className="mr-2 h-4 w-4" />
						View
					</Button>
				</Link>
			</CardFooter>
		</Card>
	);
}

async function Modules({ search, page }: { search: string; page: number }) {
	const session = await getServerAuthSession();

	const modules = await db.module.findMany({
		where: {
			name: { contains: search },
			// Moderators and admins should see all versions
			versions: { some: { approved: session?.user?.role === "USER" ? undefined : true } },
		},
		include: {
			versions: {
				take: 1,
				where: { approved: session?.user?.role === "USER" ? undefined : true },
				orderBy: { number: "desc" },
			},
			publisher: true,
		},
	});

	return (
		<>
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
				{modules.map((module) => (
					<ModuleCard module={module} key={module.id} />
				))}
			</div>

			{/* TODO: Pagination */}
			<Pagination>
				<PaginationContent>
					<PaginationPrevious href="#" />
					<PaginationLink href="#">1</PaginationLink>
					<PaginationItem>
						<PaginationEllipsis />
					</PaginationItem>
					<PaginationNext href="#" />
				</PaginationContent>
			</Pagination>
		</>
	);
}

export default function Index({ searchParams }: { searchParams: { search?: string; page?: string } }) {
	const search = searchParams.search ?? "";
	const page = +(searchParams.page ?? "1");

	return (
		<div>
			<h1 className="mb-3 text-4xl font-bold">Modules</h1>

			<Search />
			<Modules search={search} page={page} />
		</div>
	);
}
