export type PortfolioModalId = "about" | "projects" | "contact";
export type RoomId = "ready-room" | "bridge" | "mess-hall" | "engineering" | "corridor";

export type PortfolioModalEvent = CustomEvent<{
  modal: PortfolioModalId;
}>;

export type NavigateRoomEvent = CustomEvent<{
  roomId: RoomId;
}>;

export type RoomChangedEvent = CustomEvent<{
  roomId: RoomId;
  label: string;
}>;

export const OPEN_PORTFOLIO_MODAL = "portfolio:open-modal";
export const OPEN_TURBOLIFT = "portfolio:open-turbolift";
export const NAVIGATE_TO_ROOM = "portfolio:navigate-room";
export const ROOM_CHANGED = "portfolio:room-changed";

export function openPortfolioModal(modal: PortfolioModalId) {
  window.dispatchEvent(
    new CustomEvent(OPEN_PORTFOLIO_MODAL, {
      detail: { modal },
    }),
  );
}

export function openTurbolift() {
  window.dispatchEvent(new CustomEvent(OPEN_TURBOLIFT));
}

export function navigateToRoom(roomId: RoomId) {
  window.dispatchEvent(
    new CustomEvent(NAVIGATE_TO_ROOM, {
      detail: { roomId },
    }),
  );
}

export function announceRoomChanged(roomId: RoomId, label: string) {
  window.dispatchEvent(
    new CustomEvent(ROOM_CHANGED, {
      detail: { roomId, label },
    }),
  );
}
