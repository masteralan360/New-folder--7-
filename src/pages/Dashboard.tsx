import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, GripVertical, ExternalLink, Eye, EyeOff, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLinks, useCreateLink, useUpdateLink, useDeleteLink, useReorderLinks } from '@/hooks/useLinks';
import { useCreateProfile, useUpdateProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import type { Link } from '@/lib/types';

const linkSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100),
    url: z.string().url('Please enter a valid URL'),
});

const profileSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
    display_name: z.string().min(1, 'Display name is required').max(50),
    bio: z.string().max(200).optional(),
});

type LinkFormData = z.infer<typeof linkSchema>;
type ProfileFormData = z.infer<typeof profileSchema>;

export function Dashboard() {
    const { user, profile, isLoading: authLoading } = useAuth();
    const [, setLocation] = useLocation();
    const [editingLink, setEditingLink] = useState<Link | null>(null);
    const [isAddingLink, setIsAddingLink] = useState(false);
    const [showProfileSetup, setShowProfileSetup] = useState(false);

    const { data: links, isLoading: linksLoading } = useLinks();
    const createLink = useCreateLink();
    const updateLink = useUpdateLink();
    const deleteLink = useDeleteLink();
    const reorderLinks = useReorderLinks();
    const createProfile = useCreateProfile();
    const updateProfile = useUpdateProfile();

    const linkForm = useForm<LinkFormData>({
        resolver: zodResolver(linkSchema),
        defaultValues: { title: '', url: '' },
    });

    const profileForm = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            username: profile?.username ?? '',
            display_name: profile?.display_name ?? '',
            bio: profile?.bio ?? '',
        },
    });

    useEffect(() => {
        if (!authLoading && !user) {
            setLocation('/login');
        }
    }, [user, authLoading, setLocation]);

    useEffect(() => {
        if (!authLoading && user && !profile) {
            setShowProfileSetup(true);
        }
    }, [user, profile, authLoading]);

    useEffect(() => {
        if (profile) {
            profileForm.reset({
                username: profile.username,
                display_name: profile.display_name ?? '',
                bio: profile.bio ?? '',
            });
        }
    }, [profile, profileForm]);

    useEffect(() => {
        if (editingLink) {
            linkForm.reset({ title: editingLink.title, url: editingLink.url });
        } else {
            linkForm.reset({ title: '', url: '' });
        }
    }, [editingLink, linkForm]);

    const handleSubmitLink = async (data: LinkFormData) => {
        try {
            if (editingLink) {
                await updateLink.mutateAsync({ id: editingLink.id, ...data });
                setEditingLink(null);
            } else {
                await createLink.mutateAsync(data);
                setIsAddingLink(false);
            }
            linkForm.reset();
        } catch (error) {
            console.error('Failed to save link:', error);
        }
    };

    const handleDeleteLink = async (linkId: string) => {
        if (confirm('Are you sure you want to delete this link?')) {
            try {
                await deleteLink.mutateAsync(linkId);
            } catch (error) {
                console.error('Failed to delete link:', error);
            }
        }
    };

    const handleToggleActive = async (link: Link) => {
        try {
            await updateLink.mutateAsync({ id: link.id, is_active: !link.is_active });
        } catch (error) {
            console.error('Failed to toggle link:', error);
        }
    };

    const handleMoveLink = async (index: number, direction: 'up' | 'down') => {
        if (!links) return;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= links.length) return;

        const newOrder = [...links];
        [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];

        try {
            await reorderLinks.mutateAsync(newOrder.map(l => l.id));
        } catch (error) {
            console.error('Failed to reorder links:', error);
        }
    };

    const handleProfileSubmit = async (data: ProfileFormData) => {
        try {
            if (profile) {
                await updateProfile.mutateAsync(data);
            } else {
                await createProfile.mutateAsync(data);
            }
            setShowProfileSetup(false);
            // Reload to get updated profile
            window.location.reload();
        } catch (error) {
            console.error('Failed to save profile:', error);
        }
    };

    if (authLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (showProfileSetup || !profile) {
        return (
            <div className="mx-auto max-w-md">
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle>Complete Your Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    placeholder="yourname"
                                    {...profileForm.register('username')}
                                />
                                {profileForm.formState.errors.username && (
                                    <p className="text-sm text-destructive">{profileForm.formState.errors.username.message}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Your profile will be available at /{profileForm.watch('username') || 'username'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="display_name">Display Name</Label>
                                <Input
                                    id="display_name"
                                    placeholder="Your Name"
                                    {...profileForm.register('display_name')}
                                />
                                {profileForm.formState.errors.display_name && (
                                    <p className="text-sm text-destructive">{profileForm.formState.errors.display_name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio (optional)</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="A short bio about yourself"
                                    {...profileForm.register('bio')}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={createProfile.isPending}>
                                {createProfile.isPending ? <Spinner size="sm" /> : 'Save Profile'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            {/* Profile Section */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {profile.avatar_url && (
                        <img
                            src={profile.avatar_url}
                            alt={profile.display_name ?? 'Profile'}
                            className="h-16 w-16 rounded-full border-2 border-primary/20"
                        />
                    )}
                    <div>
                        <h1 className="text-2xl font-bold">{profile.display_name}</h1>
                        <p className="text-muted-foreground">@{profile.username}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(`/${profile.username}`, '_blank')}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Profile
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setShowProfileSetup(true)}>
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Links Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Your Links</CardTitle>
                    <Button onClick={() => setIsAddingLink(true)} size="sm" disabled={isAddingLink}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Link
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Add/Edit Link Form */}
                    {(isAddingLink || editingLink) && (
                        <Card variant="glass" className="p-4">
                            <form onSubmit={linkForm.handleSubmit(handleSubmitLink)} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            placeholder="My Website"
                                            {...linkForm.register('title')}
                                        />
                                        {linkForm.formState.errors.title && (
                                            <p className="text-sm text-destructive">{linkForm.formState.errors.title.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="url">URL</Label>
                                        <Input
                                            id="url"
                                            placeholder="https://example.com"
                                            {...linkForm.register('url')}
                                        />
                                        {linkForm.formState.errors.url && (
                                            <p className="text-sm text-destructive">{linkForm.formState.errors.url.message}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            setIsAddingLink(false);
                                            setEditingLink(null);
                                            linkForm.reset();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={createLink.isPending || updateLink.isPending}>
                                        {(createLink.isPending || updateLink.isPending) ? <Spinner size="sm" /> : editingLink ? 'Update' : 'Add'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {/* Links List */}
                    {linksLoading ? (
                        <div className="flex justify-center py-8">
                            <Spinner size="lg" />
                        </div>
                    ) : links && links.length > 0 ? (
                        <div className="space-y-3">
                            {links.map((link, index) => (
                                <div
                                    key={link.id}
                                    className="group flex items-center gap-3 rounded-lg border border-border bg-card/50 p-4 transition-all hover:border-primary/30 hover:bg-card"
                                >
                                    <div className="flex flex-col gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => handleMoveLink(index, 'up')}
                                            disabled={index === 0}
                                        >
                                            <GripVertical className="h-4 w-4 rotate-90" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => handleMoveLink(index, 'down')}
                                            disabled={index === links.length - 1}
                                        >
                                            <GripVertical className="h-4 w-4 rotate-90" />
                                        </Button>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">{link.title}</h3>
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-muted-foreground hover:text-primary truncate block"
                                        >
                                            {link.url}
                                        </a>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleToggleActive(link)}
                                            title={link.is_active ? 'Hide link' : 'Show link'}
                                        >
                                            {link.is_active ? (
                                                <Eye className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                        <Switch
                                            checked={link.is_active}
                                            onCheckedChange={() => handleToggleActive(link)}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setEditingLink(link)}
                                        >
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteLink(link.id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-muted-foreground">No links yet. Add your first link to get started!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
