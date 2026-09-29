import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MarkdownHighlightedCode } from "@/components/markdown-highlighted-code";

type MarkdownPreviewProps = {
  content: string;
};

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="markdown-preview break-words text-slate-900">
      <Markdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          code({ className, children }) {
            const language = /\blanguage-([\w+-]+)/.exec(className ?? "")?.[1];

            if (language) {
              return <MarkdownHighlightedCode code={String(children).replace(/\n$/, "")} language={language} />;
            }

            return <code className={className}>{children}</code>;
          }
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
