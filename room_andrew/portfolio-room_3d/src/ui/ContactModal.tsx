import ModalFrame from "./ModalFrame";

type Props = {
  onClose: () => void;
};

export default function ContactModal({ onClose }: Props) {
  return (
    <ModalFrame title="Contact" eyebrow="Open Channel" onClose={onClose}>
      <p>Put your preferred contact links here. These are ordinary anchors, so the game layer stays playful while the website stays practical.</p>
      <div className="contact-stack">
        <a href="mailto:hello@example.com">hello@example.com</a>
        <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a href="https://github.com/" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>
    </ModalFrame>
  );
}
