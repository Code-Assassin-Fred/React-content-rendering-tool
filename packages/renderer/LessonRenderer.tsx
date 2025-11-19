import { Block } from "@/packages/parser";
import Paragraph from "./BlockComponents/Paragraph";
import Heading from "./BlockComponents/Heading";
import BulletList from "./BlockComponents/BulletList";
import NumberedList from "./BlockComponents/NumberedList";
import Example from "./BlockComponents/Example";
import Note from "./BlockComponents/Note";
import ImageDescription from "./BlockComponents/ImageDescription";
import "./renderer.css";

interface Props {
  blocks: Block[];
}

export default function LessonRenderer({ blocks }: Props) {
  return (
    <div className="lesson-container">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "paragraph":
            return <Paragraph key={i} text={b.text} />;
          case "heading":
            return <Heading key={i} level={b.level} text={b.text} />;
          case "bullet_list":
            return <BulletList key={i} items={b.items} />;
          case "number_list":
            return <NumberedList key={i} items={b.items} />;
          case "example":
            return <Example key={i} text={b.text} />;
          case "note":
            return <Note key={i} text={b.text} />;
          case "image_description":
            return <ImageDescription key={i} text={b.text} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
