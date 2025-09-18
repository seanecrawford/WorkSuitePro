import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const GenericCRMListTab = ({ title, icon: Icon, items, columns, renderForm: FormComponent, onSave, onDelete, relatedData, itemType, searchFields = [], isLoading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const openModalForNew = () => { setSelectedItem(null); setIsModalOpen(true); };
  const openModalForEdit = (item) => { setSelectedItem(item); setIsModalOpen(true); };
  
  const filteredItems = items.filter(item => 
    searchFields.some(field => {
      const fieldValue = field.split('.').reduce((o, i) => (o ? o[i] : undefined), item);
      return fieldValue && fieldValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
    }) || searchTerm === ''
  );
  
  const getItemKey = (item) => {
    return item.id || item.company_uid || item.contact_id || item.deal_id || item.log_id || item[columns[0]?.accessor];
  };

  return (
    <Card className="bg-card-themed border-card-themed shadow-lg text-card-themed-primary">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-foreground flex items-center"><Icon className="mr-2 h-6 w-6 text-[var(--theme-accent-clients)]" /> {title}</CardTitle>
            <CardDescription className="text-muted-foreground">Manage all {itemType.toLowerCase()}.</CardDescription>
          </div>
          <Button onClick={openModalForNew} className="bg-[var(--theme-accent-clients)] hover:bg-[var(--theme-accent-clients)]/90 text-white">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New {itemType}
          </Button>
        </div>
        {searchFields.length > 0 && (
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={`Search ${itemType.toLowerCase()}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 max-w-md" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64"><Icon className="h-12 w-12 animate-spin text-[var(--theme-accent-clients)]" /></div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-10"><Icon className="mx-auto h-12 w-12 text-muted-foreground mb-4" /><p className="text-muted-foreground">No {itemType.toLowerCase()} found.</p></div>
        ) : (
          <ScrollArea className="h-[500px] w-full">
            <Table>
              <TableHeader><TableRow>{columns.map(col => <TableHead key={col.accessor}>{col.header}</TableHead>)}<TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={getItemKey(item)}>
                    {columns.map(col => <TableCell key={col.accessor}>{col.render ? col.render(item) : item[col.accessor]}</TableCell>)}
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openModalForEdit(item)} className="hover:text-[var(--theme-accent-clients)]"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(getItemKey(item))} className="hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem ? `Edit ${itemType}` : `Add New ${itemType}`}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <FormComponent {...relatedData} {...{[itemType.toLowerCase()]: selectedItem}} onSave={onSave} onCancel={() => setIsModalOpen(false)} />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default GenericCRMListTab;