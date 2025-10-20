'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layout/Footer';
import SearchForm from '@/components/dashboard/SearchForm';
import DomainsSection from '@/components/dashboard/DomainsSection';
import RankMapSection from '@/components/dashboard/RankMapSection';
import ScanMapSection from '@/components/dashboard/ScanMapSection';
import KeywordCounter from '@/components/dashboard/KeywordCounter';
import StatsSection from '@/components/dashboard/StatsSection';
import ProfileSection from '@/components/dashboard/ProfileSection';
import './dashboard.css';

export default function DashboardPage() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('search-section');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const tab = searchParams.get('tab');
        console.log('URL tab:', tab, '| Estado actual:', activeTab);
        if (tab) {
            setActiveTab(tab);
        } else {
            setActiveTab('search-section');
        }
    }, [searchParams]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'search-section':
                return <SearchForm />;
            case 'domains-section':
                return <DomainsSection />;
            case 'rankmap-section':
                return <RankMapSection />;
            case 'scanmap-section':
                return <ScanMapSection />;
            case 'keywords-history-section':
                return <KeywordCounter />;
            case 'stats-section':
                return <StatsSection />;
            case 'profile-section':
                return <ProfileSection />;
            case 'contact-section':
                window.location.href = '/contacto.html';
                return null;
            case 'admin-panel':
                window.location.href = '/admin.html';
                return null;
            default:
                return <SearchForm />;
        }
    };

    return (
        <div className="app-container">
            <header className="top-bar">
                <button className="mobile-menu-toggle" onClick={toggleSidebar}>
                    <i className="fas fa-bars"></i>
                </button>
                <Link href="/dashboard" className="logo">
                    RANKU
                    <Image src="/assets/ninja.png" alt="Ninja Ranku.es" className="logo-icon" width={20} height={20} />
                </Link>
                <div className="auth-buttons">
                    <form action="/api/auth/logout" method="post">
                        <button type="submit" className="logout-button">Cerrar Sesión</button>
                    </form>
                </div>
            </header>

            <div className="main-layout">
                <aside className={`sidebar ${isSidebarOpen ? 'active' : ''}`} id="sidebar">
                    <div className="sidebar-header">
                        <div className="user-profile">
                            <div className="avatar">C</div>
                            <span className="username-text">Carlos Spain</span>
                        </div>
                    </div>
                    <nav className="sidebar-nav">
                        <ul>
                            <li>
                                <button
                                    className={`sidebar-link ${activeTab === 'search-section' ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveTab('search-section');
                                        setIsSidebarOpen(false);
                                    }}
                                >
                                    <i className="fas fa-search"></i> Búsqueda SEO
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`sidebar-link ${activeTab === 'domains-section' ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveTab('domains-section');
                                        setIsSidebarOpen(false);
                                    }}
                                >
                                    <i className="fas fa-globe"></i> Dominios
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`sidebar-link ${activeTab === 'rankmap-section' ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveTab('rankmap-section');
                                        setIsSidebarOpen(false);
                                    }}
                                >
                                    <i className="fas fa-map-marker-alt"></i> RankMap
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`sidebar-link ${activeTab === 'scanmap-section' ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveTab('scanmap-section');
                                        setIsSidebarOpen(false);
                                    }}
                                >
                                    <i className="fas fa-map-marked-alt"></i> ScanMap
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`sidebar-link ${activeTab === 'keywords-history-section' ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveTab('keywords-history-section');
                                        setIsSidebarOpen(false);
                                    }}
                                >
                                    <i className="fas fa-keyboard"></i> Contador de Keywords
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`sidebar-link ${activeTab === 'stats-section' ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveTab('stats-section');
                                        setIsSidebarOpen(false);
                                    }}
                                >
                                    <i className="fas fa-chart-line"></i> Estadísticas
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`sidebar-link ${activeTab === 'profile-section' ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveTab('profile-section');
                                        setIsSidebarOpen(false);
                                    }}
                                >
                                    <i className="fas fa-user"></i> Perfil & Suscripción
                                </button>
                            </li>
                            <li>
                                <button
                                    className="sidebar-link"
                                    onClick={() => {
                                        setActiveTab('contact-section');
                                        setIsSidebarOpen(false);
                                    }}
                                >
                                    <i className="fas fa-envelope"></i> Contacto
                                </button>
                            </li>
                            <li>
                                <button
                                    className="sidebar-link"
                                    onClick={() => {
                                        setActiveTab('admin-panel');
                                        setIsSidebarOpen(false);
                                    }}
                                >
                                    <i className="fas fa-cog"></i> Panel de Admin
                                </button>
                            </li>
                        </ul>
                    </nav>
                </aside>

                <main className="main-content">
                    <div className="container">
                        {renderContent()}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}