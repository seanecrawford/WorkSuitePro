import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

import InventoryList from '@/components/inventory/InventoryList.jsx';
import SupplierList from '@/components/inventory/SupplierList.jsx';
import PurchaseOrderList from '@/components/inventory/PurchaseOrderList.jsx';
import ProcurementToolsPlaceholder from '@/components/inventory/ProcurementToolsPlaceholder.jsx';
import InventoryModal from '@/components/inventory/InventoryModal.jsx';
import InventoryStats from '@/components/inventory/InventoryStats.jsx';
import InventoryPageHeader from '@/components/inventory/InventoryPageHeader.jsx';
import InventoryTabsList from '@/components/inventory/InventoryTabsList.jsx';
import InventorySearchBars from '@/components/inventory/InventorySearchBars.jsx';

import { 
  fetchInventoryItems as apiFetchInventoryItems,
  fetchSuppliers as apiFetchSuppliers,
  fetchPurchaseOrders as apiFetchPurchaseOrders,
  saveInventoryItem,
  saveSupplier,
  savePurchaseOrder,
  deleteInventoryItem,
  deleteSupplier,
  deletePurchaseOrder
} from '@/components/inventory/inventoryApi.js';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const InventoryPageRefactor = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("inventory");
  
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState(null);

  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [supplierError, setSupplierError] = useState(null);
  
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loadingPOs, setLoadingPOs] = useState(false);
  const [poError, setPoError] = useState(null);

  const [searchTerms, setSearchTerms] = useState({
    inventory: "",
    suppliers: "",
    purchaseOrders: ""
  });

  const [currentItem, setCurrentItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  const loadInventoryItems = useCallback(async () => {
    await apiFetchInventoryItems(setLoadingInventory, setInventoryError, setInventoryItems, toast);
  }, [toast]);

  const loadSuppliers = useCallback(async () => {
    await apiFetchSuppliers(setLoadingSuppliers, setSupplierError, setSuppliers, toast);
  }, [toast]);
  
  const loadPurchaseOrders = useCallback(async () => {
    await apiFetchPurchaseOrders(setLoadingPOs, setPoError, setPurchaseOrders, toast);
  }, [toast]);

  useEffect(() => {
    loadInventoryItems(); 
    if (activeTab === "suppliers") loadSuppliers();
    if (activeTab === "purchase-orders") loadPurchaseOrders();
  }, [activeTab, loadInventoryItems, loadSuppliers, loadPurchaseOrders]);

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setCurrentItem(item ? { ...item } : {});
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    let success = false;
    if (modalType === 'addInventory' || modalType === 'editInventory') {
      success = await saveInventoryItem(currentItem, setLoadingInventory, toast, loadInventoryItems);
    } else if (modalType === 'addSupplier' || modalType === 'editSupplier') {
      success = await saveSupplier(currentItem, setLoadingSuppliers, toast, loadSuppliers);
    } else if (modalType === 'addPO' || modalType === 'editPO') {
      success = await savePurchaseOrder(currentItem, setLoadingPOs, toast, loadPurchaseOrders);
    }

    if (success) {
      setIsModalOpen(false);
      setCurrentItem(null);
    }
  };
  
  const handleDelete = async (type, id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    if (type === 'inventory') {
      await deleteInventoryItem(id, name, toast, loadInventoryItems);
    } else if (type === 'supplier') {
      await deleteSupplier(id, name, toast, loadSuppliers);
    } else if (type === 'po') {
      await deletePurchaseOrder(id, name, toast, loadPurchaseOrders);
    }
  };

  const getFilteredItems = () => {
    if (activeTab === 'inventory') {
      return inventoryItems.filter(item => 
        item.name.toLowerCase().includes(searchTerms.inventory.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerms.inventory.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchTerms.inventory.toLowerCase()))
      );
    }
    if (activeTab === 'suppliers') {
      return suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerms.suppliers.toLowerCase()) ||
        (supplier.contact_name && supplier.contact_name.toLowerCase().includes(searchTerms.suppliers.toLowerCase()))
      );
    }
    if (activeTab === 'purchase-orders') {
      return purchaseOrders.filter(po =>
        po.po_number.toLowerCase().includes(searchTerms.purchaseOrders.toLowerCase()) ||
        (po.suppliers && po.suppliers.name && po.suppliers.name.toLowerCase().includes(searchTerms.purchaseOrders.toLowerCase())) ||
        po.status.toLowerCase().includes(searchTerms.purchaseOrders.toLowerCase())
      );
    }
    return [];
  };
  
  const filteredItems = getFilteredItems();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden"
    >
      <InventoryPageHeader activeTab={activeTab} onOpenModal={handleOpenModal} itemVariants={itemVariants} />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col overflow-hidden">
        <InventoryTabsList activeTab={activeTab} setActiveTab={setActiveTab} itemVariants={itemVariants} />
        <InventorySearchBars activeTab={activeTab} searchTerms={searchTerms} setSearchTerms={setSearchTerms} itemVariants={itemVariants} />

        <TabsContent value="inventory" className="flex-grow overflow-hidden">
          <motion.div variants={itemVariants} className="h-full">
            <InventoryList 
              items={filteredItems} 
              loading={loadingInventory} 
              error={inventoryError} 
              searchTerm={searchTerms.inventory}
              onEdit={(item) => handleOpenModal('editInventory', item)} 
              onDelete={(id, name) => handleDelete('inventory', id, name)}
              onAddItem={() => handleOpenModal('addInventory')}
              onClearSearch={() => setSearchTerms(prev => ({...prev, inventory: ""}))}
            />
          </motion.div>
        </TabsContent>
        <TabsContent value="statistics" className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 p-1">
          <motion.div variants={itemVariants} className="h-full">
            <InventoryStats inventoryItems={inventoryItems} loading={loadingInventory} error={inventoryError} />
          </motion.div>
        </TabsContent>
        <TabsContent value="suppliers" className="flex-grow overflow-hidden">
           <motion.div variants={itemVariants} className="h-full">
            <SupplierList 
              suppliers={filteredItems} 
              loading={loadingSuppliers} 
              error={supplierError} 
              searchTerm={searchTerms.suppliers}
              onEdit={(item) => handleOpenModal('editSupplier', item)} 
              onDelete={(id, name) => handleDelete('supplier', id, name)}
              onAddSupplier={() => handleOpenModal('addSupplier')}
              onClearSearch={() => setSearchTerms(prev => ({...prev, suppliers: ""}))}
            />
          </motion.div>
        </TabsContent>
        <TabsContent value="purchase-orders" className="flex-grow overflow-hidden">
          <motion.div variants={itemVariants} className="h-full">
            <PurchaseOrderList 
              purchaseOrders={filteredItems} 
              loading={loadingPOs} 
              error={poError} 
              searchTerm={searchTerms.purchaseOrders}
              onEdit={(item) => handleOpenModal('editPO', item)} 
              onDelete={(id, name) => handleDelete('po', id, name)}
              onAddPO={() => handleOpenModal('addPO')}
              onClearSearch={() => setSearchTerms(prev => ({...prev, purchaseOrders: ""}))}
            />
          </motion.div>
        </TabsContent>
        <TabsContent value="tools" className="flex-grow overflow-hidden">
          <ProcurementToolsPlaceholder itemVariants={itemVariants} />
        </TabsContent>
      </Tabs>

      <InventoryModal 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        modalType={modalType} 
        currentItem={currentItem} 
        handleFormChange={handleFormChange} 
        handleSave={handleSave}
        suppliers={suppliers}
      />
    </motion.div>
  );
};

export default InventoryPageRefactor;