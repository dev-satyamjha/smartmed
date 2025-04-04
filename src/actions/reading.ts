"use server"

import { prisma } from "@/db/prisma"
import { Reading } from "@prisma/client"
import { revalidatePath } from "next/cache"

/**
 * Creates a new reading
 */
export async function createReading(
  readingData: Omit<Reading, "id" | "createdAt" | "updatedAt">
): Promise<Reading> {
  try {
    console.log("Creating reading with data:", readingData)
    const reading: Reading = await prisma.reading.create({
      data: readingData
    })

    revalidatePath(`/dashboard/patients/${readingData.patientId}`)
    revalidatePath(`/dashboard/patients/${readingData.patientId}/readings`)
    revalidatePath("/dashboard")

    return reading
  } catch (error) {
    console.error("Failed to create reading:", error)
    throw new Error("Failed to create reading")
  }
}

/**
 * Gets a reading by its ID
 */
export async function getReadingById(id: string): Promise<Reading | null> {
  try {
    const reading = await prisma.reading.findUnique({
      where: { id }
    })

    return reading
  } catch (error) {
    console.error("Failed to get reading by ID:", error)
    throw new Error("Failed to get reading")
  }
}

/**
 * Gets readings by patient ID
 */
export async function getReadingsByPatientId(
  patientId: string
): Promise<Reading[]> {
  try {
    const readings: Reading[] = await prisma.reading.findMany({
      where: { patientId },
      orderBy: {
        createdAt: "desc"
      }
    })

    return readings
  } catch (error) {
    console.error("Failed to get readings by patient ID:", error)
    throw new Error("Failed to get readings")
  }
}

/**
 * Gets the number of readings by patient ID
 */
export async function getNumReadingsByPatientId(
  patientId: string
): Promise<number> {
  try {
    const numReadings = await prisma.reading.count({
      where: { patientId }
    })

    return numReadings
  } catch (error) {
    console.error("Failed to get number of readings by patient ID:", error)
    throw new Error("Failed to get number of readings")
  }
}

/**
 * Gets the number of readings by doctor ID
 */
export async function getNumReadingsByDoctorId(
  doctorId: string
): Promise<number> {
  try {
    const numReadings = await prisma.reading.count({
      where: {
        patient: {
          doctorId
        }
      }
    })

    return numReadings
  } catch (error) {
    console.error("Failed to get number of readings by doctor ID:", error)
    throw new Error("Failed to get number of readings")
  }
}

/**
 * Deletes a reading by its ID
 */
export async function deleteReadingById(id: string): Promise<void> {
  let patientId: string | null = null
  try {
    const reading = await prisma.reading.findUnique({
      where: { id },
      select: { patientId: true } // Only select patientId
    })

    if (!reading) {
      console.warn(`Reading with ID ${id} not found for deletion.`)
      return
    }
    patientId = reading.patientId

    await prisma.reading.delete({
      where: { id }
    })

    revalidatePath(`/dashboard/patients/${patientId}`)
    revalidatePath(`/dashboard/patients/${patientId}/readings`)

    revalidatePath("/dashboard")
  } catch (error) {
    console.error("Failed to delete reading:", error)
    throw new Error("Failed to delete reading")
  }
}
