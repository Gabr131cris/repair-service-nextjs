import Yellow from "./yellow";
import Blue from "./blue";
import Black from "./black";
import Emerald from "./emerald";
import Burgundy from "./burgundy";

const Templates = {
  yellow: Yellow,
  blue: Blue,
  black: Black,
  emerald: Emerald,
  burgundy: Burgundy,
};

export type TemplateName = keyof typeof Templates;

export default Templates;
