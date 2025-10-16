export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-2">Access Denied</h1>
      <p className="text-gray-600">
        You don’t have permission to view this page.
      </p>
      <a href="/" className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
        Go Home
      </a>
    </div>
  );
}
