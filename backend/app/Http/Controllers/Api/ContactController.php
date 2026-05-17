<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactFormMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        try {
            Mail::to('admin@cabinet.com')->send(new ContactFormMail($validated));

            return response()->json([
                'message' => 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur est survenue lors de l\'envoi du message.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
