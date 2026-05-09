<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ForceJsonResponse
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $request->headers->set('Accept', 'application/json');
        
        $response = $next($request);
        
        // Prevent redirects by converting them to JSON responses
        if ($response instanceof \Illuminate\Http\RedirectResponse) {
            return response()->json([
                'message' => 'Redirect prevented',
                'redirect_url' => $response->getTargetUrl(),
            ], 200);
        }
        
        return $response;
    }
}
