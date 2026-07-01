import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart, ShoppingBag, Utensils, RefreshCw,
  AlertTriangle, Package, TrendingUp, ChevronRight,
  LayoutDashboard, Bell
} from 'lucide-react';
import { fetchData, saveData, fetchDashboardStats } from './api';
import './index.css';

// ─── Componente Badge de stock ──────────────────────────────────────────────
const StockBadge = ({ qty, min }) => {
  if (qty === undefined || qty === null) return null;
  const ratio = min > 0 ? qty / min : 1;
  const cls = ratio <= 0 ? 'badge-danger' : ratio < 1 ? 'badge-warning' : 'badge-ok';
  const label = ratio <= 0 ? '⛔ Agotado' : ratio < 1 ? '⚠️ Bajo' : '✅ OK';
  return <span className={`badge ${cls}`}>{label}</span>;
};

// ─── Tab: Dashboard de resumen ──────────────────────────────────────────────
const DashboardTab = ({ onNavigate }) => {
  const [stats, setStats] = useState({ totalIngredients: 0, lowStockAlerts: 0, pendingOrders: 0 });

  useEffect(() => {
    fetchDashboardStats().then(res => {
      if (res.success) setStats(res);
    });
  }, []);

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-blue"><Package size={22} /></div>
          <div className="stat-value">{stats.totalIngredients}</div>
          <div className="stat-label">Ingredientes</div>
        </div>
        <div className="stat-card" onClick={() => onNavigate('insumos')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon icon-orange"><AlertTriangle size={22} /></div>
          <div className="stat-value stat-alert">{stats.lowStockAlerts}</div>
          <div className="stat-label">Stock Bajo</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-green"><TrendingUp size={22} /></div>
          <div className="stat-value">{stats.pendingOrders}</div>
          <div className="stat-label">Pedidos Pend.</div>
        </div>
      </div>

      <div className="premium-card" style={{ marginTop: '16px' }}>
        <h3 className="section-title">Accesos Rápidos</h3>
        {[
          { icon: <Utensils size={18} />, label: 'Ver Menú Semanal', tab: 'menus' },
          { icon: <ShoppingBag size={18} />, label: 'Lista de Compras', tab: 'compras' },
          { icon: <Package size={18} />, label: 'Control de Insumos', tab: 'insumos' },
        ].map(({ icon, label, tab }) => (
          <button key={tab} className="quick-action" onClick={() => onNavigate(tab)}>
            <span className="quick-action-icon">{icon}</span>
            <span>{label}</span>
            <ChevronRight size={16} className="chevron" />
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Tab: Menús semanales ───────────────────────────────────────────────────
const MenusTab = ({ data, loading }) => {
  if (loading) return <div className="loading-spinner" />;
  if (!data.length) return (
    <div className="empty-state">
      <Utensils size={40} className="empty-icon" />
      <p>No hay menús planificados.</p>
      <small>Añade planificación desde el panel de administración.</small>
    </div>
  );

  return (
    <div className="premium-card">
      <h2 className="section-title">Menú Semanal</h2>
      <div className="item-list">
        {data.map((item, idx) => (
          <div key={idx} className="menu-row">
            <div className="menu-day">{item.date || item.Día}</div>
            <div className="menu-meals">
              <div className="menu-meal">
                <span className="item-meta">Almuerzo</span>
                <span className="item-name">{item.lunch_recipe || item.Almuerzo || '—'}</span>
              </div>
              <div className="menu-meal" style={{ alignItems: 'flex-end' }}>
                <span className="item-meta">Cena</span>
                <span className="item-name">{item.dinner_recipe || item.Cena || '—'}</span>
              </div>
            </div>
            {(item.side_dish || item.Guarnición) && (
              <div className="menu-garnish">+ {item.side_dish || item.Guarnición}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Tab: Lista de compras ──────────────────────────────────────────────────
const ComprasTab = ({ data, loading, month, onMonthChange }) => {
  if (loading) return <div className="loading-spinner" />;

  const lowStock = data.filter(i => (i.stock_quantity ?? 0) < (i.min_stock ?? 0));

  return (
    <div>
      {lowStock.length > 0 && (
        <div className="alert-banner">
          <Bell size={16} />
          <span>{lowStock.length} ingrediente(s) por debajo del stock mínimo</span>
        </div>
      )}
      <div className="premium-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Lista de Compras</h2>
          <select className="month-select" value={month} onChange={e => onMonthChange(e.target.value)}>
            {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
              .map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="item-list">
          {data.map((item, idx) => (
            <div key={idx} className="item-row">
              <div className="item-info">
                <span className="item-name">{item.name || item.item || item.Nombre}</span>
                <span className="item-meta">
                  Stock: {item.stock_quantity ?? '?'} {item.unit} · Mín: {item.min_stock ?? '?'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <StockBadge qty={item.stock_quantity} min={item.min_stock} />
                <ChevronRight size={16} color="#cbd5e1" />
              </div>
            </div>
          ))}
          {!data.length && <p className="empty-msg">No hay datos para este mes.</p>}
        </div>
        <button className="btn-primary" style={{ marginTop: '20px' }}>
          <ShoppingCart size={20} />
          Generar Pedido Óptimo
        </button>
      </div>
    </div>
  );
};

// ─── Tab: Insumos ───────────────────────────────────────────────────────────
const InsumosTab = ({ data, loading, onUpdate }) => {
  if (loading) return <div className="loading-spinner" />;

  return (
    <div className="premium-card">
      <h2 className="section-title">Catálogo de Insumos</h2>
      <div className="item-list">
        {data.map((item, idx) => {
          const bestPrice = item.supplier_prices?.length
            ? Math.min(...item.supplier_prices.map(p => p.price_per_unit))
            : item.cost_per_unit;

          return (
            <div key={idx} className="item-row">
              <div className="item-info" style={{ maxWidth: '55%' }}>
                <span className="item-name">{item.name || item.Nombre}</span>
                <span className="item-meta">{item.unit || item.Categoria}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div className="price-badge">
                  €{Number(bestPrice || 0).toFixed(4)}
                </div>
                <StockBadge qty={item.stock_quantity} min={item.min_stock} />
              </div>
            </div>
          );
        })}
        {!data.length && <p className="empty-msg">No hay insumos registrados.</p>}
      </div>
    </div>
  );
};

// ─── App principal ──────────────────────────────────────────────────────────
function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [month, setMonth] = useState('Julio');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const loadData = useCallback(async () => {
    if (activeTab === 'dashboard') return;
    setLoading(true);
    const action = activeTab === 'compras' ? 'compras' : activeTab;
    const res = await fetchData(action, month);
    if (res.success) setData(res.items);
    setLoading(false);
  }, [activeTab, month]);

  useEffect(() => { loadData(); }, [loadData]);

  const tabs = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Inicio' },
    { id: 'menus',     icon: <Utensils size={18} />,         label: 'Menús' },
    { id: 'compras',   icon: <ShoppingBag size={18} />,      label: 'Compras' },
    { id: 'insumos',   icon: <Package size={18} />,          label: 'Insumos' },
  ];

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-inner">
          <div>
            <h1 className="header-title">ACFC Kitchen</h1>
            <p className="header-subtitle">Gestión Gastronómica</p>
          </div>
          {activeTab !== 'dashboard' && (
            <button onClick={loadData} className="refresh-btn" title="Actualizar datos">
              <RefreshCw size={18} className={loading ? 'spin' : ''} />
            </button>
          )}
        </div>
        {saveStatus && <div className="save-toast">{saveStatus}</div>}
      </header>

      <main className="content">
        {activeTab === 'dashboard' && (
          <DashboardTab onNavigate={tab => setActiveTab(tab)} />
        )}
        {activeTab === 'menus' && (
          <MenusTab data={data} loading={loading} />
        )}
        {activeTab === 'compras' && (
          <ComprasTab
            data={data}
            loading={loading}
            month={month}
            onMonthChange={m => { setMonth(m); }}
          />
        )}
        {activeTab === 'insumos' && (
          <InsumosTab
            data={data}
            loading={loading}
            onUpdate={async (id, price) => {
              setSaveStatus('Guardando...');
              const res = await saveData('insumos', id, { cost_per_unit: price });
              setSaveStatus(res.success ? '✅ Guardado' : '❌ Error');
              setTimeout(() => setSaveStatus(''), 2000);
            }}
          />
        )}
      </main>

      <nav className="tabs-nav">
        {tabs.map(({ id, icon, label }) => (
          <button
            key={id}
            className={`tab-btn ${activeTab === id ? 'active' : ''}`}
            onClick={() => { setActiveTab(id); setData([]); }}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
