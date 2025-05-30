"use client"

import { createReading } from "@/actions/reading"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { Reading } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

// Define the schema with string inputs first, then transform to numbers
const formSchema = z.object({
  height: z
    .union([z.string(), z.number()])
    .transform(value => (value === "" ? null : value))
    .nullable()
    .refine(value => value === null || !isNaN(Number(value)), {
      message: "Height must be a number"
    })
    .transform(value => (value === null ? null : Number(value))),
  weight: z
    .string()
    .transform(value => (value === "" ? null : value))
    .nullable()
    .refine(value => value === null || !isNaN(Number(value)), {
      message: "Weight must be a number"
    })
    .transform(val => (val === null ? null : Number(val))),
  temperature: z
    .string()
    .transform(value => (value === "" ? null : value))
    .nullable()
    .refine(value => value === null || !isNaN(Number(value)), {
      message: "Temperature must be a number"
    })
    .transform(val => (val === null ? null : Number(val))),
  heartRate: z
    .string()
    .transform(val => (val === null ? null : Number(val)))
    .nullable()
    .refine(value => value === null || !isNaN(Number(value)), {
      message: "Heart rate must be a number"
    })
    .transform(val => (val === null ? null : Number(val))),
  bpSystolic: z
    .string()
    .transform(value => (value === "" ? null : value))
    .nullable()
    .refine(value => value === null || !isNaN(Number(value)), {
      message: "Systolic pressure must be a number"
    })
    .transform(val => (val === null ? null : Number(val))),
  bpDiastolic: z
    .string()
    .transform(value => (value === "" ? null : value))
    .nullable()
    .refine(value => value === null || !isNaN(Number(value)), {
      message: "Diastolic pressure must be a number"
    })
    .transform(val => (val === null ? null : Number(val))),
  respiratoryRate: z
    .string()
    .transform(value => (value === "" ? null : value))
    .nullable()
    .refine(value => value === null || !isNaN(Number(value)), {
      message: "Respiratory rate must be a number"
    })
    .transform(val => (val === null ? null : Number(val))),
  glucoseLevel: z
    .string()
    .transform(value => (value === "" ? null : value))
    .nullable()
    .refine(value => value === null || !isNaN(Number(value)), {
      message: "Glucose level must be a number"
    })
    .transform(val => (val === null ? null : Number(val))),
  oxygenSaturation: z
    .string()
    .transform(value => (value === "" ? null : value))
    .nullable()
    .refine(
      value =>
        value === null ||
        (!isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100),
      {
        message: "Oxygen saturation must be a number between 0 and 100"
      }
    )
    .transform(val => (val === null ? null : Number(val))),
  notes: z.string().optional()
})

// Infer the type for our form
type FormValues = z.infer<typeof formSchema>

export function PatientReadingsForm({ patientId }: { patientId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // @ts-ignore
      temperature: "37",
      // @ts-ignore
      heartRate: "72",
      // @ts-ignore
      bpSystolic: "120",
      // @ts-ignore
      bpDiastolic: "80",
      // @ts-ignore
      oxygenSaturation: "98",
      notes: "",
      // @ts-ignore
      respiratoryRate: "",
      // @ts-ignore
      glucoseLevel: "",
      // @ts-ignore
      weight: "",
      // @ts-ignore
      height: ""
    }
  })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const readingData = {
          height: values.height,
          weight: values.weight,
          temperature: values.temperature,
          heartRate: values.heartRate,
          oxygenSaturation: values.oxygenSaturation,
          respiratoryRate: values.respiratoryRate,
          glucoseLevel: values.glucoseLevel,
          bpSystolic: values.bpSystolic,
          bpDiastolic: values.bpDiastolic,
          patientId: patientId,
          diagnosedFor: values.notes
        }

        const reading: Reading = await createReading(readingData)

        form.reset()

        toast.success("Reading submitted", {
          description:
            "The patient's medical reading has been saved successfully.",
          action: (
            <Button
              onClick={() =>
                router.push(`/dashboard/patients/${patientId}/readings/${reading.id}`)
              }
            >
              View
            </Button>
          )
        })
      } catch (error) {
        console.error("Error submitting patient reading:", error)
        toast.error("Error", {
          description: "There was a problem submitting the reading."
        })
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bpSystolic"
              disabled={isPending}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Pressure (Systolic)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="120" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bpDiastolic"
              disabled={isPending}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Pressure (Diastolic)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="80" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="heartRate"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heart Rate (bpm)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="temperature"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperature (°C)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="oxygenSaturation"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Oxygen Saturation (%)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="respiratoryRate"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Respiratory Rate (breaths/min)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="height"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height (cm)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="glucoseLevel"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Glucose Level (mg/dL)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clinical Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes or observations"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Optional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Reading"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
