import PremiumTemplate from "./PremiumTemplate";
import { TemplateProps } from "./template-data";

export default function PrintTemplateEmerald(props: TemplateProps) {
  return <PremiumTemplate {...props} accent="#047857" soft="#ecfdf5" label="Emerald Professional" />;
}
