import Image from "next/image";
import Link from "next/link";
import { IoExtensionPuzzle } from "react-icons/io5";
import { SiDiscord, SiGithub } from "react-icons/si";
import { NavbarDynamic } from "./navbar-dynamic";

const navItems = [
	{
		name: "Modules",
		href: "/modules",
		icon: <IoExtensionPuzzle className="h-4 w-4" />,
		key: "modules",
	},
	{
		name: "GitHub",
		url: "https://github.com/BattleBit-Community-Servers",
		icon: <SiGithub className="h-4 w-4" />,
		key: "github",
		target: "_blank",
	},
	{
		name: "Discord",
		url: "https://discord.gg/FTkj9xUvHh",
		icon: <SiDiscord className="h-4 w-4" />,
		key: "discord",
		target: "_blank",
	},
];

export function Navbar() {
	return (
		<nav className="my-8 flex gap-4">
			<Link className="flex items-center gap-2" href={"/"}>
				<Image src="/img/logo.webp" alt="Logo" width={48} height={48} />
			</Link>

			<div className="ml-auto flex items-center gap-2">
				{navItems.map((item) =>
					"url" in item ? (
						<a
							target={item.target}
							className="flex items-center rounded px-2 py-2 transition-colors hover:bg-accent sm:gap-2 sm:px-4 sm:py-2"
							href={item.url}
							key={item.key}
						>
							<span className="text-white">{item.icon}</span>
							<span className="hidden sm:inline-block">{item.name}</span>
						</a>
					) : (
						<Link
							href={item.href}
							key={item.key}
							className="flex items-center rounded px-2 py-2 transition-colors hover:bg-accent sm:gap-2 sm:px-4 sm:py-2"
						>
							<span className="text-white">{item.icon}</span>
							<span className="hidden sm:inline-block">{item.name}</span>
						</Link>
					),
				)}

				<NavbarDynamic />
			</div>
		</nav>
	);
}
