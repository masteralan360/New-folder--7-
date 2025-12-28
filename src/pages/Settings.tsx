import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Mail, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { updateEmail, updatePassword } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

const emailSchema = z.object({
    email: z.string().email('Please enter a valid email'),
});

const passwordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type EmailFormData = z.infer<typeof emailSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export function Settings() {
    const { user, isLoading: authLoading } = useAuth();
    const [, setLocation] = useLocation();
    const [emailError, setEmailError] = useState<string | null>(null);
    const [emailSuccess, setEmailSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const emailForm = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: '' },
    });

    const passwordForm = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { password: '', confirmPassword: '' },
    });

    useEffect(() => {
        if (!authLoading && !user) {
            setLocation('/login');
        }
    }, [user, authLoading, setLocation]);

    useEffect(() => {
        if (user?.email) {
            emailForm.setValue('email', user.email);
        }
    }, [user, emailForm]);

    const handleEmailSubmit = async (data: EmailFormData) => {
        try {
            setEmailError(null);
            setEmailSuccess(false);
            setIsUpdatingEmail(true);

            await updateEmail(data.email);
            setEmailSuccess(true);
            setTimeout(() => setEmailSuccess(false), 3000);
        } catch (err) {
            setEmailError(err instanceof Error ? err.message : 'Failed to update email');
        } finally {
            setIsUpdatingEmail(false);
        }
    };

    const handlePasswordSubmit = async (data: PasswordFormData) => {
        try {
            setPasswordError(null);
            setPasswordSuccess(false);
            setIsUpdatingPassword(true);

            await updatePassword(data.password);
            setPasswordSuccess(true);
            passwordForm.reset();
            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch (err) {
            setPasswordError(err instanceof Error ? err.message : 'Failed to update password');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setLocation('/dashboard')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Account Settings</h1>
                    <p className="text-muted-foreground">Manage your email and password</p>
                </div>
            </div>

            {/* Email Update */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Email Address
                    </CardTitle>
                    <CardDescription>
                        Update your email address. You'll receive a confirmation email.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                {...emailForm.register('email')}
                            />
                            {emailForm.formState.errors.email && (
                                <p className="text-sm text-destructive">{emailForm.formState.errors.email.message}</p>
                            )}
                        </div>

                        {emailError && (
                            <p className="text-sm text-destructive">{emailError}</p>
                        )}

                        {emailSuccess && (
                            <p className="flex items-center gap-2 text-sm text-green-500">
                                <Check className="h-4 w-4" />
                                Email update requested. Check your inbox!
                            </p>
                        )}

                        <Button type="submit" disabled={isUpdatingEmail}>
                            {isUpdatingEmail ? <Spinner size="sm" /> : 'Update Email'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Password Update */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5" />
                        Password
                    </CardTitle>
                    <CardDescription>
                        Change your password. Make sure it's at least 6 characters.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                {...passwordForm.register('password')}
                            />
                            {passwordForm.formState.errors.password && (
                                <p className="text-sm text-destructive">{passwordForm.formState.errors.password.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                {...passwordForm.register('confirmPassword')}
                            />
                            {passwordForm.formState.errors.confirmPassword && (
                                <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {passwordError && (
                            <p className="text-sm text-destructive">{passwordError}</p>
                        )}

                        {passwordSuccess && (
                            <p className="flex items-center gap-2 text-sm text-green-500">
                                <Check className="h-4 w-4" />
                                Password updated successfully!
                            </p>
                        )}

                        <Button type="submit" disabled={isUpdatingPassword}>
                            {isUpdatingPassword ? <Spinner size="sm" /> : 'Update Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
