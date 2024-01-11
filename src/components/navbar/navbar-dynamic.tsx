"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { FaUpload } from "react-icons/fa6";
import { IoLogOut, IoShieldCheckmark } from "react-icons/io5";
import { MdLogin } from "react-icons/md";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function UserDropdownMenu() {
	const { data: user } = useSession();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Avatar className="cursor-pointer">
					{user?.user.image && <AvatarImage src={user.user.image} alt="User Profile Picture" />}
					<AvatarFallback>{user?.user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" sideOffset={10} className="w-56">
				<DropdownMenuLabel>Logged in as {user!.user.name}</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<Link href="/modules/upload">
						<DropdownMenuItem className="cursor-pointer">
							<FaUpload className="mr-2 h-4 w-4" />
							<span>Upload module</span>
						</DropdownMenuItem>
					</Link>

					{user?.user.role === "ADMIN" || user?.user.role === "MODERATOR" ? (
						<Link href="/admin/modules">
							<DropdownMenuItem className="cursor-pointer">
								<IoShieldCheckmark className="mr-2 h-4 w-4" />
								<span>Moderate</span>
							</DropdownMenuItem>
						</Link>
					) : null}

					<DropdownMenuItem className="cursor-pointer" onClick={() => signOut()}>
						<IoLogOut className="mr-2 h-4 w-4" />
						<span>Log out</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function NavbarDynamic() {
	const session = useSession();

	return (
		<>
			{session.data ? (
				<div className="ml-auto flex items-center gap-2">
					<UserDropdownMenu />
				</div>
			) : (
				<div className="ml-auto flex items-center gap-2">
					<Button onClick={() => signIn("discord")}>
						<span className="flex items-center gap-2">
							<MdLogin />
							Login
						</span>
					</Button>
				</div>
			)}
		</>
	);
}
