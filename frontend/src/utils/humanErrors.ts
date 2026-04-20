export function extractApiMessage(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message === "string"
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }
  return undefined;
}

export function toHumanError(message?: string, fallback = "Ocurrió un error inesperado. Intenta nuevamente."): string {
  if (!message) return fallback;
  const msg = message.toLowerCase();

  if (msg.includes("invalid credentials")) return "Usuario o contraseña incorrectos.";
  if (msg.includes("employee is inactive")) return "Tu usuario está inactivo. Contacta a RRHH.";
  if (msg.includes("company is not active")) return "Tu empresa está inactiva. Contacta a soporte.";
  if (msg.includes("employee limit reached")) return "La empresa alcanzó su límite de empleados.";
  if (msg.includes("document id already exists")) return "El DNI ya está registrado en esta empresa.";
  if (msg.includes("email already exists")) return "Ese correo ya está en uso.";
  if (msg.includes("location is required")) return "Debes activar la ubicación para registrar tu marcación.";
  if (msg.includes("outside the allowed area")) return "Estás fuera del radio permitido para marcar asistencia.";
  if (msg.includes("must check-in first")) return "Primero debes registrar tu ingreso.";
  if (msg.includes("already checked out")) return "Ya registraste tu salida.";
  if (msg.includes("already checked in")) return "Ya registraste tu ingreso.";
  if (msg.includes("request already reviewed")) return "Esta solicitud ya fue revisada.";
  if (msg.includes("request not found")) return "No se encontró la solicitud.";

  return message;
}
