import { Progress } from "@/Shared/Skeleton";
import styled from "styled-components";
import { useMessages } from "@/Dictionary/messages";
import Modal from "@/Modals/Modal";
import { Button } from "@/Shared/controls";

const ConfirmAction = styled(Button)`
  &[data-destructive="true"] {
    background: var(--error);
    color: var(--surface);
  }
`;

interface Props {
  readonly title: string;
  readonly detail?: string;
  readonly action: string;
  readonly busy?: boolean;
  readonly destructive?: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

export default function Confirm({
  title,
  detail,
  action,
  busy,
  destructive,
  onClose,
  onConfirm,
}: Props) {
  const { m } = useMessages();
  return (
    <Modal title={title} closeLabel={m.close} onClose={onClose} busy={busy}>
      {detail && <p>{detail}</p>}
      <div className="dialog-actions">
        <Button
          type="button"
          $kind="secondary"
          onClick={onClose}
          disabled={busy}
          data-initial-focus
        >
          {m.cancel}
        </Button>
        <ConfirmAction
          type="button"
          onClick={onConfirm}
          disabled={busy}
          data-destructive={destructive}
        >
          {busy && <Progress aria-hidden="true" />}
          {action}
        </ConfirmAction>
      </div>
    </Modal>
  );
}
