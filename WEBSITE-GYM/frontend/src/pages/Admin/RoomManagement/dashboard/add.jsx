import RoomForm from "./RoomForm";

export default function AddRoom() {
  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <RoomForm mode="add" />
      </div>
    </div>
  );
}