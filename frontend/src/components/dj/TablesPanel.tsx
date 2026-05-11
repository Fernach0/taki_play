'use client';

import { Plus, Pencil, Trash2, Copy } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tablesService } from '@/services/tables.service';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AddTableModal } from '@/components/modals/AddTableModal';
import { EditTableModal } from '@/components/modals/EditTableModal';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { useModal } from '@/hooks/useModal';
import { useT } from '@/hooks/useT';
import { Table } from '@/types/table.types';

export function TablesPanel() {
  const qc = useQueryClient();
  const t = useT();
  const addModal = useModal();
  const editModal = useModal<Table>();
  const deleteModal = useModal<Table>();

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesService.getTables,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tablesService.deleteTable(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Mesa desactivada');
      deleteModal.close();
    },
    onError: () => toast.error('Error al desactivar la mesa'),
  });

  const copyQr = (qrCode: string) => {
    navigator.clipboard.writeText(qrCode);
    toast.success(t.qrCopied);
  };

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">{t.tablesTitle} ({tables.length})</h2>
        <Button variant="primary" size="sm" onClick={() => addModal.open()}>
          <Plus className="w-4 h-4" /> {t.newTable}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-dark-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border bg-dark-base/50">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">{t.colTable}</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">{t.colStatus}</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">{t.colQrCode}</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">{t.colQueue}</th>
              <th className="text-right px-4 py-3 text-gray-400 font-medium">{t.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table) => (
              <tr key={table.id} className="border-b border-dark-border/50 hover:bg-dark-base/30 transition-colors">
                <td className="px-4 py-3 text-white font-semibold">#{table.number}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${table.isActive ? 'bg-green-900/50 text-green-300' : 'bg-gray-800 text-gray-500'}`}>
                    {table.isActive ? t.statusActive : t.statusInactive}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-gray-400 font-mono">
                      {table.qrCode.slice(0, 16)}...
                    </code>
                    <button onClick={() => copyQr(table.qrCode)} className="text-gray-500 hover:text-neon-cyan transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-300">{table.pendingQueueCount ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => editModal.open(table)} className="p-1.5 rounded-lg text-gray-400 hover:text-neon-cyan hover:bg-cyan-950/30 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteModal.open(table)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddTableModal isOpen={addModal.isOpen} onClose={addModal.close} />
      <EditTableModal isOpen={editModal.isOpen} onClose={editModal.close} table={editModal.selected} />
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={() => deleteModal.selected && deleteMutation.mutate(deleteModal.selected.id)}
        entityName={deleteModal.selected ? `Mesa #${deleteModal.selected.number}` : ''}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
