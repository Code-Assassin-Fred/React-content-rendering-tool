export default function Example({ text }: { text: string }) {
  return (
    <div className="r-example">
      <div className="r-example-title">Example</div>
      <div className="r-example-body">{text}</div>
    </div>
  );
}
