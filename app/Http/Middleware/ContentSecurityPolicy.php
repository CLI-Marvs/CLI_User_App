<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ContentSecurityPolicy
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Detect if running in local (dev) mode
        $isDev = app()->environment('local');

        // Base CSP policy
        $csp = "default-src 'self'; ";

        // Allow Google Tag Manager & other trusted sources
        $csp .= "script-src 'self' https://trusted.cdn.com https://www.googletagmanager.com https://www.google-analytics.com";

        // Allow Vite and HMR in development
        if ($isDev) {
            $csp .= " http://localhost:5173 'unsafe-inline' 'unsafe-eval'";
        }

        // Allow inline styles for Tailwind/Vite
        $csp .= "; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ";

        // Allow images and fonts
        $csp .= "img-src 'self' data:; font-src 'self' https://fonts.gstatic.com; object-src 'none'; frame-ancestors 'none';";

        // Apply the CSP header
        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }
}
