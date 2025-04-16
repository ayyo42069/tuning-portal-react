import LoadingSpinnerClient from "./LoadingSpinnerClient";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

// Server component wrapper
export default function LoadingSpinner({
  size = "md",
  message,
}: LoadingSpinnerProps) {
  return <LoadingSpinnerClient size={size} message={message} />;
}
