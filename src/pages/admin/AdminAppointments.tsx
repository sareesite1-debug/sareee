import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useSupabaseCrud } from "@/hooks/useSupabaseCrud";
import CrudDialog from "@/components/admin/CrudDialog";
import FormField from "@/components/admin/FormField";
import DeleteConfirm from "@/components/admin/DeleteConfirm";

interface Appointment { id: string; client_name: string; appointment_date: string; appointment_time: string; type: string; notes: string; }

const AdminAppointments = () => {
  const { data: appointments, loading, create, update, remove } = useSupabaseCrud<Appointment>("appointments", "appointment_date");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ client_name: "", appointment_date: "", appointment_time: "", type: "", notes: "" });

  const openNew = () => { setEditing(null); setForm({ client_name: "", appointment_date: "", appointment_time: "", type: "", notes: "" }); setDialogOpen(true); };
  const openEdit = (a: Appointment) => { setEditing(a); setForm({ client_name: a.client_name, appointment_date: a.appointment_date, appointment_time: a.appointment_time, type: a.type || "", notes: a.notes || "" }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = editing ? await update(editing.id, form) : await create(form);
    if (ok) setDialogOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold">Appointments</h1>
          <p className="text-sm text-muted-foreground mt-1 font-body">Manage boutique visit and consultation appointments</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 gradient-gold text-maroon-deep px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-md font-body">
          <Plus size={14} /> Add Appointment
        </button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground font-body animate-pulse">Loading...</p> : (
        <div className="space-y-3">
          {appointments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground font-body py-8">No appointments scheduled.</p>
          ) : appointments.map(a => (
            <div key={a.id} className="border border-border rounded-lg p-4 bg-card flex items-center justify-between group">
              <div>
                <p className="text-sm font-medium font-body">{a.client_name}</p>
                <p className="text-xs text-muted-foreground font-body">{a.type}</p>
                {a.notes && <p className="text-xs text-muted-foreground font-body mt-1">{a.notes}</p>}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-body">{a.appointment_date}</p>
                  <p className="text-xs text-gold font-body">{a.appointment_time}</p>
                </div>
                <div className="hidden group-hover:flex gap-2">
                  <button onClick={() => openEdit(a)} className="text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                  <button onClick={() => setDeleteId(a.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Appointment" : "New Appointment"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Client Name" value={form.client_name} onChange={v => setForm({ ...form, client_name: v })} required />
          <FormField label="Date" value={form.appointment_date} onChange={v => setForm({ ...form, appointment_date: v })} type="date" required />
          <FormField label="Time" value={form.appointment_time} onChange={v => setForm({ ...form, appointment_time: v })} placeholder="e.g. 11:00 AM" required />
          <FormField label="Type" value={form.type} onChange={v => setForm({ ...form, type: v })} placeholder="e.g. Bridal Consultation" />
          <FormField label="Notes" value={form.notes} onChange={v => setForm({ ...form, notes: v })} type="textarea" />
          <button type="submit" className="w-full gradient-gold text-maroon-deep py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] rounded-md">
            {editing ? "Update" : "Create"}
          </button>
        </form>
      </CrudDialog>

      <DeleteConfirm open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }} itemName="appointment" />
    </div>
  );
};

export default AdminAppointments;
