import { type CheckboxProps } from "@radix-ui/react-checkbox";
import Image from "next/image";
import Link from "next/link";
import { type AnchorHTMLAttributes, type ClassAttributes, type ImgHTMLAttributes } from "react";
import ReactMarkdown, { type ExtraProps } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { BBLink } from "./link";
import { Checkbox } from "./ui/checkbox";

const ImgurImage = ({
	node: _node,
	...props
}: ClassAttributes<HTMLImageElement> & ImgHTMLAttributes<HTMLImageElement> & ExtraProps) => {
	const imgurRegex = /^https:\/\/(?:i\.)?imgur\.com\/[a-zA-Z0-9]+\.(?:[a-zA-Z]{3,4})(?:\?.*)?$/;

	if (props.src && imgurRegex.test(props.src)) {
		return <Image src={props.src} alt={props.alt ?? ""} title={props.title} />;
	}

	return <span className="text-red-500">Only images hosted on imgur are allowed</span>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ExternalLink = ({
	node: _node,
	ref: _ref,
	href,
	...props
}: ClassAttributes<HTMLAnchorElement> & AnchorHTMLAttributes<HTMLAnchorElement> & ExtraProps) => {
	if (!href) return null;

	if (href.startsWith("http") || href.startsWith("//")) {
		return (
			<BBLink href={`/redirect?url=${encodeURIComponent(href)}`} target="_blank" rel="noopener noreferrer">
				{props.children}
			</BBLink>
		);
	}

	return (
		<Link
			{...props}
			href={href}
			className="relative text-primary transition-colors hover:text-blue-600 before:absolute before:bottom-0 before:left-0 before:right-0 before:h-0.5 before:w-full before:origin-center before:scale-0 before:bg-blue-600 before:transition-[transform] hover:before:scale-100"
		/>
	);
};

export const SanitizedMarkdown = ({ markdown }: { markdown: string }) => {
	return (
		<ReactMarkdown
			className="markdown"
			components={{
				img: ImgurImage,
				a: ExternalLink,
				code: ({ node: _node, className, children, ...props }) => {
					const match = /language-(\w+)/.exec(className ?? "");

					return match ? (
						<SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div">
							{String(children).replace(/\n$/, "")}
						</SyntaxHighlighter>
					) : (
						<code {...props} className={className}>
							{children}
						</code>
					);
				},
				input: ({ node: _node, ...props }) => {
					if (props.type === "checkbox") {
						return <Checkbox {...(props as CheckboxProps)} />;
					}

					return <input {...props} />;
				},
			}}
			remarkPlugins={[remarkGfm]}
			rehypePlugins={[rehypeSanitize, rehypeSlug]}
		>
			{markdown}
		</ReactMarkdown>
	);
};
