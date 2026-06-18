<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;

class ContactFormController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'company' => 'nullable|string|max:255',
            'inquiry_type' => 'required|string|in:ai-automation,saas-products,web-mobile,it-managed,not-sure',
            'message' => 'nullable|string|max:5000',
        ]);

        Contact::create($validated);

        return back()->with('success', 'Message sent successfully!');
    }
}
