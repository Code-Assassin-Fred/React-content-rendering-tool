export default function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="r-ul">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}
