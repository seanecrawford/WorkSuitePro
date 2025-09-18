import React, { useState, useEffect, useCallback, useContext } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserCog, Users, Briefcase, Mail, Target, BarChartHorizontal, Building2, MessageSquare, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { AuthContext } from '@/contexts/AuthContext';
import { format, parseISO, isValid } from 'date-fns';

import CRMDashboardTab from '@/components/crm/CRMDashboardTab';
import GenericCRMListTab from '@/components/crm/GenericCRMListTab';
import { CRMCompanyForm, CRMContactForm, CRMDealForm, CRMCommunicationForm } from '@/components/crm/CRMForms';

const ClientManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [crmData, setCrmData] = useState({ companies: [], contacts: [], deals: [], communications: [], users: [] });
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [companiesRes, contactsRes, dealsRes, communicationsRes, usersRes] = await Promise.all([
        supabase.from('companies').select('*').order('companyname'),
        supabase.from('client_contacts').select('*, companies(companyname)').order('last_name'),
        supabase.from('deals_leads').select(`
          *, 
          companies(companyname), 
          client_contacts(first_name, last_name),
          owner_user_id 
        `)
        .order('deal_name'),
        supabase.from('communication_logs').select(`
          *, 
          companies(companyname), 
          client_contacts(first_name, last_name), 
          deals_leads(deal_name), 
          user_id
        `)
        .order('communication_date', { ascending: false }),
        supabase.from('profiles').select('profile_id, user_id, email, fullname')
      ]);

      if (companiesRes.error) throw companiesRes.error;
      if (contactsRes.error) throw contactsRes.error;
      if (dealsRes.error) {
        console.error("Error fetching deals:", dealsRes.error);
        throw dealsRes.error;
      }
      if (communicationsRes.error) {
        console.error("Error fetching communications:", communicationsRes.error);
        throw communicationsRes.error;
      }
      if (usersRes.error) throw usersRes.error;
      
      const profilesData = usersRes.data || [];

      const processedDeals = (dealsRes.data || []).map(deal => {
        const ownerProfile = profilesData.find(p => p.user_id === deal.owner_user_id);
        return { ...deal, owner: ownerProfile || null };
      });

      const processedCommunications = (communicationsRes.data || []).map(comm => {
        const loggerProfile = profilesData.find(p => p.user_id === comm.user_id);
        return { ...comm, logger: loggerProfile || null };
      });
      
      setCrmData({
        companies: companiesRes.data || [],
        contacts: contactsRes.data || [],
        deals: processedDeals,
        communications: processedCommunications,
        users: profilesData 
      });

    } catch (err) {
      setError(err.message);
      toast({ title: "Error Fetching CRM Data", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveFactory = (tableName, idField, itemType) => async (formData) => {
    try {
      let result;
      const saveData = { ...formData }; 
      const id = saveData[idField];
      if (idField in saveData) delete saveData[idField];


      Object.keys(saveData).forEach(key => {
        if (saveData[key] === '') saveData[key] = null;
        
        if (key === 'owner' && saveData.owner && typeof saveData.owner === 'object' && saveData.owner.user_id) {
          saveData.owner_user_id = saveData.owner.user_id;
          delete saveData.owner;
        } else if (key === 'owner' && saveData.owner === null) {
          saveData.owner_user_id = null;
          delete saveData.owner;
        }


        if (key === 'logger' && saveData.logger && typeof saveData.logger === 'object' && saveData.logger.user_id) {
          saveData.user_id = saveData.logger.user_id;
          delete saveData.logger;
        } else if (key === 'logger' && saveData.logger === null) {
          saveData.user_id = null;
          delete saveData.logger;
        }
      });

      if (formData.owner_user_id && !saveData.owner_user_id && saveData.owner_user_id !== null) {
        saveData.owner_user_id = formData.owner_user_id;
      }
      if (formData.user_id && !saveData.user_id && saveData.user_id !== null && itemType === "Log") { 
        saveData.user_id = formData.user_id;
      }


      if (id) { 
        result = await supabase.from(tableName).update(saveData).eq(idField, id).select();
      } else { 
        result = await supabase.from(tableName).insert(saveData).select();
      }
      if (result.error) throw result.error;
      fetchData(); 
    } catch (err) { console.error(`Error saving ${itemType}:`, err); throw err; }
  };

  const handleDeleteFactory = (tableName, idField, itemType) => async (id) => {
    if (!window.confirm(`Are you sure you want to delete this ${itemType.toLowerCase()}? This action might be restricted by database constraints if other records depend on it.`)) return;
    try {
      const { error } = await supabase.from(tableName).delete().eq(idField, id);
      if (error) throw error;
      toast({ title: `${itemType} Deleted` });
      fetchData(); 
    } catch (err) { toast({ title: `Error Deleting ${itemType}`, description: err.message, variant: "destructive" }); }
  };

  const companyColumns = [
    { header: 'Name', accessor: 'companyname' }, { header: 'Industry', accessor: 'industry' },
    { header: 'Email', accessor: 'contact_email' }, { header: 'Phone', accessor: 'contact_phone' },
    { header: 'Website', accessor: 'website', render: (item) => item.website ? <a href={item.website.startsWith('http') ? item.website : `https://${item.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{item.website}</a> : '-' }
  ];
  const contactColumns = [
    { header: 'Name', accessor: 'first_name', render: (item) => `${item.first_name || ''} ${item.last_name || ''}` },
    { header: 'Email', accessor: 'email' }, { header: 'Phone', accessor: 'phone' },
    { header: 'Job Title', accessor: 'job_title' },
    { header: 'Company', accessor: 'companies.companyname', render: (item) => item.companies?.companyname || '-' }
  ];
  const dealColumns = [
    { header: 'Deal Name', accessor: 'deal_name' }, { header: 'Stage', accessor: 'stage' },
    { header: 'Value', accessor: 'value', render: (item) => item.value ? `${Number(item.value).toLocaleString()}`: '-' },
    { header: 'Company', accessor: 'companies.companyname', render: (item) => item.companies?.companyname || '-' },
    { header: 'Owner', accessor: 'owner', render: (item) => item.owner?.email || item.owner?.fullname || (item.owner_user_id ? 'N/A - Profile Missing' : '-') }
  ];
  const communicationColumns = [
    { header: 'Type', accessor: 'communication_type' }, { header: 'Subject', accessor: 'subject' },
    { header: 'Date', accessor: 'communication_date', render: (item) => item.communication_date && isValid(parseISO(item.communication_date)) ? format(parseISO(item.communication_date), 'PPpp') : 'Invalid Date' },
    { header: 'Company', accessor: 'companies.companyname', render: (item) => item.companies?.companyname || '-' },
    { header: 'Logged By', accessor: 'logger', render: (item) => item.logger?.email || item.logger?.fullname || (item.user_id ? 'N/A - Profile Missing' : '-') }
  ];

  const pageVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } } };
  const itemVariants = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

  if (error && !loading) return <Card className="m-4 bg-destructive/10 border-destructive text-destructive-foreground"><CardHeader><CardTitle className="flex items-center"><AlertTriangle className="mr-2"/>Error Loading CRM</CardTitle></CardHeader><CardContent>{error}</CardContent></Card>;
  
  const tabConfig = [
    { value: "dashboard", label: "Dashboard", icon: BarChartHorizontal, component: <CRMDashboardTab data={crmData} /> },
    { value: "companies", label: "Companies", icon: Building2, component: <GenericCRMListTab title="Client Companies" icon={Building2} items={crmData.companies} columns={companyColumns} renderForm={CRMCompanyForm} onSave={handleSaveFactory('companies', 'company_uid', 'Company')} onDelete={handleDeleteFactory('companies', 'company_uid', 'Company')} itemType="Company" searchFields={['companyname', 'industry', 'contact_email']} isLoading={loading} /> },
    { value: "contacts", label: "Contacts", icon: Users, component: <GenericCRMListTab title="Client Contacts" icon={Users} items={crmData.contacts} columns={contactColumns} renderForm={CRMContactForm} onSave={handleSaveFactory('client_contacts', 'contact_id', 'Contact')} onDelete={handleDeleteFactory('client_contacts', 'contact_id', 'Contact')} relatedData={{ companies: crmData.companies }} itemType="Contact" searchFields={['first_name', 'last_name', 'email', 'job_title', 'companies.companyname']} isLoading={loading} /> },
    { value: "deals", label: "Leads & Deals", icon: Target, component: <GenericCRMListTab title="Leads & Deals" icon={Target} items={crmData.deals} columns={dealColumns} renderForm={CRMDealForm} onSave={handleSaveFactory('deals_leads', 'deal_id', 'Deal')} onDelete={handleDeleteFactory('deals_leads', 'deal_id', 'Deal')} relatedData={{ companies: crmData.companies, contacts: crmData.contacts, users: crmData.users.map(u => ({...u, id: u.user_id, name: u.fullname || u.email })) }} itemType="Deal" searchFields={['deal_name', 'stage', 'companies.companyname', 'owner.email', 'owner.fullname']} isLoading={loading} /> },
    { value: "communication", label: "Communication", icon: MessageSquare, component: <GenericCRMListTab title="Communication Logs" icon={MessageSquare} items={crmData.communications} columns={communicationColumns} renderForm={CRMCommunicationForm} onSave={handleSaveFactory('communication_logs', 'log_id', 'Log')} onDelete={handleDeleteFactory('communication_logs', 'log_id', 'Log')} relatedData={{ companies: crmData.companies, contacts: crmData.contacts, deals: crmData.deals, users: crmData.users.map(u => ({...u, id: u.user_id, name: u.fullname || u.email })) }} itemType="Log" searchFields={['communication_type', 'subject', 'companies.companyname', 'logger.email', 'logger.fullname']} isLoading={loading} /> }
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6 p-4 md:p-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <UserCog className="mr-3 h-8 w-8 text-[var(--theme-accent-clients)]" /> Client Relationship Management
        </h1>
      </motion.div>
      <Tabs defaultValue="dashboard" className="w-full">
        <motion.div variants={itemVariants}>
          <TabsList className="tabs-clients grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
            {tabConfig.map(tab => (<TabsTrigger key={tab.value} value={tab.value}><tab.icon className="mr-2 h-4 w-4" />{tab.label}</TabsTrigger>))}
          </TabsList>
        </motion.div>
        <motion.div variants={itemVariants} className="mt-6">
          {tabConfig.map(tab => (<TabsContent key={tab.value} value={tab.value}>{tab.component}</TabsContent>))}
        </motion.div>
      </Tabs>
    </motion.div>
  );
};

export default ClientManagementPage;