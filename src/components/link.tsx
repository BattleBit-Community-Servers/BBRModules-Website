import { forwardRef, type AnchorHTMLAttributes, type RefAttributes } from "react";
import { cn } from "../lib/utils";

export const BBLink = forwardRef<
	HTMLAnchorElement,
	RefAttributes<HTMLAnchorElement> & AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => {
	return (
		<a
			ref={ref}
			{...props}
			className={cn(
				"relative text-primary transition-colors hover:text-blue-600",
				"before:absolute before:bottom-0 before:left-0 before:right-0 before:h-0.5 before:w-full before:origin-center before:scale-0 before:bg-blue-600 before:transition-[transform] hover:before:scale-100",
				className,
			)}
		/>
	);
});

BBLink.displayName = "BBLink";
