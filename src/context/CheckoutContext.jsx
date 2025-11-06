import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const CheckoutContext = createContext(null);

const initialState = {
    plan: null,              // { id, title, priceCents, interval }
    addons: [],              // [{ id, title, priceCents }]
    customer: {},            // { name, email, ... }
};

function reviveState() {
    try {
        const raw = localStorage.getItem('checkout_state');
        if (!raw) return initialState;
        const s = JSON.parse(raw);
        return { ...initialState, ...s };
    } catch {
        return initialState;
    }
}

function reducer(state, action) {
    switch (action.type) {
        case 'SET_PLAN':
            return { ...state, plan: action.plan };
        case 'CLEAR_PLAN':
            return { ...state, plan: null };
        case 'TOGGLE_ADDON': {
            const exists = state.addons.find(a => a.id === action.addon.id);
            const addons = exists
                ? state.addons.filter(a => a.id !== action.addon.id)
                : [...state.addons, action.addon];
            return { ...state, addons };
        }
        case 'SET_CUSTOMER':
            return { ...state, customer: { ...state.customer, ...action.customer } };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
}

export function CheckoutProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, undefined, reviveState);

    useEffect(() => {
        localStorage.setItem('checkout_state', JSON.stringify(state));
    }, [state]);

    const totalCents = useMemo(() => {
        const plan = state.plan?.priceCents || 0;
        const addons = state.addons.reduce((acc, a) => acc + (a.priceCents || 0), 0);
        return plan + addons;
    }, [state.plan, state.addons]);

    const api = useMemo(() => ({
        state,
        totalCents,
        setPlan: (plan) => dispatch({ type: 'SET_PLAN', plan }),
        toggleAddon: (addon) => dispatch({ type: 'TOGGLE_ADDON', addon }),
        setCustomer: (customer) => dispatch({ type: 'SET_CUSTOMER', customer }),
        reset: () => dispatch({ type: 'RESET' }),
    }), [state, totalCents]);

    return (
        <CheckoutContext.Provider value={api}>
            {children}
        </CheckoutContext.Provider>
    );
}

export function useCheckout() {
    const ctx = useContext(CheckoutContext);
    if (!ctx) throw new Error('useCheckout must be used within CheckoutProvider');
    return ctx;
}
