import { CheckCircle, FileText } from "lucide-react";

export default function ProfileTips() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-lg">
        <FileText className="w-6 h-6" />
        Profile Tips
      </h3>
      <ul className="space-y-3 text-sm text-blue-800">
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
          <span>Keep your profile up to date for better visibility</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
          <span>Add a detailed bio to attract more customers</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
          <span>Complete your banking details to receive payments faster</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
          <span>Add vehicles to your fleet to receive more bookings</span>
        </li>
      </ul>
    </div>
  );
}
