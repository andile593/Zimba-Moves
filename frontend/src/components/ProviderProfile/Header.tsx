import { Edit, Loader2, Save, X } from "lucide-react";

export default function Header({
  isEditing,
  onEdit,
  onCancel,
  onSave,
  isSaving,
}: {
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
          Provider Profile
        </h1>
        <p className="text-lg text-gray-600">
          Manage your profile information and settings
        </p>
      </div>
      {!isEditing ? (
        <button
          onClick={onEdit}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all font-semibold shadow-lg hover:shadow-xl"
        >
          <Edit className="w-5 h-5" />
          <span>Edit Profile</span>
        </button>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
          >
            <X className="w-5 h-5" /> Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
