export default function Disclaimer() {
  return (
    <div className="mt-8 text-center text-sm text-gray-500 px-4">
      <p className="mb-2">
        Disclaimer: The wet-bulb temperatures shown are estimates calculated using the Stull formula.
        For more information about wet-bulb temperature calculations, visit{' '}
        <a
          href="https://www.omnicalculator.com/physics/wet-bulb"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 underline"
        >
          Omni Calculator&apos;s Wet-Bulb Temperature Calculator
        </a>
        .
      </p>
    </div>
  );
}
