import ModalFrame from "./ModalFrame";

type Props = {
  onClose: () => void;
};

export default function AboutModal({ onClose }: Props) {
  return (
    <ModalFrame title="About Me" eyebrow="Personal Log" onClose={onClose}>
      <p>
        This is the first-room MVP: a Zelda-like portfolio where walking to consoles opens real web content. Replace
        this text with your bio, values, and the kind of work you want visitors to remember.
      </p>
      <div className="data-grid">
        <span>Role</span>
        <strong>Builder / Designer / Systems Thinker</strong>
        <span>Current Mission</span>
        <strong>Create a small, memorable interactive portfolio</strong>
        <span>Interaction</span>
        <strong>Walk with WASD or arrows, press E near consoles</strong>
      </div>
    </ModalFrame>
  );
}
