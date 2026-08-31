import PremiumTemplate from "./PremiumTemplate";
import { TemplateProps } from "./template-data";

export default function PrintTemplateBurgundy(props: TemplateProps) {
  return <PremiumTemplate {...props} accent="#881337" soft="#fff1f2" label="Burgundy Executive" />;
}
