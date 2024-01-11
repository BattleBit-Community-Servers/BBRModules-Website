"use client";

import { type Module } from "@prisma/client";
import ReactMDEditor from "@uiw/react-md-editor";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SanitizedMarkdown } from "../../../components/sanitized-markdown";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { approveVersion, denyVersion, updateDescription } from "./actions";

export function ModuleDetails({ module, canEdit }: { module: Module; canEdit: boolean }) {
	const [description, setModuleMarkdown] = useState(module.description);
	const [isEditingModule, setIsEditingModule] = useState(false);

	const router = useRouter();

	return (
		<Card>
			<CardHeader>
				<div className="flex max-w-full items-start justify-between gap-2">
					<div className="flex-1 overflow-hidden">
						<CardTitle className="mb-2 overflow-hidden overflow-ellipsis leading-snug">{module.name}</CardTitle>
						<CardDescription>{module.shortDescription}</CardDescription>
					</div>

					{isEditingModule ? (
						<div className="flex gap-2">
							<Button variant="outline" className="ml-auto" onClick={() => setIsEditingModule(false)}>
								Cancel
							</Button>
							<Button
								variant="default"
								className="ml-auto"
								onClick={async () => {
									await updateDescription(module.id, description);
									setIsEditingModule(false);

									router.refresh();
								}}
							>
								Save
							</Button>
						</div>
					) : (
						canEdit && (
							<Button variant="outline" className="ml-auto" onClick={() => setIsEditingModule(true)}>
								Edit
							</Button>
						)
					)}
				</div>
			</CardHeader>

			<CardContent>
				<div>
					{isEditingModule ? (
						<>
							<p className="my-2 flex items-center text-yellow-500">
								Note: Only images hosted on imgur are allowed. HTML is not allowed.
							</p>
							<ReactMDEditor value={description} onChange={(value) => setModuleMarkdown(value ?? "")} />
						</>
					) : (
						<SanitizedMarkdown markdown={description} />
					)}
				</div>
			</CardContent>
		</Card>
	);
}

export function ApprovalButtons({ moduleId, versionId }: { moduleId: string; versionId: string }) {
	const router = useRouter();

	return (
		<div className="flex gap-2">
			<Button
				className="flex-1"
				type="submit"
				variant="outline"
				onClick={async () => {
					await approveVersion(moduleId, versionId);

					// toast.promise(approveVersion(versionId), {
					//     pending: "Approving module...",
					//     success: "Module approved!",
					//     error: "Failed to approve module!"
					// })

					router.refresh();
				}}
			>
				Approve
			</Button>
			<Button
				className="flex-1"
				type="submit"
				variant="destructive"
				onClick={async () => {
					await denyVersion(moduleId, versionId);

					// toast.promise(
					//     denyVersion(versionId),
					//     {
					//         pending: "Denying module...",
					//         success: "Module denied!",
					//         error: "Failed to deny module!"
					//     },
					//     { type: "warning" }
					// )

					router.refresh();
				}}
			>
				Deny
			</Button>
		</div>
	);
}
