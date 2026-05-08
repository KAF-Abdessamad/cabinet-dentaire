<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class PatientRegistrationController extends Controller
{
    /**
     * Register a new patient account.
     */
    public function store(Request $request)
    {
        $existingUser = User::where('email', $request->input('email'))->first();

        $validator = Validator::make($request->all(), [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($existingUser?->id),
            ],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['required', 'string', 'max:20'],
            'birth_date' => ['required', 'date'],
            'gender' => ['required', 'in:male,female'],
            'address' => ['nullable', 'string', 'max:500'],
            'cin' => ['nullable', 'string', 'max:20'],
            'blood_group' => ['nullable', 'string', 'max:5'],
            'allergies' => ['nullable', 'string', 'max:500'],
            'medical_history' => ['nullable', 'string'],
        ], [
            'email.unique' => "Cet email est déjà utilisé. Connectez‑vous ou utilisez un autre email.",
            'password.confirmed' => "La confirmation du mot de passe ne correspond pas.",
        ]);

        if ($validator->fails()) {
            \Log::warning('Patient registration validation failed', [
                'errors' => $validator->errors()->toArray(),
                'payload_keys' => array_keys($request->all()),
            ]);

            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $gender = match ($request->gender) {
            'male' => 'M',
            'female' => 'F',
            default => $request->gender,
        };

        [$user, $patient] = DB::transaction(function () use ($request, $existingUser, $gender) {
            $user = $existingUser;

            // If a previous attempt created the user but failed before creating the patient,
            // allow retry by completing the profile and updating password.
            if ($user) {
                if ($user->patient) {
                    return [null, null];
                }

                $user->forceFill([
                    'name' => $request->first_name . ' ' . $request->last_name,
                    'password' => Hash::make($request->password),
                ])->save();
            } else {
                $user = User::create([
                    'name' => $request->first_name . ' ' . $request->last_name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                ]);
            }

            if (! $user->hasRole('patient')) {
                $user->assignRole('patient');
            }

            $patient = Patient::create([
                'user_id' => $user->id,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'birth_date' => $request->birth_date,
                'gender' => $gender,
                'address' => $request->address,
                'cin' => $request->cin,
                'blood_group' => $request->blood_group,
                'allergies' => $request->allergies,
                'medical_history' => $request->medical_history,
            ]);

            return [$user, $patient];
        });

        if (! $user || ! $patient) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => ['email' => ["Cet email est déjà utilisé. Connectez‑vous ou utilisez un autre email."]],
            ], 422);
        }

        // Log the user in
        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Compte patient créé avec succès',
            'user' => $user,
            'patient' => $patient,
        ], 201);
    }
}
