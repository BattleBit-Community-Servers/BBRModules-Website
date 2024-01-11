"use client";

import ReactMDEditor from "@uiw/react-md-editor";
import { useRef, useState, type ChangeEvent } from "react";
import { HiMinus, HiPlus } from "react-icons/hi";
import rehypeSanitize from "rehype-sanitize";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import { Input } from "../../../components/ui/input";
import { uploadModule } from "./actions";
import { serializeModuleDefinition, type BinaryDependency } from "./helpers";

export default function UploadPage() {
	const [binaryDependencies, setBinaryDependencies] = useState<BinaryDependency[]>([]);
	const [newBinaryDependencyURL, setNewBinaryDependencyURL] = useState("");
	const [newBinaryDependencyOptional, setNewBinaryDependencyOptional] = useState(false);

	const [changelog, setChangelog] = useState("");

	const [file, setFile] = useState<File | null>(null);
	const fileInput = useRef<HTMLInputElement>(null);

	const handleDependencyOptionalChange = (index: number) =>
		setBinaryDependencies((deps) => {
			const newDeps = [...deps];
			newDeps[index]!.optional = !newDeps[index]!.optional;
			return newDeps;
		});
	const handleDependencyURLChange = (index: number, e: ChangeEvent<HTMLInputElement>) =>
		setBinaryDependencies((deps) => {
			const newDeps = [...deps];
			newDeps[index]!.url = e.target.value;
			return newDeps;
		});

	const removeDependency = (index: number) => setBinaryDependencies((deps) => deps.filter((_, i) => i !== index));

	return (
		<>
			<h1 className="mb-3 text-4xl font-bold">Upload a module</h1>
			<p className="mb-4 text-lg font-normal text-gray-400">
				You can utilize this section to upload a new module to our repository or submit a new version of an existing
				module for updates
			</p>

			<section className="mb-4">
				<h2 className="text-2xl font-bold">Binary dependencies</h2>
				<p className="mb-2 text-lg font-normal text-gray-400">
					If your module relies on any binary dependencies, please specify them in the fields below. Use a separate
					field for each dependency.
				</p>

				<ul className="space-y-2">
					{binaryDependencies.map((dependency, index) => (
						<li key={index} className="flex items-center space-x-2">
							<Checkbox
								checked={!dependency.optional}
								onClick={() => handleDependencyOptionalChange(index)}
								className=""
							/>
							<Input
								type="text"
								value={dependency.url}
								onChange={(e) => handleDependencyURLChange(index, e)}
								className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring"
							/>
							<Button
								onClick={() => removeDependency(index)}
								className="w-10 rounded-md bg-red-500 p-2 text-white hover:bg-red-600 focus:outline-none"
							>
								<HiMinus />
							</Button>
						</li>
					))}

					<li className="flex items-center space-x-2">
						<Checkbox
							checked={!newBinaryDependencyOptional}
							onClick={() => setNewBinaryDependencyOptional((v) => !v)}
							className=""
						/>
						<Input
							type="text"
							value={newBinaryDependencyURL}
							onChange={(e) => setNewBinaryDependencyURL(e.target.value)}
							className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring"
						/>
						<Button
							onClick={() => {
								const url = newBinaryDependencyURL.trim();
								if (!url) return;

								setBinaryDependencies((deps) => [...deps, { url, optional: newBinaryDependencyOptional }]);
								setNewBinaryDependencyURL("");
								setNewBinaryDependencyOptional(false);
							}}
							className="w-10 rounded-md bg-green-600 p-2 text-white hover:bg-green-700 focus:outline-none"
						>
							<HiPlus />
						</Button>
					</li>
				</ul>
			</section>

			<section className="mb-4">
				<h2 className="text-2xl font-bold">Changelog</h2>
				<p className="mb-2 text-lg font-normal text-gray-400">
					Please provide a detailed changelog for this version of the module. Leaving this section blank will result in
					the changelog being set to &qout;Initial upload&quot; for new modules or &quot;No changelog provided&quot; for
					existing ones.
				</p>
				<p className="my-2 flex items-center text-amber-500">
					Note: Only images hosted on imgur are allowed. HTML is not allowed.
				</p>
				<ReactMDEditor
					value={changelog}
					onChange={(value) => setChangelog(value ?? "")}
					previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
				/>
			</section>

			<section className="mb-4">
				<h2 className="text-2xl font-bold">Module file</h2>
				<p className="mb-2 text-lg font-normal text-gray-400">
					Place your module .cs file here to upload it to the repository. It will be validated to check for compile-time
					errors, if there are no binary dependencies. Afterwards it will await approval by a moderator.
				</p>

				{/* {errorMessage && <p className="text-amber-500">We&apos;ve removed the file from the file selector!</p>} */}
				<Input
					ref={fileInput}
					type="file"
					accept=".cs"
					onChange={(e) => {
						console.log(e.target.files, e.target.files?.length, e.target.files?.length !== 1);

						if (!e.target.files || e.target.files.length !== 1) {
							setFile(null);
							return;
						}

						setFile(e.target.files[0]!);
					}}
					className="cursor-pointer file:text-white"
				/>
			</section>

			<div className="flex items-center gap-2">
				<Button
					onClick={async () => {
						console.log("m", file);
						if (!file) return;
						console.log("a");

						await uploadModule(serializeModuleDefinition({ file, binaryDependencies, changelog }));
					}}
					// disabled={loading}
				>
					{/* {loading ? (
						<>
							<AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
							Please wait
						</>
					) : ( */}
					<>Upload</>
					{/* )} */}
				</Button>

				{/* {errorMessage && <p className="text-red-500">{errorMessage}</p>} */}
			</div>
		</>
	);
}
