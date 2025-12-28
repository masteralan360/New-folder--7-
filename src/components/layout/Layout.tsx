import type { ReactNode } from 'react';
import { Link as WouterLink } from 'wouter';
import { Link2, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const { user, signOut } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        <WouterLink href="/" className="flex items-center gap-2 text-xl font-bold">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Link2 className="h-4 w-4" />
                            </div>
                            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                LinkBio
                            </span>
                        </WouterLink>

                        <nav className="flex items-center gap-2">
                            {user ? (
                                <>
                                    <WouterLink href="/dashboard">
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <LayoutDashboard className="h-4 w-4" />
                                            <span className="hidden sm:inline">Dashboard</span>
                                        </Button>
                                    </WouterLink>
                                    <WouterLink href="/settings">
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <Settings className="h-4 w-4" />
                                            <span className="hidden sm:inline">Settings</span>
                                        </Button>
                                    </WouterLink>
                                    <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
                                        <LogOut className="h-4 w-4" />
                                        <span className="hidden sm:inline">Sign Out</span>
                                    </Button>
                                </>
                            ) : (
                                <WouterLink href="/login">
                                    <Button size="sm">Sign In</Button>
                                </WouterLink>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
