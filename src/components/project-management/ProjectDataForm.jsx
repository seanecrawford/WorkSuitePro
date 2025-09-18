import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarPlus as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const ProjectDataForm = ({ fields, initialData = {}, onSubmit, isLoading, submitButtonText = "Submit", onCancel }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const initialFormState = {};
    fields.forEach(field => {
      initialFormState[field.name] = initialData[field.name] || field.defaultValue || (field.type === 'select' ? '' : '');
      if (field.type === 'date' && initialData[field.name]) {
        initialFormState[field.name] = new Date(initialData[field.name]);
      }
    });
    setFormData(initialFormState);
  }, [fields, initialData]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = { ...formData };
    fields.forEach(field => {
      if (field.type === 'date' && dataToSubmit[field.name]) {
        dataToSubmit[field.name] = format(new Date(dataToSubmit[field.name]), 'yyyy-MM-dd');
      }
      if (field.type === 'number' && dataToSubmit[field.name] !== '' && dataToSubmit[field.name] !== null) {
        dataToSubmit[field.name] = parseFloat(dataToSubmit[field.name]);
      } else if (field.type === 'number' && (dataToSubmit[field.name] === '' || dataToSubmit[field.name] === null)) {
        dataToSubmit[field.name] = null;
      }
    });
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(field => (
        <div key={field.name} className="space-y-1">
          <Label htmlFor={field.name} className="text-sm font-medium text-muted-foreground">{field.label}</Label>
          {field.type === 'textarea' ? (
            <Textarea
              id={field.name}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          ) : field.type === 'select' ? (
            <Select
              name={field.name}
              value={formData[field.name] || ''}
              onValueChange={(value) => handleChange(field.name, value)}
              required={field.required}
            >
              <SelectTrigger id={field.name} className="bg-input border-border text-foreground">
                <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value} className="hover:bg-accent focus:bg-accent">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.type === 'date' ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-input border-border hover:bg-accent text-foreground",
                    !formData[field.name] && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData[field.name] ? format(new Date(formData[field.name]), "PPP") : <span>{field.placeholder || "Pick a date"}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                <Calendar
                  mode="single"
                  selected={formData[field.name] ? new Date(formData[field.name]) : undefined}
                  onSelect={(date) => handleChange(field.name, date)}
                  initialFocus
                  className="text-popover-foreground"
                />
              </PopoverContent>
            </Popover>
          ) : (
            <Input
              id={field.name}
              name={field.name}
              type={field.type || 'text'}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          )}
          {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
        </div>
      ))}
      <div className="flex justify-end space-x-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default ProjectDataForm;