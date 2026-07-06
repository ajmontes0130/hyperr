import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useSEO } from '@/hooks/useSEO';
import HyperrLogo from '@/components/HyperrLogo';
import { Button } from '@/components/ui/button';
import { Home, Search, HelpCircle, ArrowLeft } from 'lucide-react';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    useSEO({
        title: '404 — Page Not Found | hyperr',
        description: 'The page you are looking for does not exist.',
        noindex: true,
    });

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch {
                return { user: null, isAuthenticated: false };
            }
        }
    });

    const isAdmin = isFetched && authData.isAuthenticated && authData.user?.role === 'admin';

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="max-w-md w-full text-center space-y-8">
                <Link to="/" className="inline-block">
                    <HyperrLogo size="md" />
                </Link>

                <div className="space-y-3">
                    <h1 className="font-display font-bold text-8xl text-primary leading-none">404</h1>
                    <h2 className="font-display font-semibold text-2xl text-foreground">Page Not Found</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        The page <span className="font-medium text-foreground">/{pageName}</span> doesn't exist or may have been moved.
                    </p>
                </div>

                {isAdmin && (
                    <div className="p-4 bg-secondary rounded-lg border border-border text-left">
                        <p className="text-sm font-medium text-foreground">Admin Note</p>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                            This route has no matching page. If a new page was expected here, create it and add the route.
                        </p>
                    </div>
                )}

                <div className="space-y-3">
                    <Link to="/">
                        <Button size="lg" className="w-full rounded-xl">
                            <Home className="w-4 h-4 mr-2" /> Go Home
                        </Button>
                    </Link>
                    <div className="flex gap-3">
                        <Link to="/marketplace" className="flex-1">
                            <Button variant="outline" className="w-full rounded-xl">
                                <Search className="w-4 h-4 mr-2" /> Marketplace
                            </Button>
                        </Link>
                        <Link to="/support" className="flex-1">
                            <Button variant="outline" className="w-full rounded-xl">
                                <HelpCircle className="w-4 h-4 mr-2" /> Support
                            </Button>
                        </Link>
                    </div>
                </div>

                <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to hyperr
                </Link>
            </div>
        </div>
    );
}