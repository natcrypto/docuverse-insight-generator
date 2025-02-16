
import { Card } from "@/components/ui/card";
import { FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const DocumentLibrary = () => {
  return (
    <div className="w-full animate-in">
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search documents..."
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Example document card */}
        <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Research Paper.pdf
              </p>
              <p className="text-sm text-gray-500">Added 2 hours ago</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
