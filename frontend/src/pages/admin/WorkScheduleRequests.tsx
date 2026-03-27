import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Check, X, RefreshCw, MessageSquare, AlertTriangle } from "lucide-react";
import { workScheduleChangeService } from "../../services/workScheduleChange";
import type { AttendanceCorrectionRequest, AttendanceCorrectionStatus } from "../../types/workScheduleChange";

type ReviewAction = "approve" | "reject";

const markLabels: Record<AttendanceCorrectionRequest["markType"], string> = {
  checkIn: "Ingreso",
  lunchStart: "Inicio almuerzo",
  lunchEnd: "Fin almuerzo",
  checkOut: "Salida",
};

export function WorkScheduleRequestsPage() {
  const [tab, setTab] = useState<AttendanceCorrectionStatus>("pending");
  const [rows, setRows] = useState<AttendanceCorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<{ request: AttendanceCorrectionRequest; action: ReviewAction } | null>(null);
  const [finalConfirm, setFinalConfirm] = useState<{ request: AttendanceCorrectionRequest; action: ReviewAction } | null>(null);
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const load = async (status: AttendanceCorrectionStatus) => {
    setLoading(true);
    try {
      const data = await workScheduleChangeService.listCompany(status);
      setRows(data);
    } catch (e) {
      console.error(e);
      alert("No se pudo cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(tab);
  }, [tab]);

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "-";
    try {
      return format(parseISO(iso), "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return iso;
    }
  };

  const extractApiMessage = (error: unknown): string | undefined => {
    if (typeof error !== "object" || !error) return undefined;
    if (!("response" in error)) return undefined;
    const response = (error as { response?: unknown }).response;
    if (typeof response !== "object" || !response) return undefined;
    if (!("data" in response)) return undefined;
    const data = (response as { data?: unknown }).data;
    if (typeof data !== "object" || !data) return undefined;
    if (!("message" in data)) return undefined;
    const message = (data as { message?: unknown }).message;
    return typeof message === "string" ? message : undefined;
  };

  const openReview = (request: AttendanceCorrectionRequest, action: ReviewAction) => {
    setReviewing({ request, action });
    setComment("");
  };

  const closeReview = () => {
    if (isSaving) return;
    setReviewing(null);
    setComment("");
  };

  const handleConfirm = () => {
    if (!reviewing) return;
    if (isSaving) return;
    setFinalConfirm(reviewing);
  };

  const closeFinalConfirm = () => {
    if (isSaving) return;
    setFinalConfirm(null);
  };

  const handleFinalConfirm = async () => {
    if (!finalConfirm) return;
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (finalConfirm.action === "approve") {
        await workScheduleChangeService.approve(finalConfirm.request.id, comment.trim() ? comment.trim() : undefined);
      } else {
        await workScheduleChangeService.reject(finalConfirm.request.id, comment.trim() ? comment.trim() : undefined);
      }
      setFinalConfirm(null);
      closeReview();
      await load(tab);
    } catch (err: unknown) {
      console.error(err);
      alert(extractApiMessage(err) || "No se pudo guardar la revisión");
    } finally {
      setIsSaving(false);
    }
  };

  const title = tab === "pending" ? "Solicitudes pendientes" : tab === "approved" ? "Historial aprobadas" : "Historial rechazadas";

  const sortedRows = useMemo(() => rows, [rows]);

  const formatDateOnly = (iso?: string | null) => {
    if (!iso) return "-";
    try {
      return format(parseISO(iso), "dd/MM/yyyy", { locale: es });
    } catch {
      return iso;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Correcciones de marcación</h1>
          <p className="text-gray-500 text-sm">RRHH aprueba o rechaza y queda historial no modificable</p>
        </div>
        <button
          onClick={() => load(tab)}
          disabled={loading}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-60"
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 pt-6 flex items-center gap-2">
          <button
            onClick={() => setTab("pending")}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              tab === "pending" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setTab("approved")}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              tab === "approved" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Aprobadas
          </button>
          <button
            onClick={() => setTab("rejected")}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              tab === "rejected" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Rechazadas
          </button>
        </div>

        <div className="px-6 pb-6 pt-3 border-b border-gray-100 text-sm text-gray-600">{title}</div>

        {loading && <div className="p-6 text-gray-500">Cargando...</div>}
        {!loading && sortedRows.length === 0 && <div className="p-6 text-gray-500">No hay solicitudes.</div>}
        {!loading && sortedRows.length > 0 && (
          <>
            <div className="sm:hidden space-y-3 p-4">
              {sortedRows.map((r) => (
                <div key={r.id} className="border border-gray-200 rounded-lg bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-500">{formatDateTime(r.createdAt)}</div>
                    <div className="text-sm text-gray-700">{formatDateOnly(r.attendance?.date)}</div>
                  </div>
                  <div className="text-gray-800 text-sm space-y-1">
                    <div className="font-medium">
                      {r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : r.employeeId}
                    </div>
                    {r.employee?.email && <div className="text-xs text-gray-500">{r.employee.email}</div>}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Marcación</span>
                      <span className="font-medium">{markLabels[r.markType]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">De</span>
                      <span className="font-medium">{(r.previousTimeApplied ?? r.previousTimeAtRequest) || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">A</span>
                      <span className="font-semibold">{r.requestedTime}</span>
                    </div>
                    <div>
                      <div className="text-gray-500">Motivo</div>
                      <div className="text-xs text-gray-700">{r.reason}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Revisión</div>
                      <div className="text-xs text-gray-700">{formatDateTime(r.reviewedAt)}</div>
                      {r.reviewedByUser?.name && <div className="text-xs text-gray-500">{r.reviewedByUser.name}</div>}
                      {r.reviewComment && <div className="text-xs text-gray-500">{r.reviewComment}</div>}
                    </div>
                  </div>
                  {tab === "pending" && (
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => openReview(r, "approve")}
                        className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                      >
                        <Check size={16} />
                        Aprobar
                      </button>
                      <button
                        onClick={() => openReview(r, "reject")}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                      >
                        <X size={16} />
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3">Empleado</th>
                    <th className="text-left px-4 py-3">Creada</th>
                    <th className="text-left px-4 py-3">Fecha</th>
                    <th className="text-left px-4 py-3">Marcación</th>
                    <th className="text-left px-4 py-3">De</th>
                    <th className="text-left px-4 py-3">A</th>
                    <th className="text-left px-4 py-3">Motivo</th>
                    <th className="text-left px-4 py-3">Revisión</th>
                    {tab === "pending" && <th className="text-right px-4 py-3">Acción</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedRows.map((r) => (
                    <tr key={r.id} className="bg-white">
                      <td className="px-4 py-3 text-gray-800">
                        <div className="font-medium">
                          {r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : r.employeeId}
                        </div>
                        {r.employee?.email && <div className="text-xs text-gray-500">{r.employee.email}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{formatDateTime(r.createdAt)}</td>
                      <td className="px-4 py-3 text-gray-700">{formatDateOnly(r.attendance?.date)}</td>
                      <td className="px-4 py-3 text-gray-700">{markLabels[r.markType]}</td>
                      <td className="px-4 py-3 text-gray-700">{(r.previousTimeApplied ?? r.previousTimeAtRequest) || "-"}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{r.requestedTime}</td>
                      <td className="px-4 py-3 text-gray-700">{r.reason}</td>
                      <td className="px-4 py-3 text-gray-700">
                        <div className="space-y-1">
                          <div>{formatDateTime(r.reviewedAt)}</div>
                          {r.reviewedByUser?.name && <div className="text-xs text-gray-500">{r.reviewedByUser.name}</div>}
                          {r.reviewComment && <div className="text-xs text-gray-500">{r.reviewComment}</div>}
                        </div>
                      </td>
                      {tab === "pending" && (
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openReview(r, "approve")}
                              className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                            >
                              <Check size={16} />
                              Aprobar
                            </button>
                            <button
                              onClick={() => openReview(r, "reject")}
                              className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                            >
                              <X size={16} />
                              Rechazar
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {reviewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={closeReview} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-100">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {reviewing.action === "approve" ? "Aprobar solicitud" : "Rechazar solicitud"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {reviewing.request.employee
                      ? `${reviewing.request.employee.firstName} ${reviewing.request.employee.lastName}`
                      : reviewing.request.employeeId}{" "}
                    · {formatDateOnly(reviewing.request.attendance?.date)} · {markLabels[reviewing.request.markType]} · {reviewing.request.requestedTime}
                  </p>
                </div>
                <button onClick={closeReview} disabled={isSaving} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-gray-700 block flex items-center gap-2">
                  <MessageSquare size={16} />
                  Comentario (opcional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeReview}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSaving}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-60 ${
                  reviewing.action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {reviewing.action === "approve" ? "Aprobar" : "Rechazar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {finalConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={closeFinalConfirm} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-100">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={finalConfirm.action === "approve" ? "text-amber-500 mt-0.5" : "text-red-500 mt-0.5"} size={20} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {finalConfirm.action === "approve" ? "Confirmar aprobación" : "Confirmar rechazo"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {finalConfirm.request.employee
                        ? `${finalConfirm.request.employee.firstName} ${finalConfirm.request.employee.lastName}`
                        : finalConfirm.request.employeeId}{" "}
                      · {formatDateOnly(finalConfirm.request.attendance?.date)} · {markLabels[finalConfirm.request.markType]}
                    </p>
                  </div>
                </div>
                <button onClick={closeFinalConfirm} disabled={isSaving} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                {finalConfirm.action === "approve" ? (
                  <div>
                    Esto <span className="font-semibold">actualizará la asistencia</span> (no reversible) cambiando <span className="font-semibold">{markLabels[finalConfirm.request.markType]}</span> de <span className="font-semibold">{(finalConfirm.request.previousTimeApplied ?? finalConfirm.request.previousTimeAtRequest) || "-"}</span> a <span className="font-semibold">{finalConfirm.request.requestedTime}</span>.
                  </div>
                ) : (
                  <div>
                    Esto <span className="font-semibold">no modificará la asistencia</span>. La solicitud quedará rechazada y se guardará en el historial.
                  </div>
                )}
                {comment.trim() ? <div className="mt-2 text-xs text-gray-500">Comentario: {comment.trim()}</div> : null}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeFinalConfirm}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleFinalConfirm}
                disabled={isSaving}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-60 ${
                  finalConfirm.action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isSaving ? "Guardando..." : finalConfirm.action === "approve" ? "Sí, aprobar" : "Sí, rechazar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
