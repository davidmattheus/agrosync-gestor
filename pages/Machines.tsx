import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import { useFarmData } from '../context/FarmDataContext';
import { Machine, MachineStatus, MachineType, FuelType } from '../types';
import { PlusIcon, EditIcon, TrashIcon, XCircleIcon } from '../components/ui/Icons';

const getStatusBadge = (status: MachineStatus) => {
    switch(status) {
      case MachineStatus.ACTIVE:
        return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Ativo</span>;
      case MachineStatus.INACTIVE:
        return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-full">Inativo</span>;
      case MachineStatus.MAINTENANCE:
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">Em Manutenção</span>;
      default:
        return null;
    }
};

const initialMachineState: Omit<Machine, 'id'> = {
    name: '',
    type: MachineType.TRACTOR,
    brandModel: '',
    year: new Date().getFullYear(),
    hourMeter: 0,
    status: MachineStatus.ACTIVE,
    serialNumber: '',
    currentCollaboratorId: '',
    notes: '',
    defaultFuelType: FuelType.DIESEL_S10,
    maintenanceConfig: {
        engineOilHours: 250,
        transmissionOilHours: 1000,
        fuelFilterHours: 500,
        airFilterHours: 500,
    },
    lastMaintenance: {
        engineOilHour: 0,
        transmissionOilHour: 0,
        fuelFilterHour: 0,
        airFilterHour: 0,
    }
};

const MachineFormModal: React.FC<{ machine: Machine | null; onClose: () => void; }> = ({ machine, onClose }) => {
    const { farm, addMachine, updateMachine } = useFarmData();
    const [formData, setFormData] = useState<Omit<Machine, 'id'>>(initialMachineState);

    React.useEffect(() => {
        if (machine) {
            setFormData({
                ...initialMachineState,
                ...machine,
                maintenanceConfig: machine.maintenanceConfig ?? initialMachineState.maintenanceConfig,
                lastMaintenance: machine.lastMaintenance ?? initialMachineState.lastMaintenance,
            });
        } else {
            setFormData(initialMachineState);
        }
    }, [machine]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    }

    const handleMaintenanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            maintenanceConfig: {
                ...(prev.maintenanceConfig || initialMachineState.maintenanceConfig),
                [name]: Number(value) || 0
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.name || !formData.type || !formData.hourMeter || !formData.status) {
            alert('Por favor, preencha os campos obrigatórios: Nome, Tipo, Horímetro e Status.');
            return;
        }

        if (machine) {
            updateMachine({ ...formData, id: machine.id });
        } else {
            addMachine(formData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <Card className="w-full max-w-3xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <XCircleIcon size={28}/>
                </button>
                <h3 className="text-xl font-bold text-agro-gray-800 mb-6">{machine ? 'Editar Máquina' : 'Adicionar Nova Máquina'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-bold text-gray-600 block">Nome / Identificação *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600 block">Tipo *</label>
                            <select name="type" value={formData.type} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green">
                                {Object.values(MachineType).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600 block">Marca / Modelo</label>
                            <input type="text" name="brandModel" value={formData.brandModel} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600 block">Ano de Fabricação</label>
                            <input type="number" name="year" value={formData.year} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600 block">Nº de Série / Chassi</label>
                            <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600 block">Horímetro / Odômetro Atual *</label>
                            <input type="number" name="hourMeter" value={formData.hourMeter} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600 block">Status *</label>
                            <select name="status" value={formData.status} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green">
                                {Object.values(MachineStatus).map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600 block">Responsável Atual</label>
                            <select name="currentCollaboratorId" value={formData.currentCollaboratorId} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green">
                                <option value="">Nenhum</option>
                                {farm.collaborators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="text-sm font-bold text-gray-600 block">Combustível Padrão</label>
                            <select name="defaultFuelType" value={formData.defaultFuelType} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green">
                                {Object.values(FuelType).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="pt-4 mt-4 border-t">
                        <h4 className="text-md font-bold text-gray-700 mb-2">Plano de Manutenção Preventiva</h4>
                        <p className="text-sm text-gray-500 mb-4">Defina os intervalos em horas para cada tipo de manutenção. O sistema irá gerar alertas automáticos.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-bold text-gray-600 block">Óleo do Motor (h)</label>
                                <input type="number" name="engineOilHours" placeholder="Ex: 250" value={formData.maintenanceConfig?.engineOilHours || ''} onChange={handleMaintenanceChange} className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600 block">Óleo Transmissão (h)</label>
                                <input type="number" name="transmissionOilHours" placeholder="Ex: 1000" value={formData.maintenanceConfig?.transmissionOilHours || ''} onChange={handleMaintenanceChange} className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600 block">Filtro Combustível (h)</label>
                                <input type="number" name="fuelFilterHours" placeholder="Ex: 500" value={formData.maintenanceConfig?.fuelFilterHours || ''} onChange={handleMaintenanceChange} className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600 block">Filtro de Ar (h)</label>
                                <input type="number" name="airFilterHours" placeholder="Ex: 500" value={formData.maintenanceConfig?.airFilterHours || ''} onChange={handleMaintenanceChange} className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-600 block">Observações</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green"></textarea>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 mr-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-white bg-agro-green rounded-lg hover:bg-opacity-90">Salvar Máquina</button>
                    </div>
                </form>
            </Card>
        </div>
    )
}


const Machines: React.FC = () => {
  const { farm: { machines }, loading, deleteMachine } = useFarmData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const handleOpenModal = (machine: Machine | null = null) => {
    setEditingMachine(machine);
    setIsModalOpen(true);
  }

  const handleDelete = (machineId: string) => {
      if(window.confirm('Tem certeza que deseja excluir esta máquina? Esta ação não pode ser desfeita.')){
          deleteMachine(machineId);
      }
  }

  const filteredMachines = useMemo(() => {
    return machines.filter(m => 
        (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.brandModel.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter ? m.status === statusFilter : true) &&
        (typeFilter ? m.type === typeFilter : true)
    );
  }, [machines, searchTerm, statusFilter, typeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-agro-gray-800">Máquinas e Implementos</h2>
        <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 text-white bg-agro-green rounded-lg shadow-md hover:bg-opacity-90 transition-colors">
            <PlusIcon className="w-5 h-5 mr-2" />
            Adicionar Máquina
        </button>
      </div>
      
      {isModalOpen && <MachineFormModal machine={editingMachine} onClose={() => setIsModalOpen(false)} />}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-agro-gray-100 rounded-lg">
            <input 
                type="text" 
                placeholder="Buscar por nome ou modelo..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green"
            />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green">
                <option value="">Todos os Tipos</option>
                {Object.values(MachineType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green">
                <option value="">Todos os Status</option>
                {Object.values(MachineStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b">
              <tr className="text-sm text-agro-gray-600">
                <th className="p-4">Nome / Modelo</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Horímetro</th>
                <th className="p-4">Status</th>
                <th className="p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center">Carregando máquinas...</td></tr>
              ) : (
                filteredMachines.map(machine => (
                  <tr key={machine.id} className="border-b hover:bg-agro-light-green transition-colors">
                    <td className="p-4">
                        <Link to={`/machines/${machine.id}`} className="font-semibold text-agro-green hover:underline">{machine.name}</Link>
                        <div className="text-sm text-agro-gray-500">{machine.brandModel}</div>
                    </td>
                    <td className="p-4">{machine.type}</td>
                    <td className="p-4">{machine.hourMeter.toLocaleString('pt-BR')}h</td>
                    <td className="p-4">{getStatusBadge(machine.status)}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-4">
                        <button onClick={() => handleOpenModal(machine)} className="text-blue-600 hover:text-blue-800" title="Editar"><EditIcon size={20}/></button>
                        <button onClick={() => handleDelete(machine.id)} className="text-red-600 hover:text-red-800" title="Excluir"><TrashIcon size={20}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Machines;
