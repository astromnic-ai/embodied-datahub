import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileCode, Construction } from "lucide-react";
import Link from "next/link";

export default function ModelsPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center py-12">
          <div className="rounded-full bg-primary/10 p-4 mb-6">
            <Construction className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Models Coming Soon</h1>
          <p className="text-muted-foreground text-center mb-6">
            We&apos;re working on bringing you the best pre-trained models for
            embodied AI. Stay tuned!
          </p>
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <FileCode className="h-4 w-4" />
                Browse Datasets
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
