import Modal from "./modal";
import { Button } from "./button";

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}


const SaveModal = ({isOpen,onClose,onConfirm,loading}: SaveModalProps   
) => {
  return <Modal
  title="Are you sure?"
  description="This action cannot be undone you can't edit or re-answer this "
  isOpen={isOpen}
  onClose={onClose}
  >
  <div className="pt-6 space-x-2 flex items-center justify-end w-full">
    <Button disabled={loading} onClick={onClose} variant="outline">
        Cancel
    </Button>
    <Button disabled={loading} onClick={onConfirm} className="bg-emerald-600 hover:bg-emerald-800"> Continue</Button>
  </div>
  </Modal>
}

export default SaveModal
