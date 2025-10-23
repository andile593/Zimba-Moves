export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 to-green-50">
      <div className=" p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}