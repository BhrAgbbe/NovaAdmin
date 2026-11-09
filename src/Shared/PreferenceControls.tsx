import styled from "styled-components";
import { useAppDispatch, useAppSelector, setLocale, setMode } from "@/Redux/store";
import { writePreference } from "@/Storage/preferences";
import { useMessages } from "@/Dictionary/messages";
import { Button, IconButton } from "./controls";
import Icon from "./Icon";

const Controls = styled.div<{ $full: boolean }>`
  display:flex; flex-direction:({ $full }) => $full ? "row-reverse" : "row"; gap:8px; align-items:center;
`;
export default function PreferenceControls({ full = false }: { readonly full?: boolean }) {
  const { locale, m } = useMessages();
  const mode = useAppSelector((state) => state.preferences.mode);
  const dispatch = useAppDispatch();
  const nextLocale = locale === "fa" ? "en" : "fa";
  const nextMode = mode === "dark" ? "light" : "dark";

  return (
    <Controls $full={full}>
      <Button
        type="button"
        $kind="secondary"
        aria-label={m.changeLanguage}
        onClick={() => {
          writePreference("locale", nextLocale);
          dispatch(setLocale(nextLocale));
        }}
      >
        <Icon name="globe" size={18} />
        {full ? m.changeLanguage : nextLocale.toUpperCase()}
      </Button>
      <IconButton
        type="button"
        aria-label={m.changeTheme}
        aria-pressed={mode === "dark"}
        onClick={() => {
          writePreference("theme", nextMode);
          dispatch(setMode(nextMode));
        }}
      >
        <Icon name={mode === "dark" ? "sun" : "moon"} size={19} />
      </IconButton>
    </Controls>
  );
}
