import Yellow from "./yellow";
import Blue from "./blue";
import Black from "./black";

const Templates = {
  yellow: Yellow,
  blue: Blue,
  black: Black,
};

export type TemplateName = keyof typeof Templates;

export default Templates;
