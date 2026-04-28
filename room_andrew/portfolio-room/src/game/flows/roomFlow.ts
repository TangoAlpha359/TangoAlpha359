import { announceRoomChanged, NAVIGATE_TO_ROOM, type NavigateRoomEvent, type RoomId } from "../events";
import { loadRoom } from "../repo/roomRepo";

export function loadActiveRoom(roomId: RoomId) {
  const room = loadRoom(roomId);
  announceRoomChanged(room.id, room.label);
  return room;
}

export function bindRoomNavigation(scene: Phaser.Scene) {
  const handleNavigateRoom = (event: Event) => {
    const roomEvent = event as NavigateRoomEvent;
    scene.scene.restart({ roomId: roomEvent.detail.roomId });
  };

  window.addEventListener(NAVIGATE_TO_ROOM, handleNavigateRoom);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    window.removeEventListener(NAVIGATE_TO_ROOM, handleNavigateRoom);
  });
}
