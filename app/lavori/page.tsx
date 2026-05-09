import { ClipboardList, Plus } from "lucide-react";
import { JobsTable } from "@/components/shared/jobs-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const stages = [
  { label: "Da iniziare", count: 6 },
  { label: "In lavorazione", count: 11 },
  { label: "In attesa cliente", count: 4 },
  { label: "Pronti", count: 9 }
];

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lavori"
        description="Pianifica modifiche, riparazioni, confezioni su misura e urgenze di consegna."
        actions={
          <Button className="bg-amber-600 text-white hover:bg-amber-700">
            <Plus className="h-4 w-4" />
            Nuovo lavoro
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stages.map((stage) => (
          <Card key={stage.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-amber-100 text-amber-600">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stage.label}</p>
                <p className="text-2xl font-semibold">{stage.count}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <JobsTable />
    </div>
  );
}
