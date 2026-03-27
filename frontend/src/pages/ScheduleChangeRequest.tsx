import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function ScheduleChangeRequestPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard/history", { replace: true });
  }, [navigate]);

  return null;
}
