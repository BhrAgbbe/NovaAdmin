import type { ReactNode } from "react";
import { useMessages } from "@/Dictionary/messages";
import Modal from "@/Modals/Modal";

interface Props {
  readonly title: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}
export default function RecordFormModal({ title, onClose, children }: Props) {
  const { m } = useMessages();
  return (
    <Modal title={title} closeLabel={m.close} onClose={onClose} wide>
      {children}
    </Modal>
  );
}
