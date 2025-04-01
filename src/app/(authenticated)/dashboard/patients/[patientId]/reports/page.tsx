import { getPatientById } from "@/actions/patient"
import { getReportsByPatientId } from "@/actions/report"
import { DataTable } from "@/components/reusable/DataTable"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateAge } from "@/lib/utils"
import { Patient, Report } from "@prisma/client"
import { Eye, FilePlus } from "lucide-react"
import Link from "next/link"
import { columns } from "./columns"

export default async function PatientReadingsPage({
  params
}: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params

  const patient: Patient | null = await getPatientById(patientId)

  if (!patient) {
    return (
      <>
        {pageBreadcrumbs(patientId, "Invalid")}

        <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-md border border-dashed text-center">
          <h3 className="font-semibold text-lg">Patient Not Found</h3>
          <p className="text-muted-foreground text-sm">
            The patient with the provided ID could not be found.
          </p>
        </div>
      </>
    )
  }

  const reports: Report[] = await getReportsByPatientId(patientId)

  if (reports.length === 0) {
    return (
      <>
        {pageBreadcrumbs(patientId, patient.name)}
        <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-md border border-dashed text-center">
          <h3 className="font-semibold text-lg">No Reports Found</h3>
          <p className="text-muted-foreground text-sm">
            {patient.name} does not have any reports generated yet. Generate a
            new report for any reading on the readings page.
          </p>
          <Button asChild>
            <Link href={`/dashboard/patients/${patientId}/readings`}>
              <Eye />
              Readings for {patient.name}
            </Link>
          </Button>
        </div>
      </>
    )
  }

  const latestReport: Report = reports.at(-1)

  return (
    <div className="container mx-auto">
      {pageBreadcrumbs(patientId, patient.name)}

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`}
              alt={patient.name}
            />
            <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-bold text-3xl">{patient.name}</h1>
            <p className="text-muted-foreground">
              Age: {calculateAge(patient.dob)} | Patient ID:{" "}
              {patient.id.slice(0, 6)}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/patients/${patientId}/readings/new`}>
            <FilePlus />
            New Reading
          </Link>
        </Button>
      </div>

      {latestReport && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Latest Report Summary</CardTitle>
            <p className="text-muted-foreground text-sm">
              Report ID: {latestReport.id.substring(0, 6)} | Generated on:{" "}
              {latestReport.createdAt.toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm">Summary</h4>
                <p className="text-muted-foreground text-sm">
                  {latestReport.summary}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Diagnosis</h4>
                <p className="text-muted-foreground text-sm">
                  {latestReport.diagnosis}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Recommendations</h4>
                <p className="text-muted-foreground text-sm">
                  {latestReport.recommendations}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Urgency Level</h4>
                <p className="text-muted-foreground text-sm">
                  {latestReport.urgencyLevel}
                </p>
              </div>
              {latestReport.additionalNotes && (
                <div>
                  <h4 className="font-semibold text-sm">Additional Notes</h4>
                  <p className="text-muted-foreground text-sm">
                    {latestReport.additionalNotes}
                  </p>
                </div>
              )}
              <Link href={`/patients/${patientId}/reports/${latestReport.id}`}>
                View Full Report
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <DataTable columns={columns} data={reports} />
    </div>
  )
}

function pageBreadcrumbs(patientId: string, patientName: string) {
  return (
    <Breadcrumb className="mb-8">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard/patients">Patients</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/dashboard/patients/${patientId}`}>{patientName}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Reports</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
