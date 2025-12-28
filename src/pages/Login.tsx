import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Github, Mail, Eye, EyeOff } from 'lucide-react';
import { signInWithGoogle, signInWithGitHub, signInWithEmail, signUpWithEmail } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

const emailSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type EmailFormData = z.infer<typeof emailSchema>;

export function Login() {
    const { user, isLoading } = useAuth();
    const [, setLocation] = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: 'admin@linkbio.local',
            password: 'admin',
        },
    });

    useEffect(() => {
        if (user && !isLoading) {
            setLocation('/dashboard');
        }
    }, [user, isLoading, setLocation]);

    const handleGoogleLogin = async () => {
        try {
            setError(null);
            await signInWithGoogle();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Google login failed');
        }
    };

    const handleGitHubLogin = async () => {
        try {
            setError(null);
            await signInWithGitHub();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'GitHub login failed');
        }
    };

    const handleEmailSubmit = async (data: EmailFormData) => {
        try {
            setError(null);
            setIsSubmitting(true);

            if (isSignUp) {
                await signUpWithEmail(data.email, data.password);
                setError('Check your email to confirm your account!');
            } else {
                await signInWithEmail(data.email, data.password);
                setLocation('/dashboard');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Authentication failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex min-h-[70vh] items-center justify-center">
            <Card variant="glass" className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl">{isSignUp ? 'Create Account' : 'Welcome Back'}</CardTitle>
                    <CardDescription className="text-base">
                        {isSignUp
                            ? 'Create an account to manage your links'
                            : 'Sign in to manage your links and customize your profile'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Email/Password Form */}
                    <form onSubmit={form.handleSubmit(handleEmailSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@linkbio.local"
                                {...form.register('email')}
                            />
                            {form.formState.errors.email && (
                                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••"
                                    {...form.register('password')}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            {form.formState.errors.password && (
                                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                            )}
                        </div>

                        {error && (
                            <p className={`text-sm ${error.includes('Check your email') ? 'text-green-500' : 'text-destructive'}`}>
                                {error}
                            </p>
                        )}

                        <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                            {isSubmitting ? <Spinner size="sm" /> : <Mail className="h-4 w-4" />}
                            {isSignUp ? 'Create Account' : 'Sign In with Email'}
                        </Button>
                    </form>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                            }}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    {/* OAuth Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            onClick={handleGoogleLogin}
                            variant="outline"
                            size="lg"
                            className="gap-2"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Google
                        </Button>

                        <Button
                            onClick={handleGitHubLogin}
                            variant="outline"
                            size="lg"
                            className="gap-2"
                        >
                            <Github className="h-4 w-4" />
                            GitHub
                        </Button>
                    </div>

                    <p className="text-center text-xs text-muted-foreground">
                        Default test account: <strong>admin@linkbio.local</strong> / <strong>admin</strong>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
