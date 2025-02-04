<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RemoveDebugHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Check if the environment is production
        if (app()->environment('local')) {
            // Log to verify if middleware is applied
            
            // Remove specific headers
            $response->headers->remove('X-Debug-Info');

            // Sanitize response data (if applicable)
            $data = json_decode($response->getContent(), true);

            // Example of sanitizing sensitive data
            if (isset($data['sensitive_field'])) {
                unset($data['sensitive_field']);  // Remove sensitive field
            }

            // Re-encode the sanitized data and set it back to the response
            $response->setContent(json_encode($data));
        }

        return $response;
    }
}
