import { notFound } from "next/navigation";
import { use } from "react";
import TuningFileClient from "./TuningFileClient";

// Fetch tuning file details on the server
async function fetchTuningFileDetails(fileId: string) {
  // Need to use absolute URL for server-side fetching
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  // Make sure the URL has a protocol
  if (!baseUrl.startsWith('http')) {
    baseUrl = `https://${baseUrl}`;
  }
  
  const apiUrl = `${baseUrl}/api/tuning/file?id=${fileId}&ssr=true`;
  
  const response = await fetch(apiUrl, {
    next: { revalidate: 30 }, // Revalidate every 30 seconds
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error(`Failed to fetch tuning file: ${response.status}`);
  }

  const data = await response.json();
  return data.tuningFile;
}

// Fix params type by using the use() hook to unwrap Promise-based params
export default function TuningFileDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  // Use the use() hook to unwrap the Promise
  const params = use(props.params);
  
  // Validate the ID parameter
  if (!params.id || !/^\d+$/.test(params.id)) {
    notFound();
  }
  
  // Fetch data on the server
  const tuningFile = use(fetchTuningFileDetails(params.id));
  
  return <TuningFileClient tuningFile={tuningFile} />;
}
