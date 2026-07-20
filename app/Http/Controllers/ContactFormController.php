<?php

namespace App\Http\Controllers;

use App\Mail\ContactAdminNotification;
use App\Mail\ContactThankYou;
use App\Models\Contact;
use App\Models\Lead;
use App\Models\User;
use App\Notifications\NewLeadNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactFormController extends Controller
{
    public function store(Request $request)
    {
        // Verify reCAPTCHA if configured
        $recaptchaSecret = config('services.recaptcha.secret_key');
        if ($recaptchaSecret) {
            $request->validate([
                'recaptcha_token' => 'required|string',
            ], [
                'recaptcha_token.required' => 'Human verification failed. Please try again.',
            ]);

            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $recaptchaSecret,
                'response' => $request->input('recaptcha_token'),
                'remoteip' => $request->ip(),
            ]);

            $result = $response->json();

            if (!($result['success'] ?? false) || ($result['score'] ?? 0) < 0.5) {
                return back()->withErrors([
                    'recaptcha_token' => 'Human verification failed. Please try again.',
                ]);
            }
        }

        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'company' => 'nullable|string|max:255',
            'inquiry_type' => 'required|string|in:ai-automation,saas-products,web-mobile,it-managed,not-sure',
            'message' => 'nullable|string|max:5000',
            'tracking' => 'nullable|array',
            'tracking.landing_url' => 'nullable|string|max:2048',
            'tracking.referrer' => 'nullable|string|max:2048',
            'tracking.utm_source' => 'nullable|string|max:255',
            'tracking.utm_medium' => 'nullable|string|max:255',
            'tracking.utm_campaign' => 'nullable|string|max:255',
            'tracking.utm_content' => 'nullable|string|max:255',
            'tracking.utm_term' => 'nullable|string|max:255',
            'tracking.gclid' => 'nullable|string|max:255',
            'tracking.fbclid' => 'nullable|string|max:255',
            'tracking.msclkid' => 'nullable|string|max:255',
            'tracking.browser' => 'nullable|string|max:100',
            'tracking.device' => 'nullable|string|max:50',
            'tracking.first_visit_at' => 'nullable|string|max:50',
            'tracking.last_visit_at' => 'nullable|string|max:50',
        ]);

        $contact = Contact::create([
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'company' => $validated['company'] ?? null,
            'inquiry_type' => $validated['inquiry_type'],
            'message' => $validated['message'] ?? null,
        ]);

        // Build lead data with tracking info
        $tracking = $validated['tracking'] ?? [];
        $lead = Lead::create([
            'contact_id' => $contact->id,
            'name' => $validated['full_name'],
            'company' => $validated['company'],
            'email' => $validated['email'],
            'interested_service' => $validated['inquiry_type'],
            'notes' => $validated['message'],
            'status' => Lead::STATUS_NEW,
            // Campaign tracking
            'landing_url' => $tracking['landing_url'] ?? null,
            'referrer' => $tracking['referrer'] ?? null,
            'utm_source' => $tracking['utm_source'] ?? null,
            'utm_medium' => $tracking['utm_medium'] ?? null,
            'utm_campaign' => $tracking['utm_campaign'] ?? null,
            'utm_content' => $tracking['utm_content'] ?? null,
            'utm_term' => $tracking['utm_term'] ?? null,
            'gclid' => $tracking['gclid'] ?? null,
            'fbclid' => $tracking['fbclid'] ?? null,
            'msclkid' => $tracking['msclkid'] ?? null,
            'browser' => $tracking['browser'] ?? null,
            'device' => $tracking['device'] ?? null,
            'ip_address' => $request->ip(),
            'first_visit_at' => $tracking['first_visit_at'] ?? null,
            'last_visit_at' => $tracking['last_visit_at'] ?? null,
        ]);

        $lead->logActivity('created', 'Lead auto-created from contact form submission.', [
            'source' => 'contact_form',
            'contact_id' => $contact->id,
            'utm_source' => $tracking['utm_source'] ?? null,
            'utm_campaign' => $tracking['utm_campaign'] ?? null,
        ]);

        // Notify all admin users of new lead (database notification)
        User::all()->each(fn ($user) => $user->notify(new NewLeadNotification($lead)));

        // Send email notifications via Resend
        try {
            // Thank you email to the user
            Mail::to($contact->email)->send(new ContactThankYou($contact));

            // Admin notification email
            Mail::to('letsbuild@dneconsultants.com')->send(new ContactAdminNotification($contact));
        } catch (\Exception $e) {
            Log::error('Failed to send contact form emails: ' . $e->getMessage());
        }

        return back()->with('success', 'Message sent successfully!');
    }
}
