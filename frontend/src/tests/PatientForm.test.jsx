import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import api from '../api.js';

// Simple mock form component inside the test representing our patient form
const PatientForm = ({ onSubmit, apiError }) => {
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [error, setError] = React.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!firstName || !lastName) {
            setError('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        onSubmit({ firstName, lastName });
    };

    return (
        <form onSubmit={handleSubmit} data-testid="patient-form">
            {error && <span data-testid="validation-error">{error}</span>}
            {apiError && <span data-testid="api-error">{apiError}</span>}
            
            <input 
                type="text" 
                placeholder="Prénom" 
                value={firstName} 
                onChange={e => setFirstName(e.target.value)} 
                data-testid="first-name"
            />
            <input 
                type="text" 
                placeholder="Nom" 
                value={lastName} 
                onChange={e => setLastName(e.target.value)} 
                data-testid="last-name"
            />
            <button type="submit" data-testid="submit-btn">Enregistrer</button>
        </form>
    );
};

describe('PatientForm Component Tests', () => {
    it('shows validation error when fields are empty', () => {
        const mockSubmit = vi.fn();
        render(<PatientForm onSubmit={mockSubmit} />);
        
        fireEvent.click(screen.getByTestId('submit-btn'));
        expect(screen.getByTestId('validation-error')).toHaveTextContent('Veuillez remplir tous les champs obligatoires.');
        expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('submits successfully when fields are filled', () => {
        const mockSubmit = vi.fn();
        render(<PatientForm onSubmit={mockSubmit} />);
        
        fireEvent.change(screen.getByTestId('first-name'), { target: { value: 'Abdessamad' } });
        fireEvent.change(screen.getByTestId('last-name'), { target: { value: 'Kaf' } });
        fireEvent.click(screen.getByTestId('submit-btn'));
        
        expect(mockSubmit).toHaveBeenCalledWith({ firstName: 'Abdessamad', lastName: 'Kaf' });
    });

    it('displays API error message correctly', () => {
        render(<PatientForm onSubmit={vi.fn()} apiError="Erreur de base de données" />);
        expect(screen.getByTestId('api-error')).toHaveTextContent('Erreur de base de données');
    });
});
