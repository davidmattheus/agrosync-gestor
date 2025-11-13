
import React from 'react';
import Card from '../components/ui/Card';
import { useFarmData } from '../context/FarmDataContext';
import { PlusIcon, UsersIcon } from '../components/ui/Icons';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const Collaborators: React.FC = () => {
    const { farm: { collaborators }, loading } = useFarmData();
    const { user } = useAuth();
    
    const canManage = user?.role === UserRole.ADMIN;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-agro-gray-800">Colaboradores</h2>
                {canManage && (
                    <button className="flex items-center px-4 py-2 text-white bg-agro-green rounded-lg hover:bg-opacity-90">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Adicionar Colaborador
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {loading ? (
                    <p>Carregando colaboradores...</p>
                ) : (
                    collaborators.map(collab => (
                        <Card key={collab.id} className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 mb-4 bg-agro-light-green rounded-full flex items-center justify-center">
                                <UsersIcon className="w-10 h-10 text-agro-green"/>
                            </div>
                            <h3 className="text-lg font-bold text-agro-gray-800">{collab.name}</h3>
                            <p className="text-agro-gray-500">{collab.role}</p>
                            {canManage && (
                                <button className="mt-4 px-4 py-1 text-sm text-agro-green border border-agro-green rounded-full hover:bg-agro-light-green">
                                    Editar
                                </button>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default Collaborators;
