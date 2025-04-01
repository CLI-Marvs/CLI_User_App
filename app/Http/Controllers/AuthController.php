<?php

namespace App\Http\Controllers;

use Log;
use App\Models\User;
use App\Models\Employee;
use App\Models\ActivityLog;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use App\Services\EmployeeFeaturePermissionService;



class AuthController extends Controller
{
    protected $permissionService;

    public function __construct(EmployeeFeaturePermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    public function redirect(Request $request)
    {
        return Socialite::driver("google")->redirect();
    }

    /*   public function callback(Request $request)
    {
        $crsUser = ['rosemarie@cebulandmasters.com', 'jdadvincula@cebulandmasters.com', 'mocastillo@cebulandmasters.com'];
        try {
            if (!$request->has('code')) {
                return redirect('/')->with('error', 'Authentication failed. Missing code parameter.');
            }
        
            $googleUser = Socialite::driver("google")->user();
        
            $explodeName = explode(' ', $googleUser->getName());
        
            if (count($explodeName) > 2) {
                $firstName = $explodeName[0];
                $lastName = $explodeName[count($explodeName) - 1];
                $name = [$firstName, $lastName];
            } else {
                $name = $explodeName;
            }
        
            $department = in_array($googleUser->email, $crsUser) ? 'CRS' : null;
        
            $user = Employee::updateOrCreate(
                ['google_id' => $googleUser->id],
                [
                    'firstname' => $name[0],
                    'lastname' => $name[1],
                    'employee_email' => $googleUser->email,
                    'email_verify_at' => now(),
                    'profile_picture' => $googleUser->avatar,
                    'department' => $department 
                ]
            );
        
            Auth::login($user);
        
            $token = $user->createToken('authToken')->plainTextToken;
            return redirect(config("app.frontend_url") . "/callback?token=" . $token);
        
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    } */

    public function callback(Request $request)
    {

        try {
            $googleUser = Socialite::driver("google")->user();
            // Log::info('Google callback request', [
            //     'request' => $request->all(),
            //     $googleUser
            // ]);
            /*   if (!$request->has('code')) {
                return redirect('/')->with('error', 'Authentication failed. Missing code parameter.');                <?php
            } */
            Log::error('Google OAuth error', ['error' => 'An error occurred during Google OAuth callback.']);

            if (!$googleUser->email || strpos($googleUser->email, '@cebulandmasters.com') === false) {
                ActivityLog::create([
                    'user_id' => null, // Since the user does not exist in the system
                    'action' => 'login_failed',
                    'ip_address' => $request->ip(),
                    'device' => $request->header('User-Agent'),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                return redirect('/?error=' . urlencode('Authentication failed. You need to use your CLI email.'));
            }


            $explodeName = explode(' ', $googleUser->getName());

            /* if (count($explodeName) > 1) {
                $firstName = $explodeName[0];
                $lastName = $explodeName[count($explodeName) - 1];
            } else {
                $firstName = $explodeName[0];
                $lastName = null;
            } */

            $user = Employee::where('employee_email', $googleUser->email)->first();


            if (!$user) {
                // return redirect('/?error=' . urlencode('Email does not exist'));
                return redirect('/?error=' .
                    urlencode('Email ' . $googleUser->email . ' doest not exist',));
            } else {
                // Get the real IP address
                $ipAddress = $request->header('X-Forwarded-For')
                    ? explode(',', $request->header('X-Forwarded-For'))[0]
                    : $request->ip();
                $user->update([
                    'google_id' => $googleUser->id,
                    'email_verify_at' => now(),
                    'profile_picture' => $googleUser->avatar,
                    'updated_at' => now(),
                    'created_at' => now()
                ]);
                ActivityLog::create([
                    'user_id' => $user->id,
                    'action' => 'login_success',
                    'ip_address' => $ipAddress,
                    'device' => $request->header('User-Agent'),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
            $userAccessData = $this->permissionService->getUserAccessData($user);

            Auth::login($user);

            $token = $user->createToken('authToken')->plainTextToken;
            $userAccessDataEncoded  = urlencode(json_encode($userAccessData));

            // Redirect with token and permissions
            return redirect(config("app.frontend_url") . "/callback?token=" . $token . "&userAccessData=" . $userAccessDataEncoded);
        } catch (\Exception $e) {
            return redirect('/')->with('error', 'Authentication failed. Missing code parameter.');
        }
    }



    public function logout(Request $request)
    {
        $user = $request->user();
        $ipAddress = $request->header('X-Forwarded-For')
            ? explode(',', $request->header('X-Forwarded-For'))[0]
            : $request->ip();
            
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'logout_account',
            'ip_address' => $ipAddress,
            'device' => $request->header('User-Agent'),
            'created_at' => now(),
            'updated_at' => now()
        ]);
        $user->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully'], 200);
    }
}
