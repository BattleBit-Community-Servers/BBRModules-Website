"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "../../components/ui/input";
import { SEARCH_KEY } from "./lib";

export function Search() {
	const searchParams = useSearchParams();
	const pathName = usePathname();
	const { replace } = useRouter();

	const handleSearch = useDebouncedCallback((input: string) => {
		const params = new URLSearchParams(searchParams);
		if (!!input) {
			params.set(SEARCH_KEY, input);
		} else {
			params.delete(SEARCH_KEY);
		}

		replace(`${pathName}?${params.toString()}`);
	}, 500);

	const search = searchParams.get(SEARCH_KEY)?.toString() ?? "";

	return (
		<Input
			type="text"
			placeholder="Search"
			defaultValue={search}
			onChange={(i) => handleSearch(i.target.value)}
			className={`mb-3 ${search.length !== 0 ? "border border-red-500" : ""}`}
		/>
	);
}
