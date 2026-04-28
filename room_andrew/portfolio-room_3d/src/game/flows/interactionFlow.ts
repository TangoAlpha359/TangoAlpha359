import { navigateToRoom, openPortfolioModal, openTurbolift } from "../events";
import type { InteractionAction } from "../repo/roomRepo";

export function runInteractionAction(action: InteractionAction) {
  if (action.type === "openModal") {
    openPortfolioModal(action.modal);
    return;
  }

  if (action.type === "navigate") {
    navigateToRoom(action.roomId);
    return;
  }

  openTurbolift();
}
