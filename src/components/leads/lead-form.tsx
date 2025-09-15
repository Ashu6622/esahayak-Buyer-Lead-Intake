'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Lead,
  LeadSchema,
  propertyTypes,
  leadStatuses,
  leadTimelines,
  propertyTypeLabels,
  timelineLabels,
} from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader, Tag, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useState } from 'react';
import { revalidateAndRedirect } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export function LeadForm({ lead }: { lead?: Lead }) {
  const { toast } = useToast();
  const router = useRouter();
  const [tagInput, setTagInput] = useState('');

  const formSchema = LeadSchema.omit({ createdAt: true, updatedAt: true });
  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: lead ? {
      ...lead,
      phone: lead.phone || '',
      notes: lead.notes || '',
      tags: lead.tags || [],
    } : {
      name: '',
      email: '',
      phone: '',
      city: '',
      propertyType: 'SingleFamily',
      status: 'New',
      timeline: 'OneThreeMonths',
      notes: '',
      tags: [],
    },
  });

  const currentTags = form.watch('tags') || [];

  const onSubmit = async (data: FormData) => {
    const url = lead ? `/api/leads/${lead.id}` : '/api/leads';
    const method = lead ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${lead ? 'update' : 'create'} lead`);
      }

      const toastTitle = lead ? 'Lead Updated' : 'Lead Created';
      const toastDescription = `${data.name} has been successfully ${lead ? 'updated' : 'created'}.`;
      
      toast({ title: toastTitle, description: toastDescription });

      // Use router.push instead of revalidateAndRedirect to avoid potential errors
      router.push('/');

    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    }
  };
  
  const addTag = () => {
    if (tagInput && !currentTags.includes(tagInput)) {
      form.setValue('tags', [...currentTags, tagInput]);
      setTagInput('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="1234567890" maxLength={10} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="San Francisco" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {propertyTypes.map(type => (
                      <SelectItem key={type} value={type}>{propertyTypeLabels[type]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {leadStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:col-span-2 grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="timeline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Timeline</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a timeline" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leadTimelines.map(timeline => (
                        <SelectItem key={timeline} value={timeline}>{timelineLabels[timeline]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Client preferences, budget, etc." className="min-h-[120px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tags"
          render={() => (
            <FormItem>
              <FormDescription>
                <strong>Tags:</strong> Add tags to help categorize this lead.
              </FormDescription>
              <div className="space-y-3">
                 <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Enter a tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>
                <div className="flex items-start flex-wrap gap-2 rounded-md border min-h-[40px] p-2">
                    {currentTags.length > 0 ? (
                        currentTags.map(tag => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1 pr-1">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="rounded-full bg-background text-foreground/50 hover:text-foreground">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                    ) : (
                        <div className="flex items-center text-muted-foreground p-1.5">
                            <Tag className="h-4 w-4 mr-2" />
                            <p className="text-sm">No tags yet.</p>
                        </div>
                    )}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {lead ? 'Save Changes' : 'Create Lead'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
