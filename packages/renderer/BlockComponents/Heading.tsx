interface Props {
  level: number;
  text: string;
}

export default function Heading({ level, text }: Props) {
  const Tag = (`h${Math.min(level, 3)}` as any);
  return <Tag className={`r-heading r-h${level}`}>{text}</Tag>;
}
