import { AnimatePresence } from "motion/react";
import { Modal } from "./modal";
import FullPageImage from "~/app/components/full-image-page";
import { MotionDiv } from "~/components/ui/MotionDiv";

type Params = Promise<{ id: string }>;
export default async function PhotoModal({ params }: { params: Params }) {
  const { id: photoId } = await params;
  const idAsNumber = Number(photoId);
  if (Number.isNaN(idAsNumber)) throw new Error("Invalid photo id");
  return (
    <AnimatePresence>
      {photoId && (
        <Modal key="photo-modal">
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ pointerEvents: "auto" }}
            className="overlay"
          >
            <FullPageImage id={idAsNumber} />
          </MotionDiv>
        </Modal>
      )}
    </AnimatePresence>
  );
}
