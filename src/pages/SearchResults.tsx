import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <SEOHead 
        title="Search Results - Terrazza Santa Chiara B&B Assisi"
        description="Find your perfect room at Terrazza Santa Chiara B&B in Assisi. Compare availability and prices for our luxury accommodations."
      />
      
      <div className="min-h-screen bg-background">
        <header className="bg-background border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-foreground">Search Results</h1>
            <p className="text-muted-foreground mt-2">Find your perfect accommodation</p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <h2 className="text-2xl font-semibold text-card-foreground mb-4">
                Results page working!
              </h2>
              <p className="text-muted-foreground mb-6">
                Search functionality will be implemented here
              </p>
              <Button 
                variant="default" 
                onClick={() => setIsLoading(!isLoading)}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Test Button"}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default SearchResults;