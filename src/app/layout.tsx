import "@/styles/globals.css";
import { Navbar } from "../components/navbar/navbar";
import { InteractiveSessionProvider } from "./session-provider";

export default function BaseLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" style={{ scrollbarGutter: "stable" }}>
			<body className="dark">
				<div className="mx-auto max-w-6xl p-4 sm:p-6">
					<InteractiveSessionProvider>
						<Navbar />

						{children}
					</InteractiveSessionProvider>
				</div>
			</body>
		</html>
	);
}
