<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;



class AuthController extends Controller
{
    public function redirect(Request $request)
    {
        return Socialite::driver("google")->redirect();
    }

    public function callback(Request $request)
    {
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
            

            $user = Employee::updateOrCreate(
                ['google_id' => $googleUser->id],
                [
                    'firstname' => $name[0],
                    'lastname' => $name[1],
                    'employee_email' => $googleUser->email,
                    'email_verify_at' => now(),
                 /*    'login_type' => "sso" */
                ]
            );
            Auth::login($user);

            $token = $user->createToken('authToken')->plainTextToken;
            return redirect(config("app.frontend_url") . "/callback?token=" . $token);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        $user->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully'], 200);
    }
}
