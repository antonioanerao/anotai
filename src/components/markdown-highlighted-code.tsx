import { Fragment, type ReactNode } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-markup-templating";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-python";
import "prismjs/components/prism-php";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";

type MarkdownHighlightedCodeProps = {
  code: string;
  language: string;
};

const MAX_HIGHLIGHT_LENGTH = 20_000;

function renderTokens(tokens: Prism.TokenStream): ReactNode {
  if (typeof tokens === "string") return tokens;

  if (Array.isArray(tokens)) {
    return tokens.map((token, index) => <Fragment key={index}>{renderTokens(token)}</Fragment>);
  }

  const aliases = tokens.alias ? (Array.isArray(tokens.alias) ? tokens.alias : [tokens.alias]) : [];

  return (
    <span className={["token", tokens.type, ...aliases].join(" ")}>
      {renderTokens(tokens.content)}
    </span>
  );
}

export function MarkdownHighlightedCode({ code, language }: MarkdownHighlightedCodeProps) {
  const grammar = Prism.languages[language.toLowerCase()];
  const highlighted = grammar && code.length <= MAX_HIGHLIGHT_LENGTH
    ? renderTokens(Prism.tokenize(code, grammar))
    : code;

  return <code className={`language-${language}`}>{highlighted}</code>;
}
