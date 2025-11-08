interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
}

/**
 * Component that highlights search query matches in text
 */
export default function HighlightedText({ text, query, className = '' }: HighlightedTextProps) {
  if (!query || !text) {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex characters in query
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  try {
    // Create case-insensitive regex to find all matches
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    const parts = text.split(regex);

    return (
      <span className={className}>
        {parts.map((part, index) => {
          // Check if this part matches the query (case-insensitive)
          const isMatch = part.toLowerCase() === query.toLowerCase();

          return isMatch ? (
            <mark
              key={index}
              className="bg-yellow-200 dark:bg-yellow-700 text-foreground font-semibold px-0.5 rounded"
            >
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          );
        })}
      </span>
    );
  } catch (error) {
    // If regex fails, return original text
    return <span className={className}>{text}</span>;
  }
}
