import { fetchTuningFiles } from "@/lib/actions";
import TuningHistoryClient from "./TuningHistoryClient";

export default async function TuningHistory() {
  // Fetch data on the server
  const tuningFilesData = await fetchTuningFiles();
  
  return (
    <TuningHistoryClient initialData={tuningFilesData} />
  );
}
