import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownPreviewProps = {
  content: string;
};

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="markdown-preview break-words text-slate-900">
      <Markdown remarkPlugins={[remarkGfm]} skipHtml>
        {content}
      </Markdown>
    </div>
  );
}
