<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Project;
use App\Models\Proposal;
use App\Models\User;
use App\Notifications\ProposalAcceptedNotification;

class ProposalAcceptController extends Controller
{
    public function accept(Proposal $proposal)
    {
        // Already accepted or rejected
        if ($proposal->status === Proposal::STATUS_ACCEPTED) {
            return inertia('ProposalAccepted', [
                'proposal' => $proposal,
                'alreadyAccepted' => true,
            ]);
        }

        if ($proposal->status === Proposal::STATUS_REJECTED) {
            abort(410, 'This proposal is no longer available.');
        }

        // Accept the proposal
        $proposal->update(['status' => Proposal::STATUS_ACCEPTED]);

        // Notify admin users
        User::all()->each(fn ($user) => $user->notify(new ProposalAcceptedNotification($proposal)));

        // Determine client
        $clientId = $proposal->client_id;
        if (!$clientId && $proposal->lead_id) {
            $lead = Lead::with('client')->find($proposal->lead_id);
            if ($lead && $lead->client) {
                $clientId = $lead->client->id;
            }
            // Log activity on lead
            if ($lead) {
                $lead->logActivity('status_changed', "Proposal {$proposal->number} accepted by client.", [
                    'proposal_id' => $proposal->id,
                ]);
            }
        }

        // Create project if we have a client
        if ($clientId) {
            Project::create([
                'client_id' => $clientId,
                'name' => $proposal->title,
                'description' => "Created from proposal {$proposal->number}",
                'services' => $proposal->services,
                'budget' => $proposal->total,
                'priority' => 'medium',
                'status' => 'planning',
            ]);
        }

        return inertia('ProposalAccepted', [
            'proposal' => $proposal,
            'alreadyAccepted' => false,
        ]);
    }
}
