import { supabase } from './supabaseClient';

// ── Menús: obtiene el planning semanal ─────────────────────────────────────
export const fetchMenus = async (month = '') => {
  try {
    const { data, error } = await supabase
      .from('menu_planning')
      .select('*')
      .order('date', { ascending: true })
      .limit(30);

    if (error) throw error;
    return { success: true, items: data || [] };
  } catch (error) {
    console.error('Error fetching menus:', error);
    return { success: false, items: [], error: error.message };
  }
};

// ── Lista de compras: explota ingredientes necesarios ──────────────────────
export const fetchShoppingList = async (month = '') => {
  try {
    const { data, error } = await supabase
      .from('ingredients')
      .select('id, name, unit, stock_quantity, min_stock, cost_per_unit')
      .order('name', { ascending: true });

    if (error) throw error;
    return { success: true, items: data || [] };
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    return { success: false, items: [], error: error.message };
  }
};

// ── Insumos: catálogo completo de ingredientes con precios ─────────────────
export const fetchInsumos = async () => {
  try {
    const { data, error } = await supabase
      .from('ingredients')
      .select(`
        id,
        name,
        unit,
        stock_quantity,
        min_stock,
        cost_per_unit,
        supplier_prices (
          price_per_unit,
          suppliers ( name )
        )
      `)
      .order('name', { ascending: true });

    if (error) throw error;
    return { success: true, items: data || [] };
  } catch (error) {
    console.error('Error fetching insumos:', error);
    return { success: false, items: [], error: error.message };
  }
};

// ── Actualizar precio de un ingrediente ────────────────────────────────────
export const updateIngredientPrice = async (id, costPerUnit) => {
  try {
    const { error } = await supabase
      .from('ingredients')
      .update({ cost_per_unit: parseFloat(costPerUnit) })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return { success: false, error: error.message };
  }
};

// ── Estadísticas del dashboard ─────────────────────────────────────────────
export const fetchDashboardStats = async () => {
  try {
    const [ingredientsRes, lowStockRes, ordersRes] = await Promise.all([
      supabase.from('ingredients').select('id', { count: 'exact', head: true }),
      supabase.from('ingredients').select('id', { count: 'exact', head: true })
        .lt('stock_quantity', supabase.raw('min_stock')),
      supabase.from('purchase_orders').select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ]);

    return {
      success: true,
      totalIngredients: ingredientsRes.count || 0,
      lowStockAlerts: lowStockRes.count || 0,
      pendingOrders: ordersRes.count || 0,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { success: false };
  }
};

// ── Compatibilidad retroactiva (mantiene firma anterior) ───────────────────
export const fetchData = async (action, month = '') => {
  switch (action) {
    case 'menus':       return fetchMenus(month);
    case 'shopping_list':
    case 'compras':     return fetchShoppingList(month);
    case 'insumos':     return fetchInsumos();
    default:            return fetchShoppingList(month);
  }
};

export const saveData = async (entity, id, fields) => {
  if (entity === 'insumos' && fields.cost_per_unit !== undefined) {
    return updateIngredientPrice(id, fields.cost_per_unit);
  }
  return { success: false, error: 'Operación no soportada' };
};
