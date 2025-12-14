import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

type PreviewProps = {
  content: string;
};

export const PreviewMDX: React.FC<PreviewProps> = ({ content }) => {
  const formattedContent = content.replace(/\\/g, "").replace(/&#x20;/g, "");

  return (
    <section className="markdown prose wrap-break-word">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre({ children, ...props }) {
            return (
              <pre
                {...props}
                className="relative rounded-lg shadow-md overflow-x-auto"
              >
                {children}
              </pre>
            );
          },
          code({ className, children, ...props }) {
            return (
              <code {...props} className={`${className} block text-sm`}>
                {children}
              </code>
            );
          },
        }}
      >
        {formattedContent}
      </ReactMarkdown>
    </section>
  );
};
