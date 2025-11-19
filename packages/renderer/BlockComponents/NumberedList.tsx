export default function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="r-ol">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ol>
  );
}
