import { getSource } from "../lib/lookup";
import { ExternalLink } from "./Icons";

export function SourceLink({
  sourceId,
  children,
}: {
  sourceId: string;
  children?: React.ReactNode;
}) {
  const source = getSource(sourceId);
  return (
    <a
      className="source-link"
      href={source.url}
      target="_blank"
      rel="noreferrer"
    >
      {children ?? source.title}
      <ExternalLink />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
