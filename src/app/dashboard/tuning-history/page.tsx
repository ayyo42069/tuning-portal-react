import { fetchTuningFiles } from "@/lib/actions";
import TuningHistoryClient from "./TuningHistoryClient";

export default async function TuningHistory() {
  try {
    // Fetch data on the server
    const tuningFilesData = await fetchTuningFiles();
    
    return (
      <TuningHistoryClient initialData={tuningFilesData} />
    );
  } catch (error) {
    // Provide empty fallback data for static generation
    console.error("Failed to fetch tuning files:", error);
    return (
      <TuningHistoryClient initialData={{ tuningFiles: [] }} />
    );
  }
}
