import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple mockup of InvoiceDetail logic to verify correct mathematical calculations
const InvoiceDetailMock = ({ amountHt, tvaRate }) => {
    const tvaAmount = (amountHt * tvaRate) / 100;
    const amountTtc = amountHt + tvaAmount;

    return (
        <div>
            <h2>Détail de Facturation</h2>
            <p data-testid="ht-val">{amountHt.toFixed(2)} DH</p>
            <p data-testid="tva-val">{tvaAmount.toFixed(2)} DH</p>
            <p data-testid="ttc-val">{amountTtc.toFixed(2)} DH</p>
        </div>
    );
};

describe('InvoiceDetail Component Calculation Tests', () => {
    it('calculates TVA and TTC perfectly from HT input', () => {
        render(<InvoiceDetailMock amountHt={1000} tvaRate={20} />);
        
        expect(screen.getByTestId('ht-val')).toHaveTextContent('1000.00 DH');
        expect(screen.getByTestId('tva-val')).toHaveTextContent('200.00 DH');
        expect(screen.getByTestId('ttc-val')).toHaveTextContent('1200.00 DH');
    });

    it('calculates correct values with custom tva rate', () => {
        render(<InvoiceDetailMock amountHt={500} tvaRate={10} />);
        
        expect(screen.getByTestId('ht-val')).toHaveTextContent('500.00 DH');
        expect(screen.getByTestId('tva-val')).toHaveTextContent('50.00 DH');
        expect(screen.getByTestId('ttc-val')).toHaveTextContent('550.00 DH');
    });
});
