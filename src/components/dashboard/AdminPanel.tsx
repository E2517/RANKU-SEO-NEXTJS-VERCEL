'use client';

import { useEffect } from 'react';

export default function AdminPanel() {
    useEffect(() => {
        window.location.href = '/admin.html';
    }, []);

    return null;
}