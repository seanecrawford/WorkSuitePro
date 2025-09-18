import { supabase } from '@/lib/supabaseClient';

export const fetchInventoryItems = async (setLoading, setError, setData, toast) => {
  setLoading(true);
  setError(null);
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`*, suppliers (name)`)
      .order('name', { ascending: true });
    if (error) throw error;
    setData(data || []);
  } catch (error) {
    setError(error.message);
    toast({ title: "Error fetching inventory", description: error.message, variant: "destructive" });
  } finally {
    setLoading(false);
  }
};

export const fetchSuppliers = async (setLoading, setError, setData, toast) => {
  setLoading(true);
  setError(null);
  try {
    const { data, error } = await supabase.from('suppliers').select('*').order('name', { ascending: true });
    if (error) throw error;
    setData(data || []);
  } catch (error) {
    setError(error.message);
    toast({ title: "Error fetching suppliers", description: error.message, variant: "destructive" });
  } finally {
    setLoading(false);
  }
};

export const fetchPurchaseOrders = async (setLoading, setError, setData, toast) => {
  setLoading(true);
  setError(null);
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`*, suppliers (name), purchase_order_items ( item_id, quantity_ordered, unit_cost, inventory_items (name, sku) )`)
      .order('order_date', { ascending: false });
    if (error) throw error;
    setData(data || []);
  } catch (error) {
    setError(error.message);
    toast({ title: "Error fetching purchase orders", description: error.message, variant: "destructive" });
  } finally {
    setLoading(false);
  }
};

export const saveInventoryItem = async (item, setLoading, toast, onSuccessCallback) => {
  setLoading(true);
  const { supplier_id, suppliers, ...itemData } = item; 
  const upsertData = { ...itemData, supplier_id: supplier_id || null };

  const { error } = item.item_id 
      ? await supabase.from('inventory_items').update(upsertData).eq('item_id', item.item_id)
      : await supabase.from('inventory_items').insert(upsertData);
  
  setLoading(false);
  if (error) {
    toast({ title: "Error saving item", description: error.message, variant: "destructive" });
    return false;
  } else {
    toast({ title: "Item saved!", description: `${item.name} saved successfully.` });
    if (onSuccessCallback) onSuccessCallback();
    return true;
  }
};

export const saveSupplier = async (supplier, setLoading, toast, onSuccessCallback) => {
  setLoading(true);
  const { error } = supplier.supplier_id 
    ? await supabase.from('suppliers').update(supplier).eq('supplier_id', supplier.supplier_id)
    : await supabase.from('suppliers').insert(supplier);
  
  setLoading(false);
  if (error) {
    toast({ title: "Error saving supplier", description: error.message, variant: "destructive" });
    return false;
  } else {
    toast({ title: "Supplier saved!", description: `${supplier.name} saved successfully.` });
    if (onSuccessCallback) onSuccessCallback();
    return true;
  }
};

export const savePurchaseOrder = async (po, setLoading, toast, onSuccessCallback) => {
  setLoading(true);
  const { purchase_order_items, suppliers, ...poData } = po;
  
  const { error } = poData.po_id
    ? await supabase.from('purchase_orders').update(poData).eq('po_id', poData.po_id)
    : await supabase.from('purchase_orders').insert(poData);
  
  setLoading(false);
  if (error) {
    toast({ title: "Error saving PO", description: error.message, variant: "destructive" });
    return false;
  } else {
    toast({ title: "Purchase Order saved!", description: `PO #${poData.po_number} saved successfully.`});
    if (onSuccessCallback) onSuccessCallback();
    return true;
  }
};

export const deleteInventoryItem = async (id, name, toast, onSuccessCallback) => {
  const { error } = await supabase.from('inventory_items').delete().eq('item_id', id);
  if (error) {
    toast({ title: `Error deleting ${name}`, description: error.message, variant: "destructive" });
  } else {
    toast({ title: `${name} deleted`, description: `${name} has been successfully deleted.` });
    if (onSuccessCallback) onSuccessCallback();
  }
};

export const deleteSupplier = async (id, name, toast, onSuccessCallback) => {
  const { error } = await supabase.from('suppliers').delete().eq('supplier_id', id);
  if (error) {
    toast({ title: `Error deleting ${name}`, description: error.message, variant: "destructive" });
  } else {
    toast({ title: `${name} deleted`, description: `${name} has been successfully deleted.` });
    if (onSuccessCallback) onSuccessCallback();
  }
};

export const deletePurchaseOrder = async (id, name, toast, onSuccessCallback) => {
  let error;
  // First delete related items if necessary (cascade might handle this in DB)
  ({ error } = await supabase.from('purchase_order_items').delete().eq('po_id', id));
  if (!error) {
    ({ error } = await supabase.from('purchase_orders').delete().eq('po_id', id));
  }
  
  if (error) {
    toast({ title: `Error deleting PO ${name}`, description: error.message, variant: "destructive" });
  } else {
    toast({ title: `PO ${name} deleted`, description: `PO ${name} has been successfully deleted.` });
    if (onSuccessCallback) onSuccessCallback();
  }
};