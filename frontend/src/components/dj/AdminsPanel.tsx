'use client';

import { Plus, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { CreateAdminModal } from '@/components/modals/CreateAdminModal';
import { useModal } from '@/hooks/useModal';
import { useT } from '@/hooks/useT';

export function AdminsPanel() {
  const createModal = useModal();
  const t = useT();

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: authService.getAdmins,
  });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">{t.adminsTitle} ({admins.length})</h2>
        <Button variant="primary" size="sm" onClick={() => createModal.open()}>
          <Plus className="w-4 h-4" /> {t.createAdmin}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {admins.map((admin) => (
          <div key={admin.id} className="flex items-center gap-3 p-4 bg-dark-surface border border-dark-border rounded-xl">
            <div className="w-10 h-10 rounded-full bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-neon-purple" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{admin.name}</p>
              <p className="text-gray-500 text-xs truncate">{admin.email}</p>
              {admin.createdAt && (
                <p className="text-gray-600 text-xs">
                  {new Date(admin.createdAt).toLocaleDateString('es-EC')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <CreateAdminModal isOpen={createModal.isOpen} onClose={createModal.close} />
    </div>
  );
}
