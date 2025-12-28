import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Link2, ArrowRight, Sparkles, Shield, Zap, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { checkDatabaseConnection, isSupabaseConfigured } from '@/lib/supabase';

export function Home() {
    const { user } = useAuth();
    const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

    useEffect(() => {
        // Check database connection on startup
        const checkConnection = async () => {
            if (!isSupabaseConfigured) {
                setConnectionStatus('disconnected');
                return;
            }

            const isConnected = await checkDatabaseConnection();
            setConnectionStatus(isConnected ? 'connected' : 'disconnected');
        };

        checkConnection();
    }, []);

    return (
        <div className="space-y-24 py-12">
            {/* Database Connection Status */}
            <div className="flex justify-center">
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${connectionStatus === 'checking'
                        ? 'border border-border bg-muted text-muted-foreground'
                        : connectionStatus === 'connected'
                            ? 'border border-green-500/30 bg-green-500/10 text-green-500'
                            : 'border border-destructive/30 bg-destructive/10 text-destructive'
                    }`}>
                    {connectionStatus === 'checking' && (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Checking database connection...</span>
                        </>
                    )}
                    {connectionStatus === 'connected' && (
                        <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span>You are Connected to the Database</span>
                        </>
                    )}
                    {connectionStatus === 'disconnected' && (
                        <>
                            <XCircle className="h-4 w-4" />
                            <span>Not connected to database - Check your .env file</span>
                        </>
                    )}
                </div>
            </div>

            {/* Hero Section */}
            <section className="text-center">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>Your personal link hub</span>
                </div>

                <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
                    One Link for{' '}
                    <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Everything
                    </span>
                </h1>

                <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
                    Create your personalized link-in-bio page in seconds. Share all your important links
                    with a single, beautiful profile page.
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    {user ? (
                        <Link href="/dashboard">
                            <Button size="lg" className="gap-2 text-lg">
                                Go to Dashboard
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <Button size="lg" className="gap-2 text-lg">
                                Get Started Free
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section>
                <h2 className="mb-12 text-center text-3xl font-bold">Why Choose LinkBio?</h2>
                <div className="grid gap-8 md:grid-cols-3">
                    <Card variant="glass" className="text-center">
                        <CardContent className="pt-8">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Zap className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">Lightning Fast</h3>
                            <p className="text-muted-foreground">
                                Create and deploy your link page in under a minute. No coding required.
                            </p>
                        </CardContent>
                    </Card>

                    <Card variant="glass" className="text-center">
                        <CardContent className="pt-8">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">Private & Secure</h3>
                            <p className="text-muted-foreground">
                                Your data is protected with enterprise-grade security. Only you control your links.
                            </p>
                        </CardContent>
                    </Card>

                    <Card variant="glass" className="text-center">
                        <CardContent className="pt-8">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Link2 className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">Unlimited Links</h3>
                            <p className="text-muted-foreground">
                                Add as many links as you need. Organize, reorder, and customize them anytime.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* CTA Section */}
            <section className="text-center">
                <Card variant="glass" className="mx-auto max-w-2xl py-12">
                    <CardContent>
                        <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
                        <p className="mb-8 text-muted-foreground">
                            Join thousands of creators who use LinkBio to share their content.
                        </p>
                        {!user && (
                            <Link href="/login">
                                <Button size="lg" className="gap-2">
                                    Create Your Page
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
