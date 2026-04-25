import { useState } from "react";
import { Plus, Check, Pencil, Trash2 } from "lucide-react";
import { useSupabaseCrud } from "@/hooks/useSupabaseCrud";
import CrudDialog from "@/components/admin/CrudDialog";
import FormField from "@/components/admin/FormField";
import DeleteConfirm from "@/components/admin/DeleteConfirm";

interface Task { id: string; title: string; status: string; assignee: string; }

const statusOptions = [
  { value: "todo", label: "To Do" }, { value: "in_progress", label: "In Progress" }, { value: "done", label: "Done" },
];

const AdminTasks = () => {
  const { data: tasks, loading, create, update, remove } = useSupabaseCrud<Task>("tasks");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", status: "todo", assignee: "" });

  const openNew = () => { setEditing(null); setForm({ title: "", status: "todo", assignee: "" }); setDialogOpen(true); };
  const openEdit = (t: Task) => { setEditing(t); setForm({ title: t.title, status: t.status, assignee: t.assignee || "" }); setDialogOpen(true); };

  const toggleDone = async (t: Task) => {
    await update(t.id, { status: t.status === "done" ? "todo" : "done" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = editing ? await update(editing.id, form) : await create(form);
    if (ok) setDialogOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1 font-body">Track team tasks and to-dos</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 gradient-gold text-maroon-deep px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-md font-body">
          <Plus size={14} /> Add Task
        </button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground font-body animate-pulse">Loading...</p> : (
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground font-body py-8">No tasks yet.</p>
          ) : tasks.map(t => (
            <div key={t.id} className="flex items-center gap-4 border border-border rounded-lg p-4 bg-card group">
              <button onClick={() => toggleDone(t)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${t.status === 'done' ? 'bg-green-500 border-green-500' : 'border-border hover:border-gold'}`}>
                {t.status === 'done' && <Check size={12} className="text-background" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-body ${t.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>{t.title}</p>
                <p className="text-xs text-muted-foreground font-body">{t.assignee}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-body shrink-0 ${
                t.status === 'done' ? 'bg-green-100 text-green-700' : t.status === 'in_progress' ? 'bg-gold/10 text-gold' : 'bg-secondary text-muted-foreground'
              }`}>{t.status.replace('_', ' ')}</span>
              <div className="hidden group-hover:flex gap-2 shrink-0">
                <button onClick={() => openEdit(t)} className="text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                <button onClick={() => setDeleteId(t.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Task" : "Add Task"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title" value={form.title} onChange={v => setForm({ ...form, title: v })} required />
          <FormField label="Assignee" value={form.assignee} onChange={v => setForm({ ...form, assignee: v })} />
          <FormField label="Status" value={form.status} onChange={v => setForm({ ...form, status: v })} options={statusOptions} />
          <button type="submit" className="w-full gradient-gold text-maroon-deep py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] rounded-md">
            {editing ? "Update" : "Create"}
          </button>
        </form>
      </CrudDialog>

      <DeleteConfirm open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }} itemName="task" />
    </div>
  );
};

export default AdminTasks;
