import type { ReactNode } from "react";

type ModalFrameProps = {
  title: string;
  eyebrow: string;
  children: ReactNode;
  onClose: () => void;
};

export default function ModalFrame({ title, eyebrow, children, onClose }: ModalFrameProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="lcars-modal" role="dialog" aria-modal="true" aria-labelledby="portfolio-modal-title">
        <div className="lcars-rail" />
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <p className="eyebrow">{eyebrow}</p>
              <h2 id="portfolio-modal-title">{title}</h2>
            </div>
            <button className="close-button" type="button" onClick={onClose} aria-label="Close modal">
              Close
            </button>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
