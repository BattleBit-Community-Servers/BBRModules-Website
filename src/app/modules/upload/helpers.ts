export type BinaryDependency = {
	optional: boolean;
	url: string;
};
type ModuleDefinition = {
	file: File;
	changelog: string;
	binaryDependencies: BinaryDependency[];
};

export function serializeModuleDefinition(moduleDefinition: ModuleDefinition): FormData {
	const data = new FormData();

	data.set("file", moduleDefinition.file);
	data.set("changelog", moduleDefinition.changelog);
	data.set("binaryDependencies", JSON.stringify(moduleDefinition.binaryDependencies));

	return data;
}

export function deserializeModuleDefinition(data: FormData): ModuleDefinition {
	const file = data.get("file");
	const changelog = data.get("changelog");
	const binaryDependencies = JSON.parse(data.get("binaryDependencies") as string);

	return {
		file: file as File,
		changelog: changelog as string,
		// TODO: validate binaryDependencies
		binaryDependencies: binaryDependencies as BinaryDependency[],
	};
}
