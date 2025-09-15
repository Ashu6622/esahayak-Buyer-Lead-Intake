'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Loader,
  MoreHorizontal,
  PlusCircle,
  Search,
  Upload,
} from 'lucide-react';
import { Lead as LeadType, leadStatuses, propertyTypes, leadTimelines, LeadSchema, timelineLabels, propertyTypeLabels } from '@/lib/definitions';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import Link from 'next/link';
import { StatusBadge } from './status-badge';
import { useToast } from '@/hooks/use-toast';
import { revalidateAndRedirect } from '@/lib/actions';
import { z } from 'zod';

type InitialData = {
    leads: LeadType[];
    total: number;
    page: number;
    perPage: number;
}

export function LeadListClient({ initialData }: { initialData: InitialData }) {
  const [data, setData] = React.useState(initialData);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);


  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  React.useEffect(() => {
    // Initialize search query from URL params
    const currentQuery = searchParams.get('query') || '';
    setSearchQuery(currentQuery);
  }, [searchParams]);

  React.useEffect(() => {
    // Reset navigation loading state when pathname changes
    setIsNavigating(false);
  }, [pathname]);
  
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleStatusUpdate = async (id: string, status: LeadType['status']) => {
    const originalLeads = [...data.leads];
    const newUpdatedAt = new Date();
    setData(prev => ({...prev, leads: prev.leads.map(lead => lead.id === id ? { ...lead, status, updatedAt: newUpdatedAt } : lead)}));
    
    const response = await fetch('/api/leads/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
    });

    if (!response.ok) {
      setData(prev => ({...prev, leads: originalLeads}));
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Could not update lead status.',
      });
    } else {
        toast({
            title: 'Status Updated',
            description: `Lead status changed to ${status}.`
        })
        revalidateAndRedirect(pathname);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    const response = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    setIsDeleting(false);

    if (response.ok) {
      toast({ title: 'Lead Deleted', description: 'The lead has been successfully deleted.' });
      revalidateAndRedirect(pathname);
    } else {
      toast({ variant: 'destructive', title: 'Delete Failed', description: 'Could not delete lead.' });
    }
  };
  
  const handleExport = () => {
    const headers = ['name', 'email', 'phone', 'city', 'propertyType', 'status', 'timeline', 'notes', 'tags'];
    const csvRows = [headers.join(',')];
    data.leads.forEach(lead => {
      const values = headers.map(header => {
          let value = lead[header as keyof LeadType];
          if (Array.isArray(value)) {
            value = value.join(';');
          }
          return `"${value ? String(value).replace(/"/g, '""') : ''}"`;
      });
      csvRows.push(values.join(','));
    });
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if(link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `leads-export-${new Date().toISOString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    toast({ title: 'Exporting Leads', description: `${data.leads.length} leads are being exported to CSV.` });
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
        toast({ variant: 'destructive', title: 'Import Failed', description: 'File is empty.' });
        return;
      }
      
      try {
        const rows = text.split('\n').filter(row => row.trim() !== '');
        const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const leadData = rows.slice(1).map(row => {
          const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
          const leadObject = headers.reduce((obj, header, index) => {
              let value: any = values[index] ? values[index].trim().replace(/"/g, '') : '';
              if (header === 'tags' && value) {
                  value = value.split(';').map((t:string) => t.trim()).filter((t:string) => t);
              }
              const shape = LeadSchema.omit({ id: true, createdAt: true, updatedAt: true }).shape as any;
              if (shape.hasOwnProperty(header)) {
                  (obj as any)[header] = value;
              }
              return obj;
          }, {} as Omit<LeadType, 'id' | 'createdAt' | 'updatedAt'>);
          return leadObject;
        });

        const response = await fetch('/api/leads/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadData)
        });

        if (!response.ok) {
            throw new Error('Failed to import leads');
        }

        const result = await response.json();
        if (result.success) {
          toast({ title: 'Import Successful', description: result.message });
          revalidateAndRedirect(pathname);
        } else {
          throw new Error(result.message || 'Import failed');
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Could not parse CSV file. Please check the format.';
        toast({ variant: 'destructive', title: 'Import Failed', description: errorMessage });
      } finally {
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };


  const allCities = React.useMemo(() => {
    const cityNames = initialData.leads.map(l => l.city).filter(Boolean);
    return [...new Set(cityNames)];
  }, [initialData.leads]);
  const totalPages = Math.ceil(data.total / data.perPage);

  return (
    <div className="space-y-4">
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv"
      />
      <div className="flex flex-col md:flex-row gap-2 justify-between">
        <div className="relative flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-1">
                        <Filter className="h-3.5 w-3.5" />
                        <span>Filter</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-2 space-y-2">
                      <Select onValueChange={value => handleFilterChange('city', value)} defaultValue={searchParams.get('city') || 'all'}>
                        <SelectTrigger><SelectValue placeholder="City" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Cities</SelectItem>
                          {allCities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select onValueChange={value => handleFilterChange('status', value)} defaultValue={searchParams.get('status') || 'all'}>
                        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          {leadStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select onValueChange={value => handleFilterChange('propertyType', value)} defaultValue={searchParams.get('propertyType') || 'all'}>
                        <SelectTrigger><SelectValue placeholder="Property Type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {propertyTypes.map(pt => <SelectItem key={pt} value={pt}>{propertyTypeLabels[pt]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select onValueChange={value => handleFilterChange('timeline', value)} defaultValue={searchParams.get('timeline') || 'all'}>
                        <SelectTrigger><SelectValue placeholder="Timeline" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Timelines</SelectItem>
                          {leadTimelines.map(t => <SelectItem key={t} value={t}>{timelineLabels[t]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="gap-1" onClick={handleImportClick}>
                <Upload className="h-3.5 w-3.5" />
                <span>Import</span>
            </Button>
            <Button variant="outline" className="gap-1" onClick={handleExport}>
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
            </Button>
            <Button 
                className="gap-1" 
                onClick={() => {
                    setIsNavigating(true);
                    router.push('/leads/new');
                }}
                disabled={isNavigating}
            >
                {isNavigating ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <PlusCircle className="h-3.5 w-3.5" />}
                <span>Create Lead</span>
            </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">City</TableHead>
              <TableHead className="hidden lg:table-cell">Property Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Timeline</TableHead>
              <TableHead className="hidden sm:table-cell">Last Updated</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.leads.length > 0 ? (
              data.leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    <div className="font-semibold">{lead.name}</div>
                    <div className="text-sm text-muted-foreground">{lead.email}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{lead.city}</TableCell>
                  <TableCell className="hidden lg:table-cell">{propertyTypeLabels[lead.propertyType]}</TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status as LeadType['status']} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{timelineLabels[lead.timeline]}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {new Date(lead.updatedAt!).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: '2-digit', 
                      day: '2-digit' 
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem 
                            onClick={() => {
                                setIsNavigating(true);
                                router.push(`/leads/${lead.id}/edit`);
                            }}
                            disabled={isNavigating}
                        >
                            {isNavigating ? <Loader className="mr-2 h-3 w-3 animate-spin" /> : null}
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup value={lead.status}>
                              {leadStatuses.map(status => (
                                <DropdownMenuRadioItem key={status} value={status} onSelect={() => handleStatusUpdate(lead.id!, status)}>
                                  {status}
                                </DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              onSelect={(e) => e.preventDefault()}
                              disabled={isDeleting}
                            >
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this lead from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(lead.id!)}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                disabled={isDeleting}
                              >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No leads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Showing{' '}
          <strong>
            {Math.min((data.page - 1) * data.perPage + 1, data.total)}-
            {Math.min(data.page * data.perPage, data.total)}
          </strong>{' '}
          of <strong>{data.total}</strong> leads.
        </div>
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(data.page - 1)}
                disabled={data.page <= 1}
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
            </Button>
            <span className="text-sm font-medium">
                Page {data.page} of {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(data.page + 1)}
                disabled={data.page >= totalPages}
            >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
            </Button>
        </div>
      </div>
    </div>
  );
}
