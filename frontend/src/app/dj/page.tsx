'use client';

import { useState } from 'react';
import { ListMusic, Music, LayoutGrid, Users } from 'lucide-react';
import { DJHeader } from '@/components/dj/DJHeader';
import { QueueDJPanel } from '@/components/dj/QueueDJPanel';
import { SongsPanel } from '@/components/dj/SongsPanel';
import { TablesPanel } from '@/components/dj/TablesPanel';
import { AdminsPanel } from '@/components/dj/AdminsPanel';
import { cn } from '@/lib/utils';

type Tab = 'queue' | 'songs' | 'tables' | 'admins';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'queue', label: 'Cola en Vivo', icon: <ListMusic className="w-4 h-4" /> },
  { id: 'songs', label: 'Canciones', icon: <Music className="w-4 h-4" /> },
  { id: 'tables', label: 'Mesas', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'admins', label: 'Admins', icon: <Users className="w-4 h-4" /> },
];

export default function DJDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('queue');

  return (
    <div className="min-h-screen bg-dark-base text-white">
      <DJHeader />

      {/* Tabs */}
      <div className="bg-dark-surface/50 border-b border-dark-border sticky top-[65px] z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-neon-purple text-neon-purple'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'queue' && <QueueDJPanel />}
        {activeTab === 'songs' && <SongsPanel />}
        {activeTab === 'tables' && <TablesPanel />}
        {activeTab === 'admins' && <AdminsPanel />}
      </main>
    </div>
  );
}
