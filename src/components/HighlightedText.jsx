export default function HighlightedText({ text, keywords }) {
  if (!keywords || keywords.length === 0) return <>{text}</>;

  let highlighted = text;
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    highlighted = highlighted.replace(
      regex,
      `<mark class="bg-yellow-200 px-1 rounded">$&</mark>`
    );
  });

  return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
}
