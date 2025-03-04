import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex justify-center mb-4">
      <Image
        src="/logo.svg"
        alt="Wetbulb Temperature Calculator Logo"
        width={80}
        height={80}
        priority
      />
    </div>
  );
}
