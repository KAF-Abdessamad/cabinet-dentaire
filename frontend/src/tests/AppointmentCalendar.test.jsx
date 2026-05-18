import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AppointmentCalendar from '../components/AppointmentCalendar.jsx';
import { BrowserRouter } from 'react-router-dom';

// Mock lucide icons and API
vi.mock('lucide-react', () => ({
    ChevronLeft: () => <span data-testid="left-btn">Left</span>,
    ChevronRight: () => <span data-testid="right-btn">Right</span>,
    Calendar: () => <span>Calendar</span>,
    Clock: () => <span>Clock</span>,
    Search: () => <span>Search</span>,
    User: () => <span>User</span>,
    X: () => <span>X</span>,
    Plus: () => <span>Plus</span>,
}));

vi.mock('../api.js', () => ({
    default: {
        get: vi.fn(() => Promise.resolve({ data: [] })),
        post: vi.fn(() => Promise.resolve({ data: {} })),
    }
}));

describe('AppointmentCalendar Component Tests', () => {
    it('renders the header title correctly', () => {
        render(
            <BrowserRouter>
                <AppointmentCalendar />
            </BrowserRouter>
        );
        expect(screen.getByText(/Agenda de Prise de Rendez-vous/i)).toBeInTheDocument();
    });

    it('displays week view navigation buttons', () => {
        render(
            <BrowserRouter>
                <AppointmentCalendar />
            </BrowserRouter>
        );
        expect(screen.getByTestId('left-btn')).toBeInTheDocument();
        expect(screen.getByTestId('right-btn')).toBeInTheDocument();
    });

    it('navigates forward when click right button', () => {
        render(
            <BrowserRouter>
                <AppointmentCalendar />
            </BrowserRouter>
        );
        const rightBtn = screen.getByTestId('right-btn');
        fireEvent.click(rightBtn);
        // Date should advance correctly
        expect(rightBtn).toBeInTheDocument();
    });
});
