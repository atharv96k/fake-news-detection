// HighlightedText.jsx
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); 
}

export default function HighlightedText({ text, keywords }) {
  let highlightedText = text;

  keywords.forEach((keyword) => {
    if (!keyword) return;

    // Escape keyword properly
    const safeKeyword = escapeRegex(keyword);
    const regex = new RegExp(`\\b${safeKeyword}\\b`, "gi");

    highlightedText = highlightedText.replace(regex, (match) => {
      return `<mark class="bg-yellow-200">${match}</mark>`;
    });
  });

  return (
    <span
      dangerouslySetInnerHTML={{ __html: highlightedText }}
    />
  );
}
