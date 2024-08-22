<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Container\Attributes\Auth;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;


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
                return redirect('/login')->with('error', 'Authentication failed. Missing code parameter.');
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
            

            $user = User::updateOrCreate(
                ['google_id' => $googleUser->id],
                [
                    'fname' => $name[0],
                    'lname' => $name[1],
                    'email' => $googleUser->email,
                    'password' => Str::password(12),
                    'email_verified_at' => now(),
                    'login_type' => "sso"
                ]
            );
            Auth::login($user);

            $token = $user->createToken('authToken')->plainTextToken;
            return redirect(config("app.frontend_url") . "/callback?token=" . $token);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }
}
