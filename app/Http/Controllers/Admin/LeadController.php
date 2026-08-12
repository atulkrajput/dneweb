<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Service;
use App\Services\FacebookConversionsApi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeadController extends Controller
{
    public function index(Request $request)
    {
        $query = Lead::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%");
            });
        }

        $leads = $query->latest()->paginate(20)->withQueryString();

        $stats = [
            'total' => Lead::count(),
            'new' => Lead::status('new')->count(),
            'qualified' => Lead::status('qualified')->count(),
            'won' => Lead::status('won')->count(),
        ];

        return Inertia::render('Admin/Leads/Index', [
            'leads' => $leads,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function create()
    {
        $services = Service::active()->ordered()->pluck('title', 'slug');

        return Inertia::render('Admin/Leads/Create', [
            'services' => $services,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:100',
            'interested_service' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:5000',
            'status' => 'nullable|string|in:' . implode(',', Lead::STATUSES),
        ]);

        $lead = Lead::create($validated);
        $lead->logActivity('created', 'Lead was created manually.');

        return redirect()->route('admin.leads.show', $lead)->with('success', 'Lead created.');
    }

    public function show(Lead $lead)
    {
        $lead->load(['activities.user', 'contact', 'client']);
        $internalNotes = $lead->notes()->with('user')->get();
        $services = Service::active()->ordered()->pluck('title', 'slug');

        return Inertia::render('Admin/Leads/Show', [
            'lead' => $lead,
            'services' => $services,
            'internalNotes' => $internalNotes,
        ]);
    }

    public function update(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:100',
            'interested_service' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:5000',
            'status' => 'required|string|in:' . implode(',', Lead::STATUSES),
        ]);

        $oldStatus = $lead->status;
        $lead->update($validated);

        // Log status change
        if ($oldStatus !== $validated['status']) {
            $lead->logActivity('status_changed', "Status changed from {$oldStatus} to {$validated['status']}.", [
                'old_status' => $oldStatus,
                'new_status' => $validated['status'],
            ]);
        } else {
            $lead->logActivity('updated', 'Lead details were updated.');
        }

        return redirect()->route('admin.leads.show', $lead)->with('success', 'Lead updated.');
    }

    public function destroy(Lead $lead)
    {
        $lead->delete();

        return redirect()->route('admin.leads.index')->with('success', 'Lead deleted.');
    }

    public function updateStatus(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:' . implode(',', Lead::STATUSES),
        ]);

        // Enforce valid transitions
        $allowed = $this->getAllowedTransitions($lead->status);
        if (!in_array($validated['status'], $allowed)) {
            return back()->with('error', 'Invalid status transition.');
        }

        $oldStatus = $lead->status;
        $lead->update(['status' => $validated['status']]);

        $lead->logActivity('status_changed', "Status changed from {$oldStatus} to {$validated['status']}.", [
            'old_status' => $oldStatus,
            'new_status' => $validated['status'],
        ]);

        // Send CRM event to Facebook Conversions API
        $this->sendFacebookConversionEvent($lead, $validated['status']);

        $statusLabels = [
            'contacted' => 'Lead approved and moved to Contacted.',
            'qualified' => 'Lead qualified successfully.',
            'won' => 'Lead marked as Won!',
            'lost' => 'Lead marked as Lost.',
        ];

        $message = $statusLabels[$validated['status']] ?? 'Lead status updated.';

        return back()->with('success', $message);
    }

    /**
     * Send a conversion event to Facebook when a lead changes status.
     */
    private function sendFacebookConversionEvent(Lead $lead, string $newStatus): void
    {
        $eventName = FacebookConversionsApi::mapStatusToEventName($newStatus);

        if (!$eventName) {
            return;
        }

        try {
            $fbApi = new FacebookConversionsApi();
            $fbApi->sendLeadEvent($lead, $eventName);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send Facebook conversion event', [
                'lead_id' => $lead->id,
                'status' => $newStatus,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function getAllowedTransitions(string $currentStatus): array
    {
        return match ($currentStatus) {
            'new' => ['contacted', 'lost'],
            'contacted' => ['qualified', 'lost'],
            'qualified' => ['proposal_sent', 'won', 'lost'],
            'proposal_sent' => ['negotiation', 'won', 'lost'],
            'negotiation' => ['won', 'lost'],
            default => [],
        };
    }
}
