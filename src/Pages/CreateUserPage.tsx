import { useLocation, useNavigate } from "react-router-dom";
import { useMessages } from "@/Dictionary/messages";
import RecordFormModal from "@/Modals/RecordFormModal";
import { ROUTES, stateDialog } from "@/Routes/routes";
import CreateUserScreen from "@/Components/Records/CreateUserScreen";

export default function CreateUserPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { m } = useMessages();
  if (!stateDialog(state)) return <CreateUserScreen />;
  const close = () => navigate(ROUTES.users, { replace: true });
  return (
    <RecordFormModal title={m.addUser} onClose={close}>
      <CreateUserScreen onComplete={close} />
    </RecordFormModal>
  );
}
