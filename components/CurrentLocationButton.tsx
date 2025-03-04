'use client';

interface CurrentLocationButtonProps {
  onClick: () => void;
}

export default function CurrentLocationButton({ onClick }: CurrentLocationButtonProps) {
  return (
    <button
      onClick={onClick}
      className="mx-auto block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      Use Current Location
    </button>
  );
}
