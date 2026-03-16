import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Save, X } from 'lucide-react';
import { superAdminService, type CompanyUser, type ImportEmployeeRow, type ImportEmployeesResult } from '../../services/superadmin';

export function EditCompany() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    maxEmployees: 10,
    status: 'active'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [importRows, setImportRows] = useState<ImportEmployeeRow[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportEmployeesResult | null>(null);
  const [importText, setImportText] = useState('');

  useEffect(() => {
    if (id) {
      loadCompany(id);
    }
  }, [id]);

  const loadCompany = async (companyId: string) => {
    try {
      const [company, users] = await Promise.all([
        superAdminService.getCompany(companyId),
        superAdminService.listCompanyUsers(companyId)
      ]);
      setFormData({
        name: company.name,
        maxEmployees: company.maxEmployees,
        status: company.status
      });
      setCompanyUsers(users);
    } catch (err) {
      console.error(err);
      setError('Error al cargar la empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setError('');
    setSaving(true);

    try {
      await superAdminService.updateCompany(id, {
        name: formData.name,
        maxEmployees: formData.maxEmployees,
        status: formData.status as 'active' | 'inactive' | 'suspended'
      });
      navigate('/superadmin/companies');
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message || 'Error al actualizar la empresa');
    } finally {
      setSaving(false);
    }
  };

  const parseCsvRows = (text: string) => {
    const input = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      if (ch === '"') {
        if (inQuotes && input[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (!inQuotes && (ch === ',' || ch === ';')) {
        row.push(cell.trim());
        cell = '';
        continue;
      }
      if (!inQuotes && ch === '\n') {
        row.push(cell.trim());
        if (row.some((v) => v.length > 0)) rows.push(row);
        row = [];
        cell = '';
        continue;
      }
      cell += ch;
    }
    row.push(cell.trim());
    if (row.some((v) => v.length > 0)) rows.push(row);
    return rows;
  };

  const normalizeHeader = (h: string) =>
    h
      .trim()
      .toLowerCase()
      .replaceAll(' ', '')
      .replaceAll('_', '')
      .replaceAll('-', '');

  const buildEmployeesFromParsed = (table: string[][]) => {
    const errors: string[] = [];
    if (table.length < 2) {
      setImportRows([]);
      setImportErrors(['El archivo no tiene filas suficientes']);
      return;
    }

    const header = table[0].map(normalizeHeader);
    const getIdx = (candidates: string[]) => header.findIndex((h) => candidates.includes(h));

    const idxEmail = getIdx(['email', 'correo', 'correoelectronico']);
    const idxFirst = getIdx(['firstname', 'nombres', 'nombre']);
    const idxLast = getIdx(['lastname', 'apellidos', 'apellido']);
    const idxDept = getIdx(['department', 'puesto', 'cargo', 'area', 'departamento']);
    const idxJoin = getIdx(['joindate', 'fechaingreso', 'ingreso']);
    const idxBirth = getIdx(['birthdate', 'fechanacimiento', 'nacimiento']);
    const idxBiz = getIdx(['businessname', 'razonsocial']);
    const idxWorkplace = getIdx(['workplace', 'lugardetrabajo', 'sede']);
    const idxPassword = getIdx(['password', 'contrasena', 'contraseña']);

    const required = [
      { idx: idxEmail, label: 'email' },
      { idx: idxFirst, label: 'firstName' },
      { idx: idxLast, label: 'lastName' },
      { idx: idxDept, label: 'department' },
      { idx: idxJoin, label: 'joinDate' },
    ];

    const missingRequired = required.filter((r) => r.idx < 0).map((r) => r.label);
    if (missingRequired.length > 0) {
      setImportRows([]);
      setImportErrors([`Faltan columnas requeridas: ${missingRequired.join(', ')}`]);
      return;
    }

    const out: ImportEmployeeRow[] = [];
    for (let r = 1; r < table.length; r++) {
      const line = table[r];
      const rowNum = r + 1;

      const email = (line[idxEmail] || '').trim();
      const firstName = (line[idxFirst] || '').trim();
      const lastName = (line[idxLast] || '').trim();
      const department = (line[idxDept] || '').trim();
      const joinDate = (line[idxJoin] || '').trim();

      if (!email || !firstName || !lastName || !department || !joinDate) {
        errors.push(`Fila ${rowNum}: faltan datos requeridos`);
        continue;
      }

      const birthDate = idxBirth >= 0 ? (line[idxBirth] || '').trim() : '';
      const businessName = idxBiz >= 0 ? (line[idxBiz] || '').trim() : '';
      const workplace = idxWorkplace >= 0 ? (line[idxWorkplace] || '').trim() : '';
      const password = idxPassword >= 0 ? (line[idxPassword] || '').trim() : '';

      out.push({
        email,
        firstName,
        lastName,
        department,
        joinDate,
        birthDate: birthDate || undefined,
        businessName: businessName || undefined,
        workplace: workplace || undefined,
        password: password || undefined,
      });
    }

    setImportRows(out);
    setImportErrors(errors);
  };

  const handleImportRawText = async (raw: string, fileName?: string) => {
    setImportResult(null);
    setImportErrors([]);
    setImportRows([]);

    const text = raw.trim();
    if (!text) {
      setImportErrors(['Pega contenido CSV o JSON']);
      return;
    }

    const looksJson = text.startsWith('[') || text.startsWith('{') || (fileName ? fileName.toLowerCase().endsWith('.json') : false);

    if (looksJson) {
      try {
        const parsed = JSON.parse(text) as unknown;
        if (Array.isArray(parsed)) {
          setImportRows(parsed as ImportEmployeeRow[]);
          return;
        }
        if (
          typeof parsed === 'object' &&
          parsed &&
          'employees' in parsed &&
          Array.isArray((parsed as { employees?: unknown }).employees)
        ) {
          setImportRows((parsed as { employees: ImportEmployeeRow[] }).employees);
          return;
        }
        setImportErrors(['El JSON debe ser un array de empleados']);
        return;
      } catch {
        setImportErrors(['JSON inválido']);
        return;
      }
    }

    const table = parseCsvRows(text);
    buildEmployeesFromParsed(table);
  };

  const handleImportFile = async (file: File) => {
    const text = await file.text();
    await handleImportRawText(text, file.name);
  };

  if (loading) return <div className="p-8 text-center">Cargando datos...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Editar Empresa</h1>
        <button
          onClick={() => navigate('/superadmin/companies')}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Empresa
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Límite de Empleados
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.maxEmployees}
                onChange={(e) => setFormData({ ...formData, maxEmployees: Number(e.target.value) })}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Cantidad máxima de empleados que esta empresa podrá registrar.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
                <option value="suspended">Suspendida (30 días)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/superadmin/companies')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Save size={18} />
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Importar empleados</h2>
          <span className="text-sm text-gray-500">{importRows.length}</span>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Sube un archivo CSV o JSON. Requerido: email, firstName, lastName, department, joinDate (YYYY-MM-DD). Opcional: birthDate, businessName, workplace, password.
          </div>

          <div className="space-y-2">
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Pega aquí el contenido CSV o JSON"
              rows={6}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={async () => {
                  await handleImportRawText(importText);
                }}
                className="px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
              >
                Cargar desde texto
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportText('');
                  setImportRows([]);
                  setImportErrors([]);
                  setImportResult(null);
                }}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg"
              >
                Limpiar
              </button>
            </div>
          </div>

          <input
            type="file"
            accept=".csv,.json,text/csv,application/json"
            onChange={async (e) => {
              const f = e.target.files?.[0] || null;
              if (f) await handleImportFile(f);
            }}
            className="block w-full text-sm text-gray-700"
          />

          {importErrors.length > 0 && (
            <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm space-y-1">
              {importErrors.slice(0, 6).map((m, idx) => (
                <div key={idx}>{m}</div>
              ))}
              {importErrors.length > 6 && <div>... y {importErrors.length - 6} más</div>}
            </div>
          )}

          {importResult && (
            <div className="bg-green-50 text-green-800 p-3 rounded-lg text-sm space-y-1">
              <div>Creado: {importResult.createdCount}</div>
              <div>Omitido: {importResult.skippedCount}</div>
              {importResult.skippedCount > 0 && (
                <div className="text-green-900/80">
                  {importResult.skipped.slice(0, 4).map((s, idx) => (
                    <div key={idx}>
                      #{s.index + 1} {s.email || ''} - {s.reason}
                    </div>
                  ))}
                  {importResult.skipped.length > 4 && <div>... y {importResult.skipped.length - 4} más</div>}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={!id || importing || importRows.length === 0}
              onClick={async () => {
                if (!id) return;
                setError('');
                setImportResult(null);
                try {
                  setImporting(true);
                  const result = await superAdminService.importEmployees(id, importRows);
                  setImportResult(result);
                } catch (err: unknown) {
                  const message =
                    typeof err === 'object' && err && 'response' in err
                      ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                      : undefined;
                  setError(message || 'Error al importar empleados');
                } finally {
                  setImporting(false);
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {importing ? 'Importando...' : 'Importar'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Usuarios RRHH</h2>
          <span className="text-sm text-gray-500">{companyUsers.length}</span>
        </div>

        {companyUsers.length === 0 ? (
          <div className="text-sm text-gray-600">No hay usuarios RRHH registrados en esta empresa.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {companyUsers.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{u.name}</div>
                  <div className="text-sm text-gray-600 truncate">{u.email}</div>
                </div>
                <button
                  type="button"
                  disabled={!id || resettingUserId === u.id}
                  onClick={async () => {
                    if (!id) return;
                    setError('');
                    const password = window.prompt('Nueva contraseña (mínimo 8 caracteres):');
                    if (!password) return;
                    try {
                      setResettingUserId(u.id);
                      await superAdminService.resetCompanyUserPassword(id, u.id, password);
                    } catch (err: unknown) {
                      const message =
                        typeof err === 'object' && err && 'response' in err
                          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                          : undefined;
                      setError(message || 'Error al resetear contraseña');
                    } finally {
                      setResettingUserId(null);
                    }
                  }}
                  className="px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg disabled:opacity-50"
                >
                  {resettingUserId === u.id ? 'Reseteando...' : 'Resetear contraseña'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
