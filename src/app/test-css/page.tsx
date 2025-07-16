export default function TestCSSPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Tailwind CSS Test</h1>
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Card Example</h2>
          <p className="text-gray-600">This should have Tailwind styling applied.</p>
          <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Test Button
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-500 text-white p-4 rounded">Red Box</div>
          <div className="bg-green-500 text-white p-4 rounded">Green Box</div>
          <div className="bg-blue-500 text-white p-4 rounded">Blue Box</div>
        </div>
      </div>
    </div>
  );
}