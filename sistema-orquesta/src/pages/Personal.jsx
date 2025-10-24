import React, { useCallback, useEffect, useState } from 'react';
import { listPersonal, createPersonal, updatePersonal, removePersonal, exportPersonal } from '../api/personal';
import Modal from '../components/Modal';
import AccessDenied from '../components/auth/AccessDenied';
import ConfirmDialog from '../components/ConfirmDialog';
import PersonalHeader from '../components/Personal/PersonalHeader';
import PersonalTable from '../components/Personal/PersonalTable';
import PersonalDetalle from '../components/Personal/PersonalDetalle';
import PersonalForm from '../components/Personal/PersonalForm';
import PersonalFilters from '../components/Personal/PersonalFilters';
import ExportModal from '../components/ExportModal';
import { useAuth } from '../context/AuthContext';

function emptyForm() {
  return {
    ci: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: '',
    fecha_ingreso: '',
    id_cargo: '',
    id_programa: '',
    carga_horaria: 0,
    estado: 'ACTIVO',
  };
}

function useDeferredValidation() {
  const [submitted, setSubmitted] = useState(false);
  const shouldShow = (hasError) => submitted && hasError;
  return { submitted, setSubmitted, shouldShow };
}

export default function Personal() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ texto: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(() => emptyForm());
  const [deleteId, setDeleteId] = useState(null);
  const v = useDeferredValidation();
  const { anyPermiso } = useAuth();
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewRow, setViewRow] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('apellidos');
  const [sortDir, setSortDir] = useState('asc');
  const [exportOpen, setExportOpen] = useState(false);

  const canCreate = anyPermiso([['personal','create']]);
  const canUpdate = anyPermiso([['personal','update']]);
  const canDelete = anyPermiso([['personal','delete']]);
  const canExport = anyPermiso([['personal','export']]);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true); setError('');
    try {
      const res = await listPersonal({ ...filters, page });
      setData(res);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchData(1); }, [fetchData]);
  // Búsqueda reactiva (debounce ligero) al cambiar texto de filtro
  useEffect(() => {
    const id = setTimeout(() => { fetchData(1); }, 300);
    return () => clearTimeout(id);
  }, [filters.texto, fetchData]);

  const onNew = () => { setEditing(null); setForm(emptyForm()); v.setSubmitted(false); setModalOpen(true); };
  const onEdit = (row) => { setEditing(row); setForm({ ...emptyForm(), ...row }); v.setSubmitted(false); setModalOpen(true); };

  const onSubmit = async (formData) => {
    v.setSubmitted(true);
    const f = formData || form;
    // Programa es opcional, Cargo es obligatorio
    const hasErrors = !f.ci || !f.nombres || !f.apellidos || !f.email || !f.telefono || !f.id_cargo || !(Number.isFinite(Number(f.carga_horaria)) && Number(f.carga_horaria) >= 0 && Number(f.carga_horaria) <= 60);
    if (hasErrors) return;
    try {
      setSubmitting(true);
      if (editing) await updatePersonal(editing.id_personal, f);
      else await createPersonal(f);
      setModalOpen(false); await fetchData(data.page);
    } catch (e) {
      const code = e?.response?.data?.error;
      if (code === 'EMAIL_DUPLICATE') alert('El email ya existe');
      else if (code === 'CI_DUPLICATE') alert('La cédula ya existe');
      else alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    try { await removePersonal(deleteId); setDeleteId(null); await fetchData(data.page); }
    catch (e) { alert(e.message); }
  };

  const openExport = () => setExportOpen(true);

  return (
    <div className="space-y-6">
  <PersonalHeader onCreate={canCreate ? onNew : undefined} selected={selectedIds} onExport={canExport ? openExport : undefined} onOpenActions={undefined} />

      <div className="card p-4 space-y-4">
        <PersonalFilters value={filters.texto} onChange={(val)=> setFilters(f => ({ ...f, texto: val }))} />

        {data?._denied ? (
          <AccessDenied title="Personal" message="No tienes permiso para ver esta sección." />
        ) : loading ? (
          <div>Cargando…</div>
        ) : error ? (
          <div className="text-red-600">{String(error)}</div>
        ) : (
          <>
          <PersonalTable
            data={(data && Array.isArray(data.items) ? data.items : [])}
            loading={loading}
            onEdit={canUpdate ? onEdit : undefined}
            onDelete={canDelete ? (r)=>setDeleteId(r.id_personal) : undefined}
            onView={(r)=>setViewRow(r)}
            selectedIds={selectedIds}
            onToggleSelectAll={()=>{
              const items = (data && Array.isArray(data.items) ? data.items : []);
              setSelectedIds(selectedIds.length === items.length ? [] : items.map(i=>i.id_personal));
            }}
            onToggleOne={(id)=>{
              setSelectedIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
            }}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={(key)=>{
              setSortBy(key);
              setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
            }}
          />
          {viewRow && (
            <Modal title="Detalle de personal" onClose={() => setViewRow(null)}>
              <PersonalDetalle p={viewRow} />
            </Modal>
          )}
          </>
        )}
      </div>

      {/* Modal formulario */}
      {modalOpen && (
        <Modal title={editing ? 'Editar personal' : 'Nuevo personal'} onClose={() => setModalOpen(false)}>
          <PersonalForm
            initialValue={editing || form}
            submitting={submitting}
            onCancel={() => setModalOpen(false)}
            onSubmit={onSubmit}
          />
        </Modal>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Eliminar personal"
        description="Esta acción marcará el registro como eliminado. ¿Deseas continuar?"
        confirmText="Eliminar"
        onCancel={() => setDeleteId(null)}
        onConfirm={onDelete}
      />

      {/* Exportación */}
      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Exportar personal"
        entityName="personal"
        selectedIds={selectedIds}
        fileBaseName="personal"
        disabledFormats={[ 'xlsx', 'pdf' ]}
        exporter={({ ids, format }) => exportPersonal({ ids, format, ...filters })}
      />
    </div>
  );
}
