<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Contacts/Index', [
            'contacts' => Contact::latest()->paginate(20),
        ]);
    }

    public function show(Contact $contact)
    {
        $contact->update(['is_read' => true]);

        return Inertia::render('Admin/Contacts/Show', [
            'contact' => $contact,
        ]);
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();

        return redirect()->route('admin.contacts.index')->with('success', 'Contact deleted.');
    }
}
