"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AddDeviceModal from "./AddDeviceModal";

interface AddDeviceContentProps {
  onDeviceAdded: () => void;
}

export default function AddDeviceContent({ onDeviceAdded }: AddDeviceContentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    onDeviceAdded();
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn-ghost shrink-0 gap-2 text-sm"
        title="Add device with activation code"
      >
        <Plus size={14} />
        Add Device
      </button>

      <AddDeviceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
