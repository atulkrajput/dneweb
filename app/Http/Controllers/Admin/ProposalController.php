<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Lead;
use App\Models\Project;
use App\Models\Proposal;
use App\Models\Service;
use App\Models\User;
use App\Notifications\ProposalAcceptedNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProposalController extends Controller
{
    public function index(Request $request)
    {
        $query = Proposal::with(['lead:id,name,company', 'client:id,company']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('number', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhereHas('lead', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('client', fn ($q) => $q->where('company', 'like', "%{$search}%"));
            });
        }

        $proposals = $query->latest()->paginate(20)->withQueryString();

        $stats = [
            'total' => Proposal::count(),
            'sent' => Proposal::status('sent')->count(),
            'accepted' => Proposal::status('accepted')->count(),
            'rejected' => Proposal::status('rejected')->count(),
        ];

        return Inertia::render('Admin/Proposals/Index', [
            'proposals' => $proposals,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function create(Request $request)
    {
        $leads = Lead::open()->orderBy('name')->get(['id', 'name', 'company']);
        $clients = Client::active()->orderBy('company')->pluck('company', 'id');
        $services = Service::active()->ordered()->pluck('title', 'slug');
        $nextNumber = Proposal::generateNumber();

        return Inertia::render('Admin/Proposals/Create', [
            'leads' => $leads,
            'clients' => $clients,
            'services' => $services,
            'nextNumber' => $nextNumber,
            'preselectedLead' => $request->input('lead_id'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'number' => 'required|string|unique:proposals,number',
            'lead_id' => 'nullable|exists:leads,id',
            'client_id' => 'nullable|exists:clients,id',
            'title' => 'required|string|max:255',
            'services' => 'nullable|array',
            'deliverables' => 'nullable|array',
            'timeline' => 'nullable|string|max:500',
            'pricing' => 'nullable|array',
            'pricing.*.description' => 'required|string|max:255',
            'pricing.*.amount' => 'required|numeric|min:0',
            'terms' => 'nullable|string|max:5000',
            'notes' => 'nullable|string|max:5000',
            'status' => 'nullable|string|in:' . implode(',', Proposal::STATUSES),
            'valid_until' => 'nullable|date',
        ]);

        $total = collect($validated['pricing'] ?? [])->sum('amount');

        $proposal = Proposal::create(array_merge($validated, [
            'total' => $total,
            'status' => $validated['status'] ?? 'draft',
        ]));

        // Log activity on lead if linked
        if ($proposal->lead_id) {
            $lead = Lead::find($proposal->lead_id);
            if ($lead) {
                $lead->logActivity('proposal_sent', "Proposal {$proposal->number} created.", [
                    'proposal_id' => $proposal->id,
                    'total' => $total,
                ]);
                // Auto-update lead status to proposal_sent if still earlier
                if (in_array($lead->status, ['new', 'contacted', 'qualified'])) {
                    $lead->update(['status' => 'proposal_sent']);
                }
            }
        }

        return redirect()->route('admin.proposals.show', $proposal)->with('success', 'Proposal created.');
    }

    public function show(Proposal $proposal)
    {
        $proposal->load(['lead', 'client']);
        $clients = Client::active()->orderBy('company')->pluck('company', 'id');

        return Inertia::render('Admin/Proposals/Show', [
            'proposal' => $proposal,
            'clients' => $clients,
        ]);
    }

    public function update(Request $request, Proposal $proposal)
    {
        $validated = $request->validate([
            'lead_id' => 'nullable|exists:leads,id',
            'client_id' => 'nullable|exists:clients,id',
            'title' => 'required|string|max:255',
            'services' => 'nullable|array',
            'deliverables' => 'nullable|array',
            'timeline' => 'nullable|string|max:500',
            'pricing' => 'nullable|array',
            'pricing.*.description' => 'required|string|max:255',
            'pricing.*.amount' => 'required|numeric|min:0',
            'terms' => 'nullable|string|max:5000',
            'notes' => 'nullable|string|max:5000',
            'status' => 'required|string|in:' . implode(',', Proposal::STATUSES),
            'valid_until' => 'nullable|date',
        ]);

        $total = collect($validated['pricing'] ?? [])->sum('amount');
        $proposal->update(array_merge($validated, ['total' => $total]));

        return redirect()->route('admin.proposals.show', $proposal)->with('success', 'Proposal updated.');
    }

    public function destroy(Proposal $proposal)
    {
        $proposal->delete();
        return redirect()->route('admin.proposals.index')->with('success', 'Proposal deleted.');
    }

    /**
     * Accept proposal and create a project from it.
     */
    public function accept(Proposal $proposal)
    {
        $proposal->update(['status' => Proposal::STATUS_ACCEPTED]);

        // Notify all admin users
        User::all()->each(fn ($user) => $user->notify(new ProposalAcceptedNotification($proposal)));

        // Determine client
        $clientId = $proposal->client_id;
        if (!$clientId && $proposal->lead_id) {
            $lead = Lead::with('client')->find($proposal->lead_id);
            if ($lead && $lead->client) {
                $clientId = $lead->client->id;
            }
        }

        // Create project if we have a client
        if ($clientId) {
            $project = Project::create([
                'client_id' => $clientId,
                'name' => $proposal->title,
                'description' => "Created from proposal {$proposal->number}",
                'services' => $proposal->services,
                'budget' => $proposal->total,
                'priority' => 'medium',
                'status' => 'planning',
            ]);

            return redirect()->route('admin.projects.show', $project)
                ->with('success', 'Proposal accepted and project created.');
        }

        return redirect()->route('admin.proposals.show', $proposal)
            ->with('success', 'Proposal accepted.');
    }
}
