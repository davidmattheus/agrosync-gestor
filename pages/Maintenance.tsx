import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { useFarmData } from '../context/FarmDataContext';
import { PlusIcon, XCircleIcon, TrashIcon } from '../components/ui/Icons';
import { MaintenanceType, MaintenanceLog, MaintenancePart } from '../types';

const AddMaintenanceModal: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    const { farm, addMaintenanceLog } = useFarmData();
    const [machineId, setMachineId] = useState('');
    const [collaboratorId, setCollaboratorId] = useState('');
    const [type, setType] = useState<MaintenanceType>(MaintenanceType.PREVENTIVE);
    const [totalCost, setTotalCost] = useState('');
    const [hourMeter, setHourMeter] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    // State for parts
    const [partsUsed, setPartsUsed] = useState<MaintenancePart[]>([]);
    const [selectedPartId, setSelectedPartId] = useState('');
    const [partQuantity, setPartQuantity] = useState(1);

    const handleAddPart = () => {
        if (!selectedPartId || partQuantity <= 0) {
            alert("Selecione uma peça e informe uma quantidade válida.");
            return;
        }
        const part = farm.warehouseItems.find(p => p.id === selectedPartId);
        if (!part) return;

        // Check if there's enough stock
        if (part.stockQuantity < partQuantity) {
            alert(`Estoque insuficiente. Apenas ${part.stockQuantity} unidades de "${part.name}" disponíveis.`);
            return;
        }

        // Check if part is already in the list to avoid duplicates
        if (partsUsed.some(p => p.itemId === selectedPartId)) {
            alert("Esta peça já foi adicionada.");
            return;
        }

        setPartsUsed([...partsUsed, { itemId: selectedPartId, quantity: partQuantity }]);
        setSelectedPartId('');
        setPartQuantity(1);
    };

    const handleRemovePart = (itemId: string) => {
        setPartsUsed(partsUsed.filter(p => p.itemId !== itemId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!machineId || !collaboratorId || !totalCost || !hourMeter || !date || !type) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        const log: Omit<MaintenanceLog, 'id'> = {
            date: new Date(date).toISOString(),
            machineId,
            collaboratorId,
            type,
            totalCost: parseFloat(totalCost),
            hourMeter: parseInt(hourMeter),
            notes,
            partsUsed: partsUsed
        };
        addMaintenanceLog(log);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <Card className="w-full max-w-3xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <XCircleIcon size={28}/>
                </button>
                <h3 className="text-xl font-bold text-agro-gray-800 mb-4">Registrar Manutenção</h3>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="text-sm font-bold text-gray-600 block">Data</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600 block">Tipo de Manutenção</label>
                            <select value={type} onChange={e => setType(e.target.value as MaintenanceType)} required className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green">
                                {Object.values(MaintenanceType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600 block">Máquina</label>
                            <select value={machineId} onChange={e => setMachineId(e.target.value)} required className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green">
                                <option value="" disabled>Selecione...</option>
                                {farm.machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600 block">Responsável</label>
                            <select value={collaboratorId} onChange={e => setCollaboratorId(e.target.value)} required className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green">
                                <option value="" disabled>Selecione...</option>
                                {farm.collaborators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600 block">Horímetro no Momento</label>
                            <input type="number" min="0" value={hourMeter} onChange={e => setHourMeter(e.target.value)} required className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600 block">Custo Total (R$)</label>
                            <input type="number" step="0.01" min="0" value={totalCost} onChange={e => setTotalCost(e.target.value)} required className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green" />
                        </div>
                    </div>
                     <div>
                        <label className="text-sm font-bold text-gray-600 block">Observações / Detalhes do Serviço</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green" placeholder="Descreva o serviço realizado, peças trocadas que não estão no almoxarifado, etc."></textarea>
                    </div>

                    <div className="pt-4 mt-4 border-t">
                        <h4 className="text-md font-bold text-gray-700 mb-2">Peças Utilizadas (Opcional)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                            <div className="md:col-span-2">
                                <label className="text-sm font-bold text-gray-600 block">Peça</label>
                                <select value={selectedPartId} onChange={e => setSelectedPartId(e.target.value)} className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green">
                                    <option value="" disabled>Selecione uma peça...</option>
                                    {farm.warehouseItems.filter(p => p.stockQuantity > 0).map(p => <option key={p.id} value={p.id}>{p.name} ({p.stockQuantity} em estoque)</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="text-sm font-bold text-gray-600 block">Qtd.</label>
                                <input type="number" min="1" value={partQuantity} onChange={e => setPartQuantity(parseInt(e.target.value))} className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green" />
                            </div>
                        </div>
                        <button type="button" onClick={handleAddPart} className="mt-2 px-3 py-1.5 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600">Adicionar Peça</button>
                        
                        <div className="mt-4 space-y-2">
                            {partsUsed.map(part => {
                                const itemInfo = farm.warehouseItems.find(p => p.id === part.itemId);
                                return (
                                    <div key={part.itemId} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                                        <span>{itemInfo?.name}</span>
                                        <div className="flex items-center">
                                            <span>Qtd: {part.quantity}</span>
                                            <button type="button" onClick={() => handleRemovePart(part.itemId)} className="ml-4 text-red-500 hover:text-red-700">
                                                <TrashIcon size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 mr-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-white bg-agro-green rounded-lg hover:bg-opacity-90">Salvar Manutenção</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const Maintenance: React.FC = () => {
  const { farm: { maintenanceLogs }, getMachineById, getCollaboratorById, loading } = useFarmData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-agro-gray-800">Histórico de Manutenções</h2>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 text-white bg-agro-green rounded-lg hover:bg-opacity-90">
            <PlusIcon className="w-5 h-5 mr-2" />
            Registrar Manutenção
        </button>
      </div>
      
      {isModalOpen && <AddMaintenanceModal onClose={() => setIsModalOpen(false)} />}

      <Card>
        {/* Add filters here */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b">
              <tr className="text-sm text-agro-gray-600">
                <th className="p-4">Data</th>
                <th className="p-4">Tipo de Manutenção</th>
                <th className="p-4">Máquina</th>
                <th className="p-4">Responsável</th>
                <th className="p-4">Horímetro</th>
                <th className="p-4">Custo Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center">Carregando registros...</td></tr>
              ) : (
                maintenanceLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => {
                  const machine = getMachineById(log.machineId);
                  const collaborator = getCollaboratorById(log.collaboratorId);
                  return (
                    <tr key={log.id} className="border-b hover:bg-agro-light-green">
                      <td className="p-4">{new Date(log.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                      <td className="p-4 font-semibold">{log.type}</td>
                      <td className="p-4">{machine?.name || 'N/A'}</td>
                      <td className="p-4">{collaborator?.name || 'N/A'}</td>
                      <td className="p-4">{log.hourMeter.toLocaleString('pt-BR')}h</td>
                      <td className="p-4 font-semibold">{log.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Maintenance;