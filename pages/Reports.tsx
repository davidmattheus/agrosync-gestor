import React, { useMemo } from 'react';
import Card from '../components/ui/Card';
import { useFarmData } from '../context/FarmDataContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { MaintenanceType } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const Reports: React.FC = () => {
    const { farm, loading } = useFarmData();

    const maintenanceCostData = useMemo(() => {
        const costs = Object.values(MaintenanceType).map(type => ({
            name: type,
            value: farm.maintenanceLogs
                .filter(log => log.type === type)
                .reduce((sum, log) => sum + log.totalCost, 0)
        })).filter(item => item.value > 0);
        return costs;
    }, [farm.maintenanceLogs]);
    
    const machineCostData = useMemo(() => {
        return farm.machines.map(machine => {
            const fuelCost = farm.fuelLogs
                .filter(log => log.machineId === machine.id)
                .reduce((sum, log) => sum + log.totalValue, 0);
            const maintenanceCost = farm.maintenanceLogs
                .filter(log => log.machineId === machine.id)
                .reduce((sum, log) => sum + log.totalCost, 0);
            return {
                name: machine.name,
                Abastecimento: fuelCost,
                Manutenção: maintenanceCost,
            };
        }).filter(item => (item.Abastecimento + item.Manutenção) > 0)
          .sort((a, b) => (b.Abastecimento + b.Manutenção) - (a.Abastecimento + a.Manutenção));
    }, [farm.machines, farm.fuelLogs, farm.maintenanceLogs]);

    if (loading) return <div>Carregando relatórios...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-agro-gray-800">Relatórios e Análises</h2>
                <div className="space-x-2">
                    <button className="px-4 py-2 text-sm text-agro-green bg-white border border-agro-green rounded-lg hover:bg-agro-light-green">Exportar PDF</button>
                    <button className="px-4 py-2 text-sm text-white bg-agro-green rounded-lg hover:bg-opacity-90">Exportar Excel</button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <div className="lg:col-span-2">
                    <Card>
                        <h3 className="text-lg font-semibold text-agro-gray-800 mb-4">Custos por Tipo de Manutenção</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={maintenanceCostData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                        {maintenanceCostData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-3">
                    <Card>
                        <h3 className="text-lg font-semibold text-agro-gray-800 mb-4">Gastos Totais por Máquina</h3>
                        <div style={{ width: '100%', height: 300 }}>
                           <ResponsiveContainer>
                                <BarChart data={machineCostData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" tickFormatter={(value) => `R$${value/1000}k`} />
                                    <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} />
                                    <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                                    <Legend />
                                    <Bar dataKey="Abastecimento" stackId="a" fill="#3B82F6" name="Abastecimento" />
                                    <Bar dataKey="Manutenção" stackId="a" fill="#F97316" name="Manutenção" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Reports;