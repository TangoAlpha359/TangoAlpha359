import { useEffect, useState } from "react";
import GameCanvas from "./game/GameCanvas";
import {
  navigateToRoom,
  OPEN_PORTFOLIO_MODAL,
  OPEN_TURBOLIFT,
  ROOM_CHANGED,
  type PortfolioModalEvent,
  type PortfolioModalId,
  type RoomChangedEvent,
  type RoomId,
} from "./game/events";
import AboutModal from "./ui/AboutModal";
import ContactModal from "./ui/ContactModal";
import ProjectsModal from "./ui/ProjectsModal";

const destinations: Array<{ id: RoomId; label: string }> = [
  { id: "bridge", label: "Bridge" },
  { id: "mess-hall", label: "Mess Hall" },
  { id: "engineering", label: "Engineering" },
  { id: "ready-room", label: "Ready Room" },
];

export default function App() {
  const [activeModal, setActiveModal] = useState<PortfolioModalId | null>(null);
  const [isTurboliftOpen, setIsTurboliftOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<{ id: RoomId; label: string }>({
    id: "ready-room",
    label: "Ready Room",
  });

  useEffect(() => {
    const handleOpenModal = (event: Event) => {
      const modalEvent = event as PortfolioModalEvent;
      setIsTurboliftOpen(false);
      setActiveModal(modalEvent.detail.modal);
    };
    const handleOpenTurbolift = () => {
      setActiveModal(null);
      setIsTurboliftOpen(true);
    };
    const handleRoomChanged = (event: Event) => {
      const roomEvent = event as RoomChangedEvent;
      setActiveRoom({ id: roomEvent.detail.roomId, label: roomEvent.detail.label });
      setActiveModal(null);
      setIsTurboliftOpen(false);
    };

    window.addEventListener(OPEN_PORTFOLIO_MODAL, handleOpenModal);
    window.addEventListener(OPEN_TURBOLIFT, handleOpenTurbolift);
    window.addEventListener(ROOM_CHANGED, handleRoomChanged);
    return () => {
      window.removeEventListener(OPEN_PORTFOLIO_MODAL, handleOpenModal);
      window.removeEventListener(OPEN_TURBOLIFT, handleOpenTurbolift);
      window.removeEventListener(ROOM_CHANGED, handleRoomChanged);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveModal(null);
        setIsTurboliftOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <main>
      <GameCanvas />

      <div className="hud">
        <div className="brand-pill">{activeRoom.label.toUpperCase()}</div>
        <div className="hud-panel">
          <span>WASD / Arrows</span>
          <strong>Move</strong>
          <span>E</span>
          <strong>Interact</strong>
        </div>
      </div>

      <nav className="ship-nav" aria-label="Ship locations">
        {destinations.map((destination) => (
          <button
            key={destination.id}
            className={activeRoom.id === destination.id ? "active" : ""}
            type="button"
            onClick={() => navigateToRoom(destination.id)}
          >
            {destination.label}
          </button>
        ))}
      </nav>

      {activeModal === "about" && <AboutModal onClose={() => setActiveModal(null)} />}
      {activeModal === "projects" && <ProjectsModal onClose={() => setActiveModal(null)} />}
      {activeModal === "contact" && <ContactModal onClose={() => setActiveModal(null)} />}
      {isTurboliftOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="turbolift-panel" role="dialog" aria-modal="true" aria-labelledby="turbolift-title">
            <div className="turbolift-header">
              <p className="eyebrow">Turbolift Control</p>
              <h2 id="turbolift-title">Choose Destination</h2>
            </div>
            <div className="turbolift-grid">
              {destinations.map((destination) => (
                <button
                  key={destination.id}
                  type="button"
                  onClick={() => {
                    navigateToRoom(destination.id);
                    setIsTurboliftOpen(false);
                  }}
                >
                  {destination.label}
                </button>
              ))}
            </div>
            <button className="close-button" type="button" onClick={() => setIsTurboliftOpen(false)}>
              Close
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
