<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Lead;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $query = Client::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('company', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $clients = $query->latest()->paginate(20)->withQueryString();

        $stats = [
            'total' => Client::count(),
            'active' => Client::active()->count(),
            'inactive' => Client::status('inactive')->count(),
        ];

        return Inertia::render('Admin/Clients/Index', [
            'clients' => $clients,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Clients/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:1000',
            'country' => 'nullable|string|max:100',
            'gst_vat' => 'nullable|string|max:100',
            'industry' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:5000',
            'status' => 'nullable|string|in:' . implode(',', Client::STATUSES),
        ]);

        $client = Client::create($validated);

        return redirect()->route('admin.clients.show', $client)->with('success', 'Client created.');
    }

    public function show(Client $client)
    {
        $client->load(['lead', 'projects']);
        $internalNotes = $client->notes()->with('user')->get();

        return Inertia::render('Admin/Clients/Show', [
            'client' => $client,
            'internalNotes' => $internalNotes,
        ]);
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'company' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:1000',
            'country' => 'nullable|string|max:100',
            'gst_vat' => 'nullable|string|max:100',
            'industry' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:5000',
            'status' => 'required|string|in:' . implode(',', Client::STATUSES),
        ]);

        $client->update($validated);

        return redirect()->route('admin.clients.show', $client)->with('success', 'Client updated.');
    }

    public function destroy(Client $client)
    {
        $client->delete();

        return redirect()->route('admin.clients.index')->with('success', 'Client deleted.');
    }

    /**
     * Convert a won lead into a client.
     */
    public function convertFromLead(Lead $lead)
    {
        // Prevent duplicate conversion
        if ($lead->client) {
            return redirect()->route('admin.clients.show', $lead->client)
                ->with('success', 'This lead has already been converted.');
        }

        $client = Client::create([
            'lead_id' => $lead->id,
            'company' => $lead->company ?: $lead->name,
            'contact_person' => $lead->name,
            'email' => $lead->email,
            'phone' => $lead->phone,
            'country' => $lead->country,
            'status' => Client::STATUS_ACTIVE,
        ]);

        // Log activity on lead
        $lead->logActivity('converted', 'Lead converted to client.', [
            'client_id' => $client->id,
        ]);

        return redirect()->route('admin.clients.show', $client)
            ->with('success', 'Lead converted to client successfully.');
    }
}
