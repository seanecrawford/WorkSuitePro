import React, { useState, useEffect, useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { COMPANY_INDUSTRIES } from '@/../scripts/seed-utils';
import { AuthContext } from '@/contexts/AuthContext';
import { format, parseISO, isValid } from 'date-fns';

const DEAL_STAGES = ['Prospecting', 'Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost', 'On Hold'];
const COMMUNICATION_TYPES = ['Email', 'Call', 'Meeting', 'Note', 'LinkedIn Message', 'Demo', 'Follow-up'];

export const CRMCompanyForm = ({ company, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    companyname: '', industry: '', address: '', contact_email: '', contact_phone: '', website: '', notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (company) {
      setFormData({
        companyname: company.companyname || '',
        industry: company.industry || '',
        address: company.address || '',
        contact_email: company.contact_email || '',
        contact_phone: company.contact_phone || '',
        website: company.website || '',
        notes: company.notes || '',
      });
    } else {
      setFormData({ companyname: '', industry: '', address: '', contact_email: '', contact_phone: '', website: '', notes: '' });
    }
  }, [company]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyname) {
      toast({ title: "Validation Error", description: "Company Name is required.", variant: "destructive" }); return;
    }
    try { 
      await onSave(formData); 
      toast({ title: "Company Saved", description: `${formData.companyname} details saved.` });
      onCancel(); 
    } 
    catch (error) { toast({ title: "Error Saving Company", description: error.message, variant: "destructive" }); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><Label htmlFor="companyname">Company Name</Label><Input id="companyname" name="companyname" value={formData.companyname} onChange={handleChange} required /></div>
      <div><Label htmlFor="industry">Industry</Label>
        <Select name="industry" value={formData.industry} onValueChange={(v) => setFormData(p => ({ ...p, industry: v }))}>
          <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
          <SelectContent>{COMPANY_INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}<SelectItem value="Other">Other</SelectItem></SelectContent>
        </Select>
      </div>
      <div><Label htmlFor="website">Website</Label><Input id="website" name="website" placeholder="https://example.com" value={formData.website} onChange={handleChange} /></div>
      <div><Label htmlFor="address">Address</Label><Textarea id="address" name="address" value={formData.address} onChange={handleChange} /></div>
      <div><Label htmlFor="contact_email">Contact Email</Label><Input id="contact_email" name="contact_email" type="email" value={formData.contact_email} onChange={handleChange} /></div>
      <div><Label htmlFor="contact_phone">Contact Phone</Label><Input id="contact_phone" name="contact_phone" value={formData.contact_phone} onChange={handleChange} /></div>
      <div><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} /></div>
      <DialogFooter><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit">Save Company</Button></DialogFooter>
    </form>
  );
};

export const CRMContactForm = ({ contact, companies, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    company_uid: '', first_name: '', last_name: '', email: '', phone: '', job_title: '', notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (contact) {
      setFormData({
        company_uid: contact.company_uid || '',
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        job_title: contact.job_title || '',
        notes: contact.notes || '',
      });
    } else {
      setFormData({ company_uid: '', first_name: '', last_name: '', email: '', phone: '', job_title: '', notes: '' });
    }
  }, [contact]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast({ title: "Validation Error", description: "First Name, Last Name, and Email are required.", variant: "destructive" }); return;
    }
    try { 
      await onSave(formData); 
      toast({ title: "Contact Saved", description: `${formData.first_name} ${formData.last_name} details saved.` });
      onCancel();
    }
    catch (error) { toast({ title: "Error Saving Contact", description: error.message, variant: "destructive" }); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><Label htmlFor="company_uid">Company</Label>
        <Select name="company_uid" value={formData.company_uid} onValueChange={(v) => setFormData(p => ({ ...p, company_uid: v }))}>
          <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
          <SelectContent>{companies.map(c => <SelectItem key={c.company_uid} value={c.company_uid}>{c.companyname}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div><Label htmlFor="first_name">First Name</Label><Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required /></div>
      <div><Label htmlFor="last_name">Last Name</Label><Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required /></div>
      <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required /></div>
      <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" value={formData.phone} onChange={handleChange} /></div>
      <div><Label htmlFor="job_title">Job Title</Label><Input id="job_title" name="job_title" value={formData.job_title} onChange={handleChange} /></div>
      <div><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} /></div>
      <DialogFooter><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit">Save Contact</Button></DialogFooter>
    </form>
  );
};

export const CRMDealForm = ({ deal, companies, contacts, users, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    company_uid: '', contact_id: '', deal_name: '', stage: 'Prospecting', value: '', expected_close_date: '', probability: '', owner_user_id: '', description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (deal) {
      const formattedDeal = { ...deal };
      if (deal.expected_close_date && isValid(parseISO(deal.expected_close_date))) {
        formattedDeal.expected_close_date = format(parseISO(deal.expected_close_date), 'yyyy-MM-dd');
      } else {
        formattedDeal.expected_close_date = '';
      }
      setFormData(prev => ({ ...prev, ...formattedDeal, value: formattedDeal.value || '', probability: formattedDeal.probability || '' }));
    } else {
      setFormData({ company_uid: '', contact_id: '', deal_name: '', stage: 'Prospecting', value: '', expected_close_date: '', probability: '', owner_user_id: '', description: '' });
    }
  }, [deal]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.deal_name || !formData.stage) {
      toast({ title: "Validation Error", description: "Deal Name and Stage are required.", variant: "destructive" }); return;
    }
    try { 
      const dataToSave = {...formData};
      dataToSave.value = dataToSave.value === '' ? null : parseFloat(dataToSave.value);
      dataToSave.probability = dataToSave.probability === '' ? null : parseInt(dataToSave.probability, 10);
      dataToSave.expected_close_date = dataToSave.expected_close_date === '' ? null : dataToSave.expected_close_date;

      await onSave(dataToSave); 
      toast({ title: "Deal Saved", description: `${formData.deal_name} details saved.` });
      onCancel();
    }
    catch (error) { toast({ title: "Error Saving Deal", description: error.message, variant: "destructive" }); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><Label htmlFor="deal_name">Deal Name</Label><Input id="deal_name" name="deal_name" value={formData.deal_name} onChange={handleChange} required /></div>
      <div><Label htmlFor="stage">Stage</Label>
        <Select name="stage" value={formData.stage} onValueChange={(v) => setFormData(p => ({ ...p, stage: v }))}>
          <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
          <SelectContent>{DEAL_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div><Label htmlFor="company_uid">Company</Label>
        <Select name="company_uid" value={formData.company_uid} onValueChange={(v) => setFormData(p => ({ ...p, company_uid: v, contact_id: '' }))}>
          <SelectTrigger><SelectValue placeholder="Select company (optional)" /></SelectTrigger>
          <SelectContent>{companies.map(c => <SelectItem key={c.company_uid} value={c.company_uid}>{c.companyname}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {formData.company_uid && (
        <div><Label htmlFor="contact_id">Contact</Label>
          <Select name="contact_id" value={formData.contact_id} onValueChange={(v) => setFormData(p => ({ ...p, contact_id: v }))}>
            <SelectTrigger><SelectValue placeholder="Select contact (optional)" /></SelectTrigger>
            <SelectContent>{contacts.filter(c => c.company_uid === formData.company_uid).map(c => <SelectItem key={c.contact_id} value={c.contact_id}>{`${c.first_name} ${c.last_name}`}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
      <div><Label htmlFor="value">Deal Value</Label><Input id="value" name="value" type="number" placeholder="e.g., 5000.00" value={formData.value} onChange={handleChange} /></div>
      <div><Label htmlFor="expected_close_date">Expected Close Date</Label><Input id="expected_close_date" name="expected_close_date" type="date" value={formData.expected_close_date} onChange={handleChange} /></div>
      <div><Label htmlFor="probability">Probability (%)</Label><Input id="probability" name="probability" type="number" placeholder="0-100" value={formData.probability} onChange={handleChange} min="0" max="100" /></div>
      <div><Label htmlFor="owner_user_id">Owner</Label>
        <Select name="owner_user_id" value={formData.owner_user_id} onValueChange={(v) => setFormData(p => ({ ...p, owner_user_id: v }))}>
          <SelectTrigger><SelectValue placeholder="Select owner (optional)" /></SelectTrigger>
          <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.name || u.email || u.fullname}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" value={formData.description} onChange={handleChange} /></div>
      <DialogFooter><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit">Save Deal</Button></DialogFooter>
    </form>
  );
};

export const CRMCommunicationForm = ({ log, companies, contacts, deals, users, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    company_uid: '', contact_id: '', deal_id: '', communication_type: 'Email', subject: '', body_content: '', communication_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"), user_id: ''
  });
  const { toast } = useToast();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (log) {
      const formattedLog = { ...log };
      if (log.communication_date && isValid(parseISO(log.communication_date))) {
        formattedLog.communication_date = format(parseISO(log.communication_date), "yyyy-MM-dd'T'HH:mm");
      } else {
        formattedLog.communication_date = format(new Date(), "yyyy-MM-dd'T'HH:mm");
      }
      setFormData(prev => ({ ...prev, ...formattedLog, user_id: formattedLog.user_id || currentUser?.id || '' }));
    } else {
      setFormData({ company_uid: '', contact_id: '', deal_id: '', communication_type: 'Email', subject: '', body_content: '', communication_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"), user_id: currentUser?.id || '' });
    }
  }, [log, currentUser]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.communication_type || !formData.communication_date) {
      toast({ title: "Validation Error", description: "Communication Type and Date are required.", variant: "destructive" }); return;
    }
    try { 
      await onSave(formData); 
      toast({ title: "Communication Log Saved" });
      onCancel();
    }
    catch (error) { toast({ title: "Error Saving Log", description: error.message, variant: "destructive" }); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><Label htmlFor="communication_type">Type</Label>
        <Select name="communication_type" value={formData.communication_type} onValueChange={(v) => setFormData(p => ({ ...p, communication_type: v }))}>
          <SelectTrigger><SelectValue placeholder="Communication Type" /></SelectTrigger>
          <SelectContent>{COMMUNICATION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div><Label htmlFor="communication_date">Date & Time</Label><Input id="communication_date" name="communication_date" type="datetime-local" value={formData.communication_date} onChange={handleChange} required /></div>
      <div><Label htmlFor="subject">Subject</Label><Input id="subject" name="subject" value={formData.subject} onChange={handleChange} /></div>
      <div><Label htmlFor="company_uid">Link to Company</Label>
        <Select name="company_uid" value={formData.company_uid} onValueChange={(v) => setFormData(p => ({ ...p, company_uid: v, contact_id: '', deal_id: '' }))}>
          <SelectTrigger><SelectValue placeholder="Link to Company (optional)" /></SelectTrigger>
          <SelectContent>{companies.map(c => <SelectItem key={c.company_uid} value={c.company_uid}>{c.companyname}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {formData.company_uid && (
        <>
          <div><Label htmlFor="contact_id">Link to Contact</Label>
            <Select name="contact_id" value={formData.contact_id} onValueChange={(v) => setFormData(p => ({ ...p, contact_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Link to Contact (optional)" /></SelectTrigger>
              <SelectContent>{contacts.filter(c => c.company_uid === formData.company_uid).map(c => <SelectItem key={c.contact_id} value={c.contact_id}>{`${c.first_name} ${c.last_name}`}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label htmlFor="deal_id">Link to Deal</Label>
            <Select name="deal_id" value={formData.deal_id} onValueChange={(v) => setFormData(p => ({ ...p, deal_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Link to Deal (optional)" /></SelectTrigger>
              <SelectContent>{deals.filter(d => d.company_uid === formData.company_uid).map(d => <SelectItem key={d.deal_id} value={d.deal_id}>{d.deal_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </>
      )}
      <div><Label htmlFor="body_content">Details / Notes</Label><Textarea id="body_content" name="body_content" value={formData.body_content} onChange={handleChange} rows={5} /></div>
      <div><Label htmlFor="user_id">Logged By</Label>
        <Select name="user_id" value={formData.user_id} onValueChange={(v) => setFormData(p => ({ ...p, user_id: v }))}>
          <SelectTrigger><SelectValue placeholder="Logged by (optional)" /></SelectTrigger>
          <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.name || u.email || u.fullname}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <DialogFooter><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit">Save Log</Button></DialogFooter>
    </form>
  );
};