import { useLocation, useNavigate } from "react-router-dom";
import { useMessages } from "@/Dictionary/messages";
import RecordFormModal from "@/Modals/RecordFormModal";
import { ROUTES, stateDialog } from "@/Routes/routes";
import CreateProductScreen from "@/Components/Records/CreateProductScreen";

export default function CreateProductPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { m } = useMessages();
  if (!stateDialog(state)) return <CreateProductScreen />;
  const close = () => navigate(ROUTES.products, { replace: true });
  return (
    <RecordFormModal title={m.addProduct} onClose={close}>
      <CreateProductScreen onComplete={close} />
    </RecordFormModal>
  );
}
