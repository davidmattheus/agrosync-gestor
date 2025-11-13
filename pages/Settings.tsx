import React, { useState, useEffect } from 'react';
import { useFarmData } from '../context/FarmDataContext';
import Card from '../components/ui/Card';
import { FuelType, FuelPrice } from '../types';
import { CheckCircleIcon } from '../components/ui/Icons';

const Settings: React.FC = () => {
    const { farm, updateFuelPrices } = useFarmData();
    const [prices, setPrices] = useState<Map<FuelType, number>>(new Map());
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const initialPrices = new Map();
        // Ensure all fuel types are present in the map
        Object.values(FuelType).forEach(type => {
            const existingPrice = farm.fuelPrices.find(p => p.fuelType === type);
            initialPrices.set(type, existingPrice ? existingPrice.price : 0);
        });
        setPrices(initialPrices);
    }, [farm.fuelPrices]);

    const handlePriceChange = (fuelType: FuelType, value: string) => {
        const newPrices = new Map(prices);
        newPrices.set(fuelType, parseFloat(value) || 0);
        setPrices(newPrices);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const pricesArray: FuelPrice[] = Array.from(prices.entries()).map(([fuelType, price]) => ({
            fuelType,
            price
        }));
        updateFuelPrices(pricesArray);

        setTimeout(() => {
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        }, 1000);
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-agro-gray-800">Configurações</h2>
            
            <Card>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-agro-gray-800">Preços de Combustível</h3>
                            <p className="text-sm text-agro-gray-500 mt-1">
                                Defina os preços médios por litro para cada tipo de combustível. Estes valores serão usados para pré-calcular os custos nos registros de abastecimento.
                            </p>
                        </div>
                        
                        {Object.values(FuelType).map(type => (
                            <div key={type}>
                                <label className="text-sm font-bold text-gray-700 block">{type}</label>
                                <div className="relative mt-1">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm">R$</span>
                                    </div>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        min="0"
                                        value={prices.get(type) || ''}
                                        onChange={e => handlePriceChange(type, e.target.value)}
                                        className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agro-green"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-end items-center pt-4 border-t">
                            {showSuccess && (
                                <div className="flex items-center text-green-600 mr-4">
                                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                                    <span>Salvo com sucesso!</span>
                                </div>
                            )}
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="flex items-center justify-center w-32 px-4 py-2 text-white bg-agro-green rounded-lg hover:bg-opacity-90 disabled:bg-opacity-50"
                            >
                                {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Salvar Preços'}
                            </button>
                        </div>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Settings;
