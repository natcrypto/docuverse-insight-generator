
import { FileUpload } from "@/components/FileUpload";
import { DocumentLibrary } from "@/components/DocumentLibrary";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container px-4 py-8 mx-auto">
        <header className="text-center mb-12 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
            Document Insights
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your documents and discover deep insights through advanced analysis
          </p>
        </header>

        <section className="mb-12">
          <FileUpload />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Your Documents</h2>
          <DocumentLibrary />
        </section>
      </div>
    </div>
  );
};

export default Index;
