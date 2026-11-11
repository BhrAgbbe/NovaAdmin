import styled from "styled-components";

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding-inline: 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 650;
  background: #eceff4;
  color: #25354d;
  &[data-category="electronics"] {
    background: #dceeff;
    color: #18436c;
  }
  &[data-category="apparel"] {
    background: #f9e5d8;
    color: #75381b;
  }
  &[data-category="jewelry"] {
    background: #ece3fa;
    color: #52307c;
  }
  [data-theme="dark"] & {
    background: #2c3951;
    color: #edf1fa;
  }
  [data-theme="dark"] &[data-category="electronics"] {
    background: #223f60;
    color: #cde6ff;
  }
  [data-theme="dark"] &[data-category="apparel"] {
    background: #51372c;
    color: #ffd9bd;
  }
  [data-theme="dark"] &[data-category="jewelry"] {
    background: #423358;
    color: #eadbff;
  }
`;
function badgeTone(category: string) {
  if (category === "jewelery") return "jewelry";
  if (category.endsWith("clothing")) return "apparel";
  return category;
}

export default function CategoryBadge({
  category,
  label,
  className,
}: {
  readonly category: string;
  readonly label: string;
  readonly className?: string;
}) {
  const tone = badgeTone(category);
  return (
    <Badge className={className} data-category={tone}>
      {label}
    </Badge>
  );
}
