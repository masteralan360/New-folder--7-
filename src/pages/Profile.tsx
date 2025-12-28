import { useParams } from 'wouter';
import { ExternalLink, Link2 } from 'lucide-react';
import { usePublicLinks } from '@/hooks/useLinks';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export function Profile() {
    const params = useParams<{ username: string }>();
    const username = params.username ?? '';

    const { data, isLoading, error } = usePublicLinks(username);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error || !data?.profile) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Link2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold">Profile Not Found</h1>
                <p className="mt-2 text-muted-foreground">
                    The profile @{username} doesn't exist or has no public links.
                </p>
            </div>
        );
    }

    const { profile, links } = data;

    return (
        <div className="mx-auto max-w-lg py-8">
            {/* Profile Header */}
            <div className="mb-8 text-center">
                {profile.avatar_url && (
                    <img
                        src={profile.avatar_url}
                        alt={profile.display_name}
                        className="mx-auto mb-4 h-24 w-24 rounded-full border-4 border-primary/20 object-cover shadow-xl"
                    />
                )}
                <h1 className="text-3xl font-bold">{profile.display_name}</h1>
                <p className="mt-1 text-muted-foreground">@{username}</p>
                {profile.bio && (
                    <p className="mt-3 text-foreground/80">{profile.bio}</p>
                )}
            </div>

            {/* Links */}
            <div className="space-y-4">
                {links.length > 0 ? (
                    links.map((link) => (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block"
                        >
                            <Card
                                variant="elevated"
                                className="flex items-center justify-between p-4 transition-all duration-300 hover:scale-[1.02] hover:border-primary/30"
                            >
                                <span className="font-medium">{link.title}</span>
                                <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                            </Card>
                        </a>
                    ))
                ) : (
                    <div className="py-12 text-center">
                        <p className="text-muted-foreground">No links to display yet.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground">
                    Powered by{' '}
                    <a href="/" className="text-primary hover:underline">
                        LinkBio
                    </a>
                </p>
            </div>
        </div>
    );
}
