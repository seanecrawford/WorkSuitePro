import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { HeartHandshake, Users, DollarSign, CalendarOff, FileText, PlusCircle, Edit3, Trash2, UploadCloud, Eye, Download, Filter, Search, Loader2, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const EMPLOYMENT_STATUSES = ['Active', 'On Leave', 'Terminated', 'Pending Onboarding'];
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contractor', 'Intern'];
const LEAVE_TYPES = ['Vacation', 'Sick', 'Personal', 'Unpaid', 'Bereavement', 'Parental'];
const LEAVE_STATUSES = ['Pending', 'Approved', 'Rejected', 'Cancelled'];
const PAYROLL_STATUSES = ['Pending', 'Processed', 'Paid', 'Failed'];
const BENEFIT_TYPES = ['Health', 'Dental', 'Vision', 'Retirement', 'Life Insurance', 'Disability', 'Wellness Program', 'Other'];
const DOCUMENT_TYPES = ['Contract', 'Policy', 'Form', 'Certificate', 'Review', 'Offer Letter', 'Handbook', 'Other'];

const initialEmployeeForm = {
  first_name: '', last_name: '', email: '', phone_number: '', date_of_birth: '', hire_date: '', job_title: '', department: '', employment_status: 'Pending Onboarding', employment_type: 'Full-time', address: { street: '', city: '', state: '', zip: '', country: '' }, emergency_contact: { name: '', relationship: '', phone: '' }, avatar_url: ''
};

const HumanResourcesPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("employees");
  
  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [employeeBenefits, setEmployeeBenefits] = useState([]);
  const [hrDocuments, setHrDocuments] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // const [filters, setFilters] = useState({}); // Placeholder for future filter UI

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState(initialEmployeeForm);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };
  const itemVariants = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

  const fetchData = useCallback(async (tab) => {
    setIsLoading(true);
    try {
      let query;
      switch (tab) {
        case "employees":
          query = supabase.from("employees").select("*").order('created_at', { ascending: false });
          if (searchTerm) query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,job_title.ilike.%${searchTerm}%`);
          const { data: empData, error: empError } = await query;
          if (empError) throw empError;
          setEmployees(empData || []);
          break;
        case "leave":
          query = supabase.from("leave_requests").select("*, employees(first_name, last_name)").order('requested_at', { ascending: false });
          if (searchTerm) query = query.or(`employees.first_name.ilike.%${searchTerm}%,employees.last_name.ilike.%${searchTerm}%,leave_type.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%`);
          const { data: leaveData, error: leaveError } = await query;
          if (leaveError) throw leaveError;
          setLeaveRequests(leaveData || []);
          break;
        case "payroll":
          query = supabase.from("payroll_data").select("*, employees(first_name, last_name)").order('pay_date', { ascending: false });
           if (searchTerm) query = query.or(`employees.first_name.ilike.%${searchTerm}%,employees.last_name.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%`);
          const { data: payrollRes, error: payrollErr } = await query;
          if (payrollErr) throw payrollErr;
          setPayrollData(payrollRes || []);
          break;
        case "benefits":
          const { data: benData, error: benError } = await supabase.from("benefits").select("*").order('name');
          if (benError) throw benError;
          setBenefits(benData || []);
          
          query = supabase.from("employee_benefits").select("*, employees(first_name, last_name), benefits(name)").order('created_at', { ascending: false });
          if (searchTerm) query = query.or(`employees.first_name.ilike.%${searchTerm}%,employees.last_name.ilike.%${searchTerm}%,benefits.name.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%`);
          const { data: empBenData, error: empBenError } = await query;
          if (empBenError) throw empBenError;
          setEmployeeBenefits(empBenData || []);
          break;
        case "documents":
          query = supabase.from("hr_documents").select("*, employees(first_name, last_name)").order('upload_date', { ascending: false });
          if (searchTerm) query = query.or(`document_name.ilike.%${searchTerm}%,document_type.ilike.%${searchTerm}%,tags.cs.{${searchTerm}},employees.first_name.ilike.%${searchTerm}%,employees.last_name.ilike.%${searchTerm}%`);
          const { data: docData, error: docError } = await query;
          if (docError) throw docError;
          setHrDocuments(docData || []);
          break;
        default:
          break;
      }
    } catch (error) {
      toast({ title: "Error fetching data", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, toast]);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);
  
  const handleSearchDebounced = useCallback(
    debounce(() => fetchData(activeTab), 500), // Adjust debounce delay as needed
    [activeTab, fetchData]
  );

  useEffect(() => {
    if (searchTerm) {
      handleSearchDebounced();
    } else {
      fetchData(activeTab); // Fetch immediately if search term is cleared
    }
    return () => handleSearchDebounced.cancel?.(); // Cancel debounce on unmount or dep change
  }, [searchTerm, activeTab, fetchData, handleSearchDebounced]);


  const handleEmployeeFormChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEmployeeForm(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setEmployeeForm(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = currentEmployee
        ? await supabase.from("employees").update(employeeForm).eq("employee_id", currentEmployee.employee_id).select()
        : await supabase.from("employees").insert(employeeForm).select();

      if (error) throw error;
      toast({ title: `Employee ${currentEmployee ? 'updated' : 'added'}`, description: `${data[0].first_name} ${data[0].last_name} has been successfully ${currentEmployee ? 'updated' : 'added'}.` });
      setIsEmployeeModalOpen(false);
      setCurrentEmployee(null);
      setEmployeeForm(initialEmployeeForm);
      fetchData("employees");
    } catch (error) {
      toast({ title: `Error ${currentEmployee ? 'updating' : 'adding'} employee`, description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const openEmployeeModal = (employee = null) => {
    if (employee) {
      setCurrentEmployee(employee);
      const address = typeof employee.address === 'string' ? JSON.parse(employee.address || '{}') : (employee.address || {});
      const emergency_contact = typeof employee.emergency_contact === 'string' ? JSON.parse(employee.emergency_contact || '{}') : (employee.emergency_contact || {});
      
      setEmployeeForm({
        ...initialEmployeeForm,
        ...employee,
        address: { ...initialEmployeeForm.address, ...address },
        emergency_contact: { ...initialEmployeeForm.emergency_contact, ...emergency_contact },
        date_of_birth: employee.date_of_birth ? format(parseISO(employee.date_of_birth), 'yyyy-MM-dd') : '',
        hire_date: employee.hire_date ? format(parseISO(employee.hire_date), 'yyyy-MM-dd') : '',
      });
    } else {
      setCurrentEmployee(null);
      setEmployeeForm(initialEmployeeForm);
    }
    setIsEmployeeModalOpen(true);
  };
  
  const handleDeleteGeneric = async (table, idColumn, id, itemName, callbackTab) => {
    if (!window.confirm(`Are you sure you want to delete this ${itemName}? This action cannot be undone.`)) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from(table).delete().eq(idColumn, id);
      if (error) throw error;
      toast({ title: `${itemName} Deleted`, description: `The ${itemName} record has been successfully deleted.` });
      fetchData(callbackTab);
    } catch (error) {
      toast({ title: `Error deleting ${itemName}`, description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const renderTable = (data, columns, actions, noDataMessage, title) => (
    <Card className="bg-card-themed border-card-themed shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-foreground">{title}</CardTitle>
          <CardDescription className="text-muted-foreground">Manage {title.toLowerCase()}.</CardDescription>
        </div>
        {/* Placeholder for Add button if needed per tab */}
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <Input placeholder={`Search ${title.toLowerCase()}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm bg-input-themed border-input-themed placeholder-input-themed" />
        </div>
        {isLoading && <div className="flex justify-center items-center p-4"><Loader2 className="h-6 w-6 animate-spin text-[var(--theme-accent-hr)]"/></div>}
        {!isLoading && data.length === 0 && <p className="text-muted-foreground text-center py-4">{noDataMessage}</p>}
        {!isLoading && data.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(col => <TableHead key={col.accessor} className="text-table-header-themed">{col.Header}</TableHead>)}
                {actions && <TableHead className="text-right text-table-header-themed">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item[columns[0].idAccessor || columns[0].accessor]} className="hover-row-themed">
                  {columns.map(col => <TableCell key={col.accessor} className="text-table-cell-themed">{col.Cell ? col.Cell(item) : item[col.accessor]}</TableCell>)}
                  {actions && (
                    <TableCell className="text-right">
                      {actions.map(action => (
                        <Button key={action.label} variant="ghost" size="icon" onClick={() => action.onClick(item)} className={`hover:text-[var(--theme-accent-${action.color || 'hr'})]`}>
                          {action.icon}
                        </Button>
                      ))}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  function debounce(func, delay) {
    let timeout;
    const debounced = (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
    debounced.cancel = () => {
      clearTimeout(timeout);
    };
    return debounced;
  }


  // Column definitions for each tab
  const employeeColumns = [
    { Header: 'Name', accessor: 'first_name', Cell: (item) => `${item.first_name} ${item.last_name}`, idAccessor: 'employee_id' },
    { Header: 'Email', accessor: 'email' }, { Header: 'Job Title', accessor: 'job_title' },
    { Header: 'Department', accessor: 'department' },
    { Header: 'Hire Date', accessor: 'hire_date', Cell: (item) => item.hire_date ? format(parseISO(item.hire_date), 'MM/dd/yyyy') : 'N/A' },
    { Header: 'Status', accessor: 'employment_status' },
  ];
  const leaveRequestColumns = [
    { Header: 'Employee', accessor: 'employees.first_name', Cell: (item) => `${item.employees?.first_name || ''} ${item.employees?.last_name || ''}`, idAccessor: 'request_id' },
    { Header: 'Type', accessor: 'leave_type' },
    { Header: 'Start Date', accessor: 'start_date', Cell: (item) => format(parseISO(item.start_date), 'MM/dd/yyyy') },
    { Header: 'End Date', accessor: 'end_date', Cell: (item) => format(parseISO(item.end_date), 'MM/dd/yyyy') },
    { Header: 'Status', accessor: 'status' },
    { Header: 'Requested At', accessor: 'requested_at', Cell: (item) => format(parseISO(item.requested_at), 'MM/dd/yyyy p') },
  ];
  const payrollColumns = [
     { Header: 'Employee', accessor: 'employees.first_name', Cell: (item) => `${item.employees?.first_name || ''} ${item.employees?.last_name || ''}`, idAccessor: 'payroll_id' },
    { Header: 'Pay Period', accessor: 'pay_period_start', Cell: (item) => `${format(parseISO(item.pay_period_start), 'MM/dd/yy')} - ${format(parseISO(item.pay_period_end), 'MM/dd/yy')}` },
    { Header: 'Net Pay', accessor: 'net_pay', Cell: (item) => `$${parseFloat(item.net_pay || 0).toLocaleString()}` },
    { Header: 'Pay Date', accessor: 'pay_date', Cell: (item) => format(parseISO(item.pay_date), 'MM/dd/yyyy') },
    { Header: 'Status', accessor: 'status' },
  ];
  const benefitEnrollmentColumns = [
    { Header: 'Employee', accessor: 'employees.first_name', Cell: (item) => `${item.employees?.first_name || ''} ${item.employees?.last_name || ''}`, idAccessor: 'enrollment_id' },
    { Header: 'Benefit Plan', accessor: 'benefits.name' },
    { Header: 'Enrollment Date', accessor: 'enrollment_date', Cell: (item) => format(parseISO(item.enrollment_date), 'MM/dd/yyyy') },
    { Header: 'Status', accessor: 'status' },
  ];
  const hrDocumentColumns = [
    { Header: 'Document Name', accessor: 'document_name', idAccessor: 'document_id' },
    { Header: 'Employee', accessor: 'employees.first_name', Cell: (item) => item.employees ? `${item.employees.first_name} ${item.employees.last_name}` : 'General Document' },
    { Header: 'Type', accessor: 'document_type' },
    { Header: 'Upload Date', accessor: 'upload_date', Cell: (item) => format(parseISO(item.upload_date), 'MM/dd/yyyy') },
  ];


  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6 p-4 md:p-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <HeartHandshake className="mr-3 h-8 w-8 text-[var(--theme-accent-hr)]" /> Human Resources Hub
        </h1>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <motion.div variants={itemVariants}>
          <TabsList className="tabs-hr grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="employees"><Users className="mr-2 h-4 w-4" /> Employees</TabsTrigger>
            <TabsTrigger value="payroll"><DollarSign className="mr-2 h-4 w-4" /> Payroll</TabsTrigger>
            <TabsTrigger value="leave"><CalendarOff className="mr-2 h-4 w-4" /> Leave</TabsTrigger>
            <TabsTrigger value="benefits"><HeartHandshake className="mr-2 h-4 w-4" /> Benefits</TabsTrigger>
            <TabsTrigger value="documents"><FileText className="mr-2 h-4 w-4" /> Documents</TabsTrigger>
          </TabsList>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-6">
          <TabsContent value="employees">
            {renderTable(employees, employeeColumns, [
              { label: 'Edit', icon: <Edit3 className="h-4 w-4" />, onClick: openEmployeeModal, color: 'hr' },
              { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (item) => handleDeleteGeneric('employees', 'employee_id', item.employee_id, 'employee', 'employees'), color: 'red-500' }
            ], "No employees found.", "Employee Directory")}
          </TabsContent>
          <TabsContent value="payroll">
            {renderTable(payrollData, payrollColumns, [], "No payroll data found.", "Payroll Processing")}
          </TabsContent>
          <TabsContent value="leave">
            {renderTable(leaveRequests, leaveRequestColumns, [], "No leave requests found.", "Leave Management")}
          </TabsContent>
          <TabsContent value="benefits">
            {renderTable(employeeBenefits, benefitEnrollmentColumns, [], "No benefit enrollments found.", "Benefits Administration")}
          </TabsContent>
          <TabsContent value="documents">
            {renderTable(hrDocuments, hrDocumentColumns, [], "No HR documents found.", "HR Document Repository")}
          </TabsContent>
        </motion.div>
      </Tabs>

      <Dialog open={isEmployeeModalOpen} onOpenChange={setIsEmployeeModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card-themed border-card-themed text-card-themed-primary">
          <DialogHeader>
            <DialogTitle className="text-foreground">{currentEmployee ? 'Edit' : 'Add New'} Employee</DialogTitle>
            <DialogDescription className="text-muted-foreground">Fill in the details for the employee.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmployeeSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="first_name">First Name</Label><Input id="first_name" name="first_name" value={employeeForm.first_name} onChange={handleEmployeeFormChange} required className="bg-input-themed border-input-themed placeholder-input-themed" /></div>
              <div><Label htmlFor="last_name">Last Name</Label><Input id="last_name" name="last_name" value={employeeForm.last_name} onChange={handleEmployeeFormChange} required className="bg-input-themed border-input-themed placeholder-input-themed" /></div>
              <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={employeeForm.email} onChange={handleEmployeeFormChange} required className="bg-input-themed border-input-themed placeholder-input-themed" /></div>
              <div><Label htmlFor="phone_number">Phone Number</Label><Input id="phone_number" name="phone_number" value={employeeForm.phone_number} onChange={handleEmployeeFormChange} className="bg-input-themed border-input-themed placeholder-input-themed" /></div>
              <div><Label htmlFor="date_of_birth">Date of Birth</Label><Input id="date_of_birth" name="date_of_birth" type="date" value={employeeForm.date_of_birth} onChange={handleEmployeeFormChange} className="bg-input-themed border-input-themed placeholder-input-themed" /></div>
              <div><Label htmlFor="hire_date">Hire Date</Label><Input id="hire_date" name="hire_date" type="date" value={employeeForm.hire_date} onChange={handleEmployeeFormChange} required className="bg-input-themed border-input-themed placeholder-input-themed" /></div>
              <div><Label htmlFor="job_title">Job Title</Label><Input id="job_title" name="job_title" value={employeeForm.job_title} onChange={handleEmployeeFormChange} className="bg-input-themed border-input-themed placeholder-input-themed" /></div>
              <div><Label htmlFor="department">Department</Label><Input id="department" name="department" value={employeeForm.department} onChange={handleEmployeeFormChange} className="bg-input-themed border-input-themed placeholder-input-themed" /></div>
              <div>
                <Label htmlFor="employment_status">Employment Status</Label>
                <Select name="employment_status" value={employeeForm.employment_status} onValueChange={(value) => setEmployeeForm(prev => ({...prev, employment_status: value}))}>
                  <SelectTrigger className="bg-input-themed border-input-themed"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent className="bg-popover border-border">{EMPLOYMENT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="employment_type">Employment Type</Label>
                <Select name="employment_type" value={employeeForm.employment_type} onValueChange={(value) => setEmployeeForm(prev => ({...prev, employment_type: value}))}>
                  <SelectTrigger className="bg-input-themed border-input-themed"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent className="bg-popover border-border">{EMPLOYMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            
            <fieldset className="border p-3 rounded-md border-border">
              <legend className="text-sm font-medium px-1 text-muted-foreground">Address</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="address.street">Street</Label><Input id="address.street" name="address.street" value={employeeForm.address.street} onChange={handleEmployeeFormChange} className="bg-input-themed border-input-themed placeholder-input-themed" /></div>
                <div><Label htmlFor="address.city">City</Label><Input id="address.city" name="address.city" value={employeeForm.address.city} onChange={handleEmployeeFormChange} className="bg-input-themed border-input-themed placeholder-input-themed" /></div>
                <div><Label htmlFor="address.state">State/Province</Label><Input id="address.state" name="address.state" value={employeeForm.address.state} onChange={handleEmployeeFormChange} className="bg-input-themed border-input-themed placeholder-input-themed" /></div>
                <div><Label htmlFor="address.zip">Zip/Postal Code</Label><Input id="address.zip" name="address.zip" value={employeeForm.address.zip} onChange={handleEmployeeFormChange} className="bg-input-themed border-input-themed placeholder-input-themed" /></div>
                <div className="md:col-span-2"><Label htmlFor="address.country">Country</Label><Input id="address.country" name="address.country" value={employeeForm.address.country} onChange={handleEmployeeFormChange} className="bg-input-themed border-input-themed placeholder-input-themed" /></div>
              </div>
            </fieldset>

            <fieldset className="border p-3 rounded-md border-border">
              <legend className="text-sm font-medium px-1 text-muted-foreground">Emergency Contact</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="emergency_contact.name">Full Name</Label><Input id="emergency_contact.name" name="emergency_contact.name" value={employeeForm.emergency_contact.name} onChange={handleEmployeeFormChange} className="bg-input-themed border-input-themed placeholder-input-themed" /></div>
                <div><Label htmlFor="emergency_contact.relationship">Relationship</Label><Input id="emergency_contact.relationship" name="emergency_contact.relationship" value={employeeForm.emergency_contact.relationship} onChange={handleEmployeeFormChange} className="bg-input-themed border-input-themed placeholder-input-themed" /></div>
                <div className="md:col-span-2"><Label htmlFor="emergency_contact.phone">Phone Number</Label><Input id="emergency_contact.phone" name="emergency_contact.phone" value={employeeForm.emergency_contact.phone} onChange={handleEmployeeFormChange} className="bg-input-themed border-input-themed placeholder-input-themed" /></div>
              </div>
            </fieldset>
            
            <div><Label htmlFor="avatar_url">Avatar URL</Label><Input id="avatar_url" name="avatar_url" value={employeeForm.avatar_url} onChange={handleEmployeeFormChange} placeholder="https://example.com/avatar.png" className="bg-input-themed border-input-themed placeholder-input-themed" /></div>

            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isLoading} className="bg-[var(--theme-accent-hr)] hover:bg-[var(--theme-accent-hr)]/90 text-primary-foreground">
                {isLoading ? (currentEmployee ? 'Updating...' : 'Adding...') : (currentEmployee ? 'Save Changes' : 'Add Employee')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default HumanResourcesPage;